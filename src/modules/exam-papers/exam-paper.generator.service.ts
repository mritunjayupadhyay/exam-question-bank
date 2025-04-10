import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ExamPaperRepository } from './exam-paper.repository';
import { GenerateExamPaperDto, GenerateQuestionForExamSectionDto, QuestionSectionConfig } from './dto/exam-paper-generator.dto';
import { CreateExamPaperDto, ExamPaperQuestionDto } from './dto/exam-paper.dto';
import { QuestionRepository } from '../questions/questions.repository';
import { ExamTypeRepository } from './exam-type.repository';
import { SubjectRepository } from '../subjects/subjects.repository';
import { ClassesRepository } from '../classes/classes.repository';
import { inArray } from 'drizzle-orm';
import * as schema from '../../db/schema';


@Injectable()
export class ExamPaperGeneratorService {
  constructor(
    private examPaperRepository: ExamPaperRepository,
    private questionRepository: QuestionRepository,
    private examTypeRepository: ExamTypeRepository,
    private subjectRepository: SubjectRepository,
    private classRepository: ClassesRepository,
  ) {}

  async generateExamPaper(generateDto: GenerateExamPaperDto) {
    // Validate entities
    await this.validateEntities(generateDto.examTypeId, generateDto.subjectId, generateDto.classId);
    
    // Calculate total marks from sections
    const totalMarks = generateDto.sections.reduce((sum, section) => 
      sum + section.totalMarks, 0);
    
    // Get questions for each section
    const sectionQuestionsMap = new Map<string, ExamPaperQuestionDto[]>();
    let questionCounter = 1;
    
    for (const section of generateDto.sections) {
      const questionDtos = await this.getQuestionsForSection(
        section, 
        generateDto.subjectId,
        generateDto.classId,
        questionCounter
      );
      
      sectionQuestionsMap.set(section.section, questionDtos);
      questionCounter += questionDtos.length;
    }
    
    // Flatten all questions
    const allQuestions = Array.from(sectionQuestionsMap.values()).flat();
    
    // Create the exam paper
    const createExamPaperDto: CreateExamPaperDto = {
      title: generateDto.title,
      examTypeId: generateDto.examTypeId,
      subjectId: generateDto.subjectId,
      classId: generateDto.classId,
      totalMarks: totalMarks,
      durationMinutes: generateDto.durationMinutes,
      questions: allQuestions
    };
    
    return this.examPaperRepository.createExamPaper(createExamPaperDto);
  }

  async generateQuestionsForSection(generateDto: GenerateQuestionForExamSectionDto) {
    await this.validateSubjectAndClass(generateDto.subjectId, generateDto.classId);
    return await this.getQuestionsForSection(
        generateDto.section, 
        generateDto.subjectId,
        generateDto.classId,
        1
      );
  }
  
  private async getQuestionsForSection(
    sectionConfig: QuestionSectionConfig,
    subjectId: string,
    classId: string,
    startingQuestionNumber: number = 0
  ): Promise<ExamPaperQuestionDto[]> {
    // Calculate how many questions we need of each difficulty level
    let requiredCounts: { low?: number; medium?: number; hard?: number; total: number } = { total: sectionConfig.totalQuestions };
    
    if (sectionConfig.difficultyDistribution) {
      const { low, medium, hard } = sectionConfig.difficultyDistribution;
      requiredCounts = {
        low: Math.round((low / 100) * sectionConfig.totalQuestions),
        medium: Math.round((medium / 100) * sectionConfig.totalQuestions),
        hard: Math.round((hard / 100) * sectionConfig.totalQuestions),
        total: sectionConfig.totalQuestions
      };
    }
    
    // Build a more efficient query
    const baseFilter: any = {
      subjectId,
      classId,
      marks: sectionConfig.marksPerQuestion
    };
    
    if (sectionConfig.questionType) {
      baseFilter.questionType = sectionConfig.questionType;
    }
    
    if (sectionConfig.topicIds?.length > 0) {
      // Single query with IN clause instead of multiple queries
      baseFilter.topicIds = sectionConfig.topicIds;    
    }
    
    // Execute one optimized query if no difficulty distribution
    if (!sectionConfig.difficultyDistribution) {
      // Request just what we need plus a small buffer
      const limit = Math.min(500, sectionConfig.totalQuestions * 2); 
      const questions = await this.questionRepository.filterQuestionsFullDetails(
        baseFilter, 
        limit, 
        0
      );
      
      if (questions.length < sectionConfig.totalQuestions) {
        throw new BadRequestException(
          `Not enough questions available for section "${sectionConfig.section}". ` +
          `Required: ${sectionConfig.totalQuestions}, Available: ${questions.length}`
        );
      }
      
      // Shuffle and select
      const selectedQuestions = this.shuffleArray(questions)
        .slice(0, sectionConfig.totalQuestions);
        
      return selectedQuestions.map((question, index) => ({
        questionId: question.id,
        questionNumber: startingQuestionNumber + index,
        section: sectionConfig.section,
        question
      }));
    }
    
    // For difficulty distribution, make targeted queries for each difficulty
    const difficultyQueries = await Promise.all(['low', 'medium', 'hard'].map(async difficulty => {
      if (!requiredCounts[difficulty]) return [];
      
      const difficultyFilter = { 
        ...baseFilter, 
        difficultyLevel: difficulty 
      };
      
      // Only fetch what we need plus a small buffer
      const limit = Math.min(200, requiredCounts[difficulty] * 2);
      return this.questionRepository.filterQuestionsFullDetails(difficultyFilter, limit, 0);
    }));
    
    const [lowQuestions, mediumQuestions, hardQuestions] = difficultyQueries;
    
    // Check if we have enough questions of each difficulty
    if (requiredCounts.low && lowQuestions.length < requiredCounts.low) {
      throw new BadRequestException(
        `Not enough low difficulty questions for section "${sectionConfig.section}"`
      );
    }
    
    if (requiredCounts.medium && mediumQuestions.length < requiredCounts.medium) {
      throw new BadRequestException(
        `Not enough medium difficulty questions for section "${sectionConfig.section}"`
      );
    }
    
    if (requiredCounts.hard && hardQuestions.length < requiredCounts.hard) {
      throw new BadRequestException(
        `Not enough hard difficulty questions for section "${sectionConfig.section}"`
      );
    }
    
    // Select and combine questions
    const selectedLow = this.shuffleArray(lowQuestions).slice(0, requiredCounts.low || 0);
    const selectedMedium = this.shuffleArray(mediumQuestions).slice(0, requiredCounts.medium || 0);
    const selectedHard = this.shuffleArray(hardQuestions).slice(0, requiredCounts.hard || 0);
    
    const selectedQuestions = this.shuffleArray([...selectedLow, ...selectedMedium, ...selectedHard]);
    
    return selectedQuestions.map((question, index) => ({
      questionId: question.id,
      questionNumber: startingQuestionNumber + index,
      section: sectionConfig.section,
      question
    }));
  }
  
  
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  private async validateEntities(examTypeId: string, subjectId: string, classId: string) {
    // Check if exam type exists
    const examType = await this.examTypeRepository.findById(examTypeId);
    if (!examType) {
      throw new NotFoundException(`Exam type with ID ${examTypeId} not found`);
    }
    
    await this.validateSubjectAndClass(subjectId, classId);
  }
  private async validateSubjectAndClass(subjectId: string, classId: string) {
    // Check if subject exists
    const subject = await this.subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }
    
    // Check if class exists
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }
  }
}