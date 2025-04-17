import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, like, desc, gte, lte, inArray, SQL, sql } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { QuestionFilterDto } from './dto/filter-question.dto';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/create-question.dto';
import { uuid } from 'drizzle-orm/gel-core';
import { isValidUUID } from 'src/utils/validUUID.utils';

@Injectable()
export class QuestionRepository {
  constructor(
    @Inject('DATABASE') private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAllQuestions(limit = 100, offset = 0) {
    return this.db
      .select()
      .from(schema.questions)
      .limit(limit)
      .offset(offset);
  }

  async findById(id: string) {
    const results = await this.db
      .select()
      .from(schema.questions)
      .where(eq(schema.questions.id, id))
      .limit(1);
    
    return results.length ? results[0] : null;
  }

  async findByIdWithRelations(id: string) {
    const results = await this.db.transaction(async (tx) => {
      const questionRes = await tx
      .select({
        question: schema.questions,
        subjectName: schema.subjects.name,
        topicName: schema.topics.name,
        className: schema.classes.name
      })
        .from(schema.questions)
        .leftJoin(schema.subjects, eq(schema.questions.subjectId, schema.subjects.id))
        .leftJoin(schema.topics, eq(schema.questions.topicId, schema.topics.id))
        .leftJoin(schema.classes, eq(schema.questions.classId, schema.classes.id))
        .where(eq(schema.questions.id, id))
        .execute();
      
      if (!questionRes.length) {
        return null;
      }
      const question = {
        ...questionRes[0].question,
        subjectName: questionRes[0].subjectName,
        topicName: questionRes[0].topicName,
        className: questionRes[0].className,
      }

      
      const options = await tx
        .select()
        .from(schema.questionOptions)
        .where(eq(schema.questionOptions.questionId, id));
      
      const images = await tx
        .select()
        .from(schema.questionImages)
        .where(eq(schema.questionImages.questionId, id));
      
      return {
        ...question,
        options,
        images
      };
    });
    
    return results;
  }

  async filterQuestions(filters: QuestionFilterDto, limit = 100, offset = 0) {
    const conditions: SQL<unknown>[] = [];
    
    if (filters.subjectId) {
      conditions.push(eq(schema.questions.subjectId, filters.subjectId));
    }
    
    if (filters.topicIds) {
      console.log('Topic IDs:', filters.topicIds, conditions);
      if (Array.isArray(filters.topicIds)) {
        conditions.push(inArray(schema.questions.topicId, filters.topicIds));
      } else { // if it's a single ID
        conditions.push(eq(schema.questions.topicId, filters.topicIds));
      }
      console.log('Topic IDs:', filters.topicIds, conditions);
    }
    
    if (filters.classId) {
      conditions.push(eq(schema.questions.classId, filters.classId));
    }
    
    if (filters.difficultyLevel) {
      conditions.push(eq(schema.questions.difficultyLevel, filters.difficultyLevel));
    }
    
    if (filters.questionType) {
      conditions.push(eq(schema.questions.questionType, filters.questionType));
    }
    
    if (filters.minMarks !== undefined) {
      conditions.push(gte(schema.questions.marks, filters.minMarks));
    }
    
    if (filters.maxMarks !== undefined) {
      conditions.push(lte(schema.questions.marks, filters.maxMarks));
    }
    
    const whereCondition = conditions.length > 0 
      ? and(...conditions) 
      : undefined;
    
    const query = this.db
    .select({
      question: schema.questions,
      subjectName: schema.subjects.name,
      topicName: schema.topics.name,
      className: schema.classes.name
    })
      .from(schema.questions)
      .leftJoin(schema.subjects, eq(schema.questions.subjectId, schema.subjects.id))
      .leftJoin(schema.topics, eq(schema.questions.topicId, schema.topics.id))
      .leftJoin(schema.classes, eq(schema.questions.classId, schema.classes.id))
    
    if (whereCondition) {
      query.where(whereCondition);
    }
    
    return query.limit(limit).offset(offset);
  }

  async filterQuestionsBasicInfo(filters: QuestionFilterDto, limit = 100, offset = 0) {
    const conditions: SQL<unknown>[] = [];
    
    if (filters.subjectId) {
      conditions.push(eq(schema.questions.subjectId, filters.subjectId));
    }
    
    if (filters.topicIds && filters.topicIds.length > 0) {
      conditions.push(inArray(schema.questions.topicId, filters.topicIds));
    }
    
    if (filters.classId) {
      conditions.push(eq(schema.questions.classId, filters.classId));
    }
    
    if (filters.difficultyLevel) {
      conditions.push(eq(schema.questions.difficultyLevel, filters.difficultyLevel));
    }
    
    if (filters.questionType) {
      conditions.push(eq(schema.questions.questionType, filters.questionType));
    }
    
    if (filters.minMarks !== undefined) {
      conditions.push(gte(schema.questions.marks, filters.minMarks));
    }
    
    if (filters.maxMarks !== undefined) {
      conditions.push(lte(schema.questions.marks, filters.maxMarks));
    }
    
    const whereCondition = conditions.length > 0 
      ? and(...conditions) 
      : undefined;
    
    const query = this.db
      .select()
      .from(schema.questions);
    
    if (whereCondition) {
      query.where(whereCondition);
    }
    
    return query.limit(limit).offset(offset);
  }
  async filterQuestionsFullDetails(filters: QuestionFilterDto, limit = 100, offset = 0) {
    // Get filtered questions first
    const questions = await this.filterQuestionsBasicInfo(filters, limit, offset);
    
    if (!questions.length) {
      return [];
    }
    
    // Extract IDs for batch queries
    const questionIds = questions.map(q => q.id);
    
    // Batch load options and images in two efficient queries
    const [options, images] = await Promise.all([
      this.db
        .select()
        .from(schema.questionOptions)
        .where(inArray(schema.questionOptions.questionId, questionIds)),
      this.db
        .select()
        .from(schema.questionImages)
        .where(inArray(schema.questionImages.questionId, questionIds))
    ]);
    
    // Create lookup maps for O(1) access
    const optionsMap = options.reduce((map, option) => {
      if (!map[option.questionId]) map[option.questionId] = [];
      map[option.questionId].push(option);
      return map;
    }, {});
    
    const imagesMap = images.reduce((map, image) => {
      if (!map[image.questionId]) map[image.questionId] = [];
      map[image.questionId].push(image);
      return map;
    }, {});
    
    // Combine everything efficiently
    return questions.map(question => ({
      ...question,
      options: optionsMap[question.id] || [],
      images: imagesMap[question.id] || []
    }));
  }

  async createQuestion(data: CreateQuestionDto) {
    const { subjectId, topicId, classId } = data;
    if (!isValidUUID(subjectId) || !isValidUUID(topicId) || !isValidUUID(classId)) {
      throw new Error('Invalid UUID format');
    }
    const question = await this.db.transaction(async (tx) => {
      // Create question first
      const [createdQuestion] = await tx
        .insert(schema.questions)
        .values({
          questionText: data.questionText,
          marks: data.marks,
          difficultyLevel: data.difficultyLevel,
          questionType: data.questionType,
          ...(schema.questions.subjectId && { subjectId }),
          ...(schema.questions.topicId && { topicId }),
          ...(schema.questions.classId && { classId })
        })
        .returning();
      
      // If it's multiple choice, add options
      if (data.options && data.options.length > 0) {
        await tx
          .insert(schema.questionOptions)
          .values(
            data.options.map(option => ({
              questionId: createdQuestion.id,
              optionText: option.optionText,
              isCorrect: option.isCorrect
            }))
          );
      }
      
      // Add any images
      if (data.images && data.images.length > 0) {
        await tx
          .insert(schema.questionImages)
          .values(
            data.images.map(image => ({
              questionId: createdQuestion.id,
              imageUrl: image.imageUrl
            }))
          );
      }
      
      return createdQuestion;
    });
    
    return question;
  }

  async updateQuestion(id: string, data: UpdateQuestionDto) {
    // Create an update object with only the properties that are provided
    const updateData: any = {
      updatedAt: new Date()
    };

    // Only add properties if they are defined
    if (data.questionText !== undefined) {
      updateData.questionText = data.questionText;
    }

    if (data.marks !== undefined) {
      updateData.marks = data.marks;
    }

    if (data.difficultyLevel !== undefined) {
      updateData.difficultyLevel = data.difficultyLevel;
    }

    if (data.questionType !== undefined) {
      updateData.questionType = data.questionType;
    }

    if (data.subjectId !== undefined) {
      updateData.subjectId = data.subjectId;
    }

    if (data.topicId !== undefined) {
      updateData.topicId = data.topicId;
    }

    if (data.classId !== undefined) {
      updateData.classId = data.classId;
    }

    const [updatedQuestion] = await this.db
      .update(schema.questions)
      .set(updateData)
      .where(eq(schema.questions.id, id))
      .returning();
    
    return updatedQuestion;
  }

  async deleteQuestion(id: string) {
    await this.db.transaction(async (tx) => {
      // Delete related options and images first
      await tx
        .delete(schema.questionOptions)
        .where(eq(schema.questionOptions.questionId, id));
      
      await tx
        .delete(schema.questionImages)
        .where(eq(schema.questionImages.questionId, id));
      
      // Delete question
      await tx
        .delete(schema.questions)
        .where(eq(schema.questions.id, id));
    });
    
    return { success: true };
  }

  // Methods for managing options
  async addOption(questionId: string, optionText: string, isCorrect: boolean) {
    const [option] = await this.db
      .insert(schema.questionOptions)
      .values({
        questionId,
        optionText,
        isCorrect
      })
      .returning();
    
    return option;
  }

  async updateOption(optionId: string, optionText?: string, isCorrect?: boolean) {
    const updateData: any = {
      updatedAt: new Date()
    };

    if (optionText !== undefined) {
      updateData.optionText = optionText;
    }

    if (isCorrect !== undefined) {
      updateData.isCorrect = isCorrect;
    }

    const [updatedOption] = await this.db
      .update(schema.questionOptions)
      .set(updateData)
      .where(eq(schema.questionOptions.id, optionId))
      .returning();
    
    return updatedOption;
  }

  async deleteOption(optionId: string) {
    await this.db
      .delete(schema.questionOptions)
      .where(eq(schema.questionOptions.id, optionId));
    
    return { success: true };
  }

  // Methods for managing images
  async addImage(questionId: string, imageUrl: string) {
    const imageData: any = {
      imageUrl
    }
    if (questionId) {
      imageData.questionId = questionId;
    }
    const [image] = await this.db
      .insert(schema.questionImages)
      .values(imageData)
      .returning();
    
    return image;
  }

  async updateImage(imageId: string, imageUrl: string) {
    const updateData: any = {
      updatedAt: new Date()
    };
    // Only add properties if they are defined
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }
    const [updatedImage] = await this.db
      .update(schema.questionImages)
      .set(updateData)
      .where(eq(schema.questionImages.id, imageId))
      .returning();
    
    return updatedImage;
  }

  async deleteImage(imageId: string) {
    await this.db
      .delete(schema.questionImages)
      .where(eq(schema.questionImages.id, imageId));
    
    return { success: true };
  }
}