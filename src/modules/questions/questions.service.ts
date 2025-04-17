import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { QuestionRepository } from './questions.repository';
import { SubjectRepository } from '../subjects/subjects.repository';
import { TopicRepository } from '../subjects/topics.repository';
import { QuestionFilterDto } from './dto/filter-question.dto';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/create-question.dto';
import { QuestionDto, QuestionFullDetailsDto } from './dto/question.dto';
import { ClassesRepository } from '../classes/classes.repository';
import { QuestionType } from 'question-bank-interface';

@Injectable()
export class QuestionService {
  constructor(
    private questionRepository: QuestionRepository,
    private subjectRepository: SubjectRepository,
    private topicRepository: TopicRepository,
    private classRepository: ClassesRepository,
  ) {}

  async findAll(limit?: number, offset?: number) {
    return this.questionRepository.findAllQuestions(limit, offset);
  }

  async findById(id: string) {
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async findByIdWithRelations(id: string) {
    const question = await this.questionRepository.findByIdWithRelations(id);
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return new QuestionFullDetailsDto({
      id: question.id,
      questionText: question.questionText,
      marks: question.marks,
      difficultyLevel: question.difficultyLevel,
      questionType: question.questionType,
      subject: question.subjectName, // Assuming subject has a name property
      topic: question.topicName, // Assuming topic has a name property
      className: question.className, // Assuming class has a name property
      questionOptions: question.options.map(option => ({
        id: option.id,
        optionText: option.optionText,
        isCorrect: option.isCorrect
      })),
      questionImages: question.images.map(image => ({
        id: image.id,
        imageUrl: image.imageUrl
      }))
    });
  }

  async filterQuestions(filters: QuestionFilterDto, limit?: number, offset?: number) {
    const questions = await this.questionRepository.filterQuestions(filters, limit, offset);
    return questions.map(q => new QuestionDto({
      id: q.question.id,
      questionText: q.question.questionText,
      marks: q.question.marks,
      difficultyLevel: q.question.difficultyLevel,
      questionType: q.question.questionType,
      subject: q.subjectName, // Assuming subject has a name property
      topic: q.topicName, // Assuming topic has a name property
      className: q.className, // Assuming class has a name property
    }));
  }

  async create(createQuestionDto: CreateQuestionDto) {
    // Validate references to other entities
    await this.validateEntityReferences(
      createQuestionDto.subjectId,
      createQuestionDto.topicId,
      // Assuming you have a ClassRepository, otherwise comment out or modify this
      // createQuestionDto.classId
    );
    
    // For multiple choice questions, validate options
    if (createQuestionDto.questionType === QuestionType.MULTIPLE_CHOICE) {
      if (!createQuestionDto.options || createQuestionDto.options.length < 2) {
        throw new BadRequestException('Multiple choice questions must have at least 2 options');
      }
      
      // Check if there is at least one correct option
      const hasCorrectOption = createQuestionDto.options.some(option => option.isCorrect);
      if (!hasCorrectOption) {
        throw new BadRequestException('Multiple choice questions must have at least one correct option');
      }
    }
    
    return this.questionRepository.createQuestion(createQuestionDto);
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    // Check if question exists
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    
    // Validate references if they are being updated
    if (updateQuestionDto.subjectId || updateQuestionDto.topicId || updateQuestionDto.classId) {
      await this.validateEntityReferences(
        updateQuestionDto.subjectId || question.subjectId,
        updateQuestionDto.topicId || question.topicId,
        // Assuming you have a ClassRepository, otherwise comment out or modify this
        // updateQuestionDto.classId || question.classId
      );
    }
    
    return this.questionRepository.updateQuestion(id, updateQuestionDto);
  }

  async delete(id: string) {
    // Check if question exists
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    
    return this.questionRepository.deleteQuestion(id);
  }

  // Helper methods for options and images

  async addOption(questionId: string, optionText: string, isCorrect: boolean) {
    // Check if question exists
    const question = await this.questionRepository.findById(questionId);
    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }
    
    // Ensure it's a multiple choice question
    if (question.questionType !== QuestionType.MULTIPLE_CHOICE) {
      throw new BadRequestException('Options can only be added to multiple choice questions');
    }
    
    return this.questionRepository.addOption(questionId, optionText, isCorrect);
  }

  async updateOption(optionId: string, optionText?: string, isCorrect?: boolean) {
    // Implementation would typically check if the option exists first
    return this.questionRepository.updateOption(optionId, optionText, isCorrect);
  }

  async deleteOption(optionId: string) {
    // Implementation would typically check if the option exists first
    return this.questionRepository.deleteOption(optionId);
  }

  async addImage(questionId: string, imageUrl: string) {
    // Check if question exists
    const question = await this.questionRepository.findById(questionId);
    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }
    
    return this.questionRepository.addImage(questionId, imageUrl);
  }

  async updateImage(imageId: string, imageUrl: string) {
    // Implementation would typically check if the image exists first
    return this.questionRepository.updateImage(imageId, imageUrl);
  }

  async deleteImage(imageId: string) {
    // Implementation would typically check if the image exists first
    return this.questionRepository.deleteImage(imageId);
  }

  // Helper method to validate references to other entities
  private async validateEntityReferences(subjectId: string, topicId: string, classId?: string) {
    // Check if subject exists
    const subject = await this.subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }
    
    // Check if topic exists and belongs to the correct subject
    const topic = await this.topicRepository.findById(topicId);
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found`);
    }
    
    if (topic.subjectId !== subjectId) {
      throw new BadRequestException(`Topic with ID ${topicId} does not belong to Subject with ID ${subjectId}`);
    }
    
    // Check if class exists
    // This would require a ClassRepository, which was not provided in the current context
    // If you have a ClassRepository, uncomment this code and adjust as needed
    
    if (classId) {
      const classEntity = await this.classRepository.findById(classId);
      if (!classEntity) {
        throw new NotFoundException(`Class with ID ${classId} not found`);
      }
    }
    
  }
}