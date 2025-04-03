import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, like, desc, gte, lte, SQL, sql } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { 
  CreateExamPaperDto, 
  UpdateExamPaperDto, 
  ExamPaperFilterDto,
  AddQuestionToExamPaperDto,
  UpdateExamPaperQuestionDto
} from './dto/exam-paper.dto';

@Injectable()
export class ExamPaperRepository {
  constructor(
    @Inject('DATABASE') private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAllExamPapers(limit = 100, offset = 0) {
    return this.db
      .select()
      .from(schema.examPapers)
      .limit(limit)
      .offset(offset);
  }

  async findById(id: string) {
    const results = await this.db
      .select()
      .from(schema.examPapers)
      .where(eq(schema.examPapers.id, id))
      .limit(1);
    
    return results.length ? results[0] : null;
  }

  async findByIdWithQuestions(id: string) {
    const results = await this.db.transaction(async (tx) => {
      const examPaper = await tx
        .select()
        .from(schema.examPapers)
        .where(eq(schema.examPapers.id, id))
        .limit(1);
      
      if (!examPaper.length) {
        return null;
      }
      
      // Get the questions associated with this exam paper
      const examPaperQuestions = await tx
        .select()
        .from(schema.examPaperQuestions)
        .where(eq(schema.examPaperQuestions.examPaperId, id))
        .orderBy(schema.examPaperQuestions.questionNumber);
      
      // Get the full question details for each question
      const questionsDetails = [];
      
      for (const epq of examPaperQuestions) {
        const questionData = await tx
          .select()
          .from(schema.questions)
          .where(eq(schema.questions.id, epq.questionId))
          .limit(1);
          
        if (questionData.length) {
          questionsDetails.push({
            ...epq,
            questionDetails: questionData[0]
          });
        }
      }
      
      return {
        ...examPaper[0],
        questions: questionsDetails
      };
    });
    
    return results;
  }

  async filterExamPapers(filters: ExamPaperFilterDto, limit = 100, offset = 0) {
    const conditions: SQL<unknown>[] = [];
    
    if (filters.examTypeId) {
      conditions.push(eq(schema.examPapers.examTypeId, filters.examTypeId));
    }
    
    if (filters.subjectId) {
      conditions.push(eq(schema.examPapers.subjectId, filters.subjectId));
    }
    
    if (filters.classId) {
      conditions.push(eq(schema.examPapers.classId, filters.classId));
    }
    
    if (filters.minTotalMarks !== undefined) {
      conditions.push(gte(schema.examPapers.totalMarks, filters.minTotalMarks));
    }
    
    if (filters.maxTotalMarks !== undefined) {
      conditions.push(lte(schema.examPapers.totalMarks, filters.maxTotalMarks));
    }
    
    if (filters.minDurationMinutes !== undefined) {
      conditions.push(gte(schema.examPapers.durationMinutes, filters.minDurationMinutes));
    }
    
    if (filters.maxDurationMinutes !== undefined) {
      conditions.push(lte(schema.examPapers.durationMinutes, filters.maxDurationMinutes));
    }
    
    const whereCondition = conditions.length > 0 
      ? and(...conditions) 
      : undefined;
    
    const query = this.db
      .select()
      .from(schema.examPapers);
    
    if (whereCondition) {
      query.where(whereCondition);
    }
    
    return query.limit(limit).offset(offset);
  }

  async createExamPaper(data: CreateExamPaperDto) {
    const examPaper = await this.db.transaction(async (tx) => {
      // Create exam paper first
      const [createdExamPaper] = await tx
        .insert(schema.examPapers)
        .values({
          title: data.title,
          ...(data.examTypeId && { examTypeId: data.examTypeId }),
            ...(data.subjectId && { subjectId: data.subjectId }),
            ...(data.classId && { classId: data.classId }),
          totalMarks: data.totalMarks,
          durationMinutes: data.durationMinutes
        })
        .returning();
      
      // Add questions if provided
      if (data.questions && data.questions.length > 0) {
        await tx
          .insert(schema.examPaperQuestions)
          .values(
            data.questions.map(q => ({
              examPaperId: createdExamPaper.id,
              questionId: q.questionId,
              questionNumber: q.questionNumber,
              section: q.section
            }))
          );
      }
      
      return createdExamPaper;
    });
    
    return examPaper;
  }

  async updateExamPaper(id: string, data: UpdateExamPaperDto) {
    // Create an update object with only the properties that are provided
    const updateData: any = {
      updatedAt: new Date()
    };

    // Only add properties if they are defined
    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.examTypeId !== undefined) {
      updateData.examTypeId = data.examTypeId;
    }

    if (data.subjectId !== undefined) {
      updateData.subjectId = data.subjectId;
    }

    if (data.classId !== undefined) {
      updateData.classId = data.classId;
    }

    if (data.totalMarks !== undefined) {
      updateData.totalMarks = data.totalMarks;
    }

    if (data.durationMinutes !== undefined) {
      updateData.durationMinutes = data.durationMinutes;
    }

    const [updatedExamPaper] = await this.db
      .update(schema.examPapers)
      .set(updateData)
      .where(eq(schema.examPapers.id, id))
      .returning();
    
    return updatedExamPaper;
  }

