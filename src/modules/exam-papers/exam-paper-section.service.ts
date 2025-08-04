import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { ExamSectionRepository } from "./exam-paper-section.repository";
import { ExamPaperRepository } from "./exam-paper.repository";
import { AddMultipleQuestionsToSectionDto, AddQuestionToSectionDto, CreateSectionDto, UpdateQuestionInSectionDto, UpdateSectionDto } from "./dto/exam-section.dto";

export class ExamPaperSectionService {
    constructor(
    private readonly examSectionRepository: ExamSectionRepository,
    private examPaperRepository: ExamPaperRepository,
  ) {}
  async getExamPaperById(id: string) {
    const examPaper = await this.examPaperRepository.findById(id);
    if (!examPaper) {
      throw new NotFoundException(`Exam paper with ID ${id} not found`);
    }
    return examPaper;
  }

  async createSection(examPaperId: string, data: CreateSectionDto) {
    // Verify exam paper exists
    await this.getExamPaperById(examPaperId);

    // Business validation
    if (data.marksPerQuestion <= 0) {
      throw new BadRequestException('Marks per question must be greater than 0');
    }
    if (data.questionsToAnswer <= 0) {
      throw new BadRequestException('Questions to answer must be greater than 0');
    }
    if (data.totalQuestions <= 0) {
      throw new BadRequestException('Total questions must be greater than 0');
    }
    if (data.questionsToAnswer > data.totalQuestions) {
      throw new BadRequestException('Questions to answer cannot be greater than total questions');
    }
    if (data.sectionNumber <= 0) {
      throw new BadRequestException('Section number must be greater than 0');
    }

    // Check if section number already exists for this exam paper
    const existingSections = await this.examSectionRepository.getSectionsByExamPaperId(examPaperId);
    const sectionNumberExists = existingSections.some(section => section.sectionNumber === data.sectionNumber);
    if (sectionNumberExists) {
      throw new ConflictException(`Section number ${data.sectionNumber} already exists for this exam paper`);
    }

    return this.examSectionRepository.createSection(examPaperId, data);
  }

  async getSectionsByExamPaper(examPaperId: string) {
    // Verify exam paper exists
    await this.getExamPaperById(examPaperId);
    
    return this.examSectionRepository.getSectionsByExamPaperId(examPaperId);
  }

