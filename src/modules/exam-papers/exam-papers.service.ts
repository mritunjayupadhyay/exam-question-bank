import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ExamPaperRepository } from './exam-paper.repository';
import { ExamTypeRepository } from './exam-type.repository';

import { 
  CreateExamPaperDto, 
  UpdateExamPaperDto, 
  ExamPaperFilterDto,
  AddQuestionToExamPaperDto,
  UpdateExamPaperQuestionDto
} from './dto/exam-paper.dto';
import { SubjectRepository } from '../subjects/subjects.repository';
import { ClassesRepository } from '../classes/classes.repository';
import { QuestionRepository } from '../questions/questions.repository';

@Injectable()
export class ExamPaperService {
  constructor(
    private examPaperRepository: ExamPaperRepository,
    private examTypeRepository: ExamTypeRepository,
    private subjectRepository: SubjectRepository,
    private classRepository: ClassesRepository,
    private questionRepository: QuestionRepository,
  ) {}

    async searchByTitle(title: string, limit?: number, offset?: number) {
    return this.examPaperRepository.searchExamPapersByTitle(title, limit, offset);
  }

  async findByIdWithQuestions(id: string) {
    const examPaper = await this.examPaperRepository.findByIdWithQuestions(id);
    if (!examPaper) {
      throw new NotFoundException(`Exam paper with ID ${id} not found`);
    }
    return examPaper;
  }

  async filterExamPapers(filters: ExamPaperFilterDto, limit?: number, offset?: number) {
    return this.examPaperRepository.filterExamPapers(filters, limit, offset);
  }

  async create(createExamPaperDto: CreateExamPaperDto) {
    // Validate references to other entities
    await this.validateEntityReferences(
      createExamPaperDto.examTypeId,
      createExamPaperDto.subjectId,
      createExamPaperDto.classId
    );
    return this.examPaperRepository.createExamPaper(createExamPaperDto);
  }

  async update(id: string, updateExamPaperDto: UpdateExamPaperDto) {
    // Check if exam paper exists
    const examPaper = await this.examPaperRepository.findById(id);
    if (!examPaper) {
      throw new NotFoundException(`Exam paper with ID ${id} not found`);
    }
    
    // Validate references if they are being updated
    await this.validateUpdateReferences(
      updateExamPaperDto.examTypeId, 
      updateExamPaperDto.subjectId, 
      updateExamPaperDto.classId
    );
    
    return this.examPaperRepository.updateExamPaper(id, updateExamPaperDto);
  }

  async delete(id: string) {
    // Check if exam paper exists
    const examPaper = await this.examPaperRepository.findById(id);
    if (!examPaper) {
      throw new NotFoundException(`Exam paper with ID ${id} not found`);
    }
    
    return this.examPaperRepository.deleteExamPaper(id);
  }

  // Helper method to validate references to other entities for create
  private async validateEntityReferences(
    examTypeId: string, 
    subjectId: string, 
    classId: string
  ) {
    // Check if exam type exists
    const examType = await this.examTypeRepository.findById(examTypeId);
    if (!examType) {
      throw new NotFoundException(`Exam type with ID ${examTypeId} not found`);
    }
    
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

  // Helper method to validate references for updates
  private async validateUpdateReferences(
    examTypeId?: string, 
    subjectId?: string, 
    classId?: string
  ) {
    if (examTypeId) {
      const examType = await this.examTypeRepository.findById(examTypeId);
      if (!examType) {
        throw new NotFoundException(`Exam type with ID ${examTypeId} not found`);
      }
    }
    
    if (subjectId) {
      const subject = await this.subjectRepository.findById(subjectId);
      if (!subject) {
        throw new NotFoundException(`Subject with ID ${subjectId} not found`);
      }
    }
    
    if (classId) {
      const classEntity = await this.classRepository.findById(classId);
      if (!classEntity) {
        throw new NotFoundException(`Class with ID ${classId} not found`);
      }
    }
  }

  // Helper method to validate question IDs
  private async validateQuestions(questionIds: string[]) {
    for (const questionId of questionIds) {
      const question = await this.questionRepository.findById(questionId);
      if (!question) {
        throw new NotFoundException(`Question with ID ${questionId} not found`);
      }
    }
  }
}