  async deleteExamPaper(id: string) {
    await this.db.transaction(async (tx) => {
      // Delete all related exam paper questions first
      await tx
        .delete(schema.examPaperQuestions)
        .where(eq(schema.examPaperQuestions.examPaperId, id));
      
      // Delete the exam paper
      await tx
        .delete(schema.examPapers)
        .where(eq(schema.examPapers.id, id));
    });
    
    return { success: true };
  }

  // Methods for managing exam paper questions
  async getExamPaperQuestions(examPaperId: string) {
    return this.db
      .select()
      .from(schema.examPaperQuestions)
      .where(eq(schema.examPaperQuestions.examPaperId, examPaperId))
      .orderBy(schema.examPaperQuestions.questionNumber);
  }

  async addQuestionToExamPaper(examPaperId: string, data: AddQuestionToExamPaperDto) {
    // Create a typed object first
    await this.db
      .insert(schema.examPaperQuestions)
      .values({
        examPaperId: examPaperId,
        questionId: data.questionId,
        questionNumber: data.questionNumber,
        section: data.section
      } as typeof schema.examPaperQuestions.$inferInsert);
    
    return { success: true };
  }

  async updateExamPaperQuestion(
    examPaperId: string, 
    questionId: string, 
    data: UpdateExamPaperQuestionDto
  ) {
    // Create an update object with only the properties that are provided
    const updateData: any = {};

    if (data.questionNumber !== undefined) {
      updateData.questionNumber = data.questionNumber;
    }

    if (data.section !== undefined) {
      updateData.section = data.section;
    }

    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      return { success: false, message: 'No properties to update' };
    }

    await this.db
      .update(schema.examPaperQuestions)
      .set(updateData)
      .where(
        and(
          eq(schema.examPaperQuestions.examPaperId, examPaperId),
          eq(schema.examPaperQuestions.questionId, questionId)
        )
      );
    
    return { success: true };
  }

  async removeQuestionFromExamPaper(examPaperId: string, questionId: string) {
    await this.db
      .delete(schema.examPaperQuestions)
      .where(
        and(
          eq(schema.examPaperQuestions.examPaperId, examPaperId),
          eq(schema.examPaperQuestions.questionId, questionId)
        )
      );
    
    return { success: true };
  }

  async searchExamPapersByTitle(title: string, limit = 100, offset = 0) {
    return this.db
      .select()
      .from(schema.examPapers)
      .where(like(schema.examPapers.title, `%${title}%`))
      .limit(limit)
      .offset(offset);
  }
}