  async getSectionById(sectionId: string) {
    const section = await this.examSectionRepository.getSectionById(sectionId);
    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }
    return section;
  }

  async updateSection(sectionId: string, data: UpdateSectionDto) {
    // Check if section exists
    await this.getSectionById(sectionId);

    // Business validation
    if (data.marksPerQuestion !== undefined && data.marksPerQuestion <= 0) {
      throw new BadRequestException('Marks per question must be greater than 0');
    }
    if (data.questionsToAnswer !== undefined && data.questionsToAnswer <= 0) {
      throw new BadRequestException('Questions to answer must be greater than 0');
    }
    if (data.totalQuestions !== undefined && data.totalQuestions <= 0) {
      throw new BadRequestException('Total questions must be greater than 0');
    }

    // If both questionsToAnswer and totalQuestions are being updated, validate them together
    const currentSection = await this.examSectionRepository.getSectionById(sectionId);
    const questionsToAnswer = data.questionsToAnswer ?? currentSection.questionsToAnswer;
    const totalQuestions = data.totalQuestions ?? currentSection.totalQuestions;
    
    if (questionsToAnswer > totalQuestions) {
      throw new BadRequestException('Questions to answer cannot be greater than total questions');
    }

    return this.examSectionRepository.updateSection(sectionId, data);
  }

  async deleteSection(sectionId: string) {
    // Check if section exists
    await this.getSectionById(sectionId);
    
    return this.examSectionRepository.deleteSection(sectionId);
  }

  async getSectionWithQuestions(sectionId: string) {
    const section = await this.examSectionRepository.getSectionWithQuestions(sectionId);
    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }
    return section;
  }

  // ========================
  // QUESTION MANAGEMENT IN SECTIONS
  // ========================

  async addQuestionToSection(sectionId: string, data: AddQuestionToSectionDto) {
    // Check if section exists
    const section = await this.getSectionById(sectionId);

    // Check if question already exists in this section
    const questionExists = await this.examSectionRepository.isQuestionInSection(sectionId, data.questionId);
    if (questionExists) {
      throw new ConflictException('Question already exists in this section');
    }

    // Get current question count
    const currentQuestions = await this.examSectionRepository.getQuestionsInSection(sectionId);
    if (currentQuestions.length >= section.totalQuestions) {
      throw new BadRequestException(`Cannot add more questions. Section allows maximum ${section.totalQuestions} questions`);
    }

    // Auto-assign question number if not provided
    let questionNumber = data.questionNumber;
    if (!questionNumber) {
      questionNumber = await this.examSectionRepository.getNextQuestionNumber(sectionId);
    } else {
      // Check if question number already exists
      const numberExists = currentQuestions.some(q => q.questionNumber === questionNumber);
      if (numberExists) {
        throw new ConflictException(`Question number ${questionNumber} already exists in this section`);
      }
    }

    return this.examSectionRepository.addQuestionToSection(sectionId, {
      ...data,
      questionNumber
    });
  }

  async addMultipleQuestionsToSection(sectionId: string, data: AddMultipleQuestionsToSectionDto) {
    // Check if section exists
    const section = await this.getSectionById(sectionId);

    // Get current questions
    const currentQuestions = await this.examSectionRepository.getQuestionsInSection(sectionId);
    
    // Check if adding these questions would exceed the limit
    if (currentQuestions.length + data.questions.length > section.totalQuestions) {
      throw new BadRequestException(
        `Cannot add ${data.questions.length} questions. Section allows maximum ${section.totalQuestions} questions, and ${currentQuestions.length} already exist`
      );
    }

    // Check for duplicate questions
    const existingQuestionIds = new Set(currentQuestions.map(q => q.questionDetails.id));
    const duplicates = data.questions.filter(q => existingQuestionIds.has(q.questionId));
    if (duplicates.length > 0) {
      throw new ConflictException(`Some questions already exist in this section: ${duplicates.map(d => d.questionId).join(', ')}`);
    }

    // Auto-assign question numbers if not provided and check for duplicates
    let nextQuestionNumber = await this.examSectionRepository.getNextQuestionNumber(sectionId);
    const usedNumbers = new Set(currentQuestions.map(q => q.questionNumber));
    
    const questionsWithNumbers = data.questions.map(question => {
      let questionNumber = question.questionNumber;
      
      if (!questionNumber) {
        // Auto-assign next available number
        while (usedNumbers.has(nextQuestionNumber)) {
          nextQuestionNumber++;
        }
        questionNumber = nextQuestionNumber;
        usedNumbers.add(questionNumber);
        nextQuestionNumber++;
      } else {
        // Check if manually assigned number is already used
        if (usedNumbers.has(questionNumber)) {
          throw new ConflictException(`Question number ${questionNumber} already exists in this section`);
        }
        usedNumbers.add(questionNumber);
      }

      return {
        ...question,
        questionNumber
      };
    });

    return this.examSectionRepository.addQuestionsToSection(sectionId, questionsWithNumbers);
  }

  async getQuestionsInSection(sectionId: string) {
    // Check if section exists
    await this.getSectionById(sectionId);
    
    return this.examSectionRepository.getQuestionsInSection(sectionId);
  }

  async removeQuestionFromSection(sectionId: string, questionId: string) {
    // Check if section exists
    await this.getSectionById(sectionId);

    // Check if question exists in section
    const questionExists = await this.examSectionRepository.isQuestionInSection(sectionId, questionId);
    if (!questionExists) {
      throw new NotFoundException('Question not found in this section');
    }

    return this.examSectionRepository.removeQuestionFromSection(sectionId, questionId);
  }

  async removeQuestionFromSectionById(examPaperQuestionId: string) {
    const result = await this.examSectionRepository.removeQuestionFromSectionById(examPaperQuestionId);
    if (!result) {
      throw new NotFoundException(`Question with ID ${examPaperQuestionId} not found`);
    }
    return result;
  }

  async updateQuestionInSection(examPaperQuestionId: string, data: UpdateQuestionInSectionDto) {
    // If updating question number, check for conflicts
    if (data.questionNumber !== undefined) {
      // This would require getting the section ID first, then checking for conflicts
      // For simplicity, we'll let the database constraint handle uniqueness
    }

    // Only proceed if questionNumber is provided since it's required by the repository
    if (data.questionNumber === undefined) {
      throw new BadRequestException('Question number is required for updating question in section');
    }

    const result = await this.examSectionRepository.updateQuestionInSection(examPaperQuestionId, { questionNumber: data.questionNumber });
    if (!result) {
      throw new NotFoundException(`Question with ID ${examPaperQuestionId} not found`);
    }
    return result;
  }


}