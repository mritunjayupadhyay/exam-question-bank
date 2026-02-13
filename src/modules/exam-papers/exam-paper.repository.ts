import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, like, desc, gte, lte, SQL, sql, inArray } from 'drizzle-orm';
import * as schema from 'exam-question-bank-db';
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
  ) { }

  async searchExamPapersByTitle(title: string, limit = 100, offset = 0) {
    return this.db
      .select()
      .from(schema.examPapers)
      .where(like(schema.examPapers.title, `%${title}%`))
      .limit(limit)
      .offset(offset);
  }

  async findById(id: string) {
    try {
      console.log('Finding exam paper with ID:', id);

      const result = await this.db
        .select({
          id: schema.examPapers.id
        })
        .from(schema.examPapers)
        .where(eq(schema.examPapers.id, id))
        .limit(1);

      console.log('Query result:', result);
      return result[0] || null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error; // Re-throw to see the actual error
    }
  }

  async findByIdWithQuestions(id: string) {
    return await this.db.transaction(async (tx) => {
      // 1. Get exam paper basic info
      const examPaper = await tx
        .select()
        .from(schema.examPapers)
        .where(eq(schema.examPapers.id, id))
        .limit(1);

      if (!examPaper.length) {
        return null;
      }

      // 2. Get sections with their questions (without options to reduce joins)
      const sectionsWithQuestions = await tx
        .select({
          // Section fields
          sectionId: schema.examPaperSections.id,
          sectionNumber: schema.examPaperSections.sectionNumber,
          sectionTitle: schema.examPaperSections.title,
          sectionInstructions: schema.examPaperSections.instructions,
          marksPerQuestion: schema.examPaperSections.marksPerQuestion,
          questionsToAnswer: schema.examPaperSections.questionsToAnswer,
          totalQuestions: schema.examPaperSections.totalQuestions,
          sectionMarks: schema.examPaperSections.sectionMarks,

          // Question junction fields
          questionJunctionId: schema.examPaperQuestions.id,
          questionNumber: schema.examPaperQuestions.questionNumber,
          isOptional: schema.examPaperQuestions.isOptional,

          // Question details
          questionId: schema.questions.id,
          questionText: schema.questions.questionText,
          questionType: schema.questions.questionType,
        })
        .from(schema.examPaperSections)
        .leftJoin(
          schema.examPaperQuestions,
          eq(schema.examPaperSections.id, schema.examPaperQuestions.sectionId)
        )
        .leftJoin(
          schema.questions,
          eq(schema.examPaperQuestions.questionId, schema.questions.id)
        )
        .where(eq(schema.examPaperSections.examPaperId, id))
        .orderBy(
          schema.examPaperSections.sectionNumber,
          schema.examPaperQuestions.questionNumber
        );

      // 3. Get all question IDs to fetch their options
      const questionIds = sectionsWithQuestions
        .filter(row => row.questionId)
        .map(row => row.questionId);

      // 4. Get all options for these questions in one query
      const questionOptions = questionIds.length > 0
        ? await tx
          .select()
          .from(schema.questionOptions)
          .where(inArray(schema.questionOptions.questionId, questionIds))
          .orderBy(schema.questionOptions.questionId, schema.questionOptions.id)
        : [];

      // 5. Group options by question ID for efficient lookup
      const optionsMap = new Map();
      questionOptions.forEach(option => {
        if (!optionsMap.has(option.questionId)) {
          optionsMap.set(option.questionId, []);
        }
        optionsMap.get(option.questionId).push({
          id: option.id,
          text: option.optionText,
          isCorrect: option.isCorrect
        });
      });

      // 6. Build the nested structure
      const sectionsMap = new Map();

      for (const row of sectionsWithQuestions) {
        // Handle sections
        if (!sectionsMap.has(row.sectionId)) {
          sectionsMap.set(row.sectionId, {
            id: row.sectionId,
            sectionNumber: row.sectionNumber,
            title: row.sectionTitle,
            instructions: row.sectionInstructions,
            marksPerQuestion: row.marksPerQuestion,
            questionsToAnswer: row.questionsToAnswer,
            totalQuestions: row.totalQuestions,
            sectionMarks: row.sectionMarks,
            questions: []
          });
        }

        // Handle questions
        if (row.questionId) {
          sectionsMap.get(row.sectionId).questions.push({
            id: row.questionJunctionId,
            questionNumber: row.questionNumber,
            isOptional: row.isOptional,
            questionDetails: {
              id: row.questionId,
              text: row.questionText,
              type: row.questionType,
              options: optionsMap.get(row.questionId) || []
            }
          });
        }
      }

      // 7. Assemble final structure
      return {
        ...examPaper[0],
        sections: Array.from(sectionsMap.values())
          .sort((a, b) => a.sectionNumber - b.sectionNumber)
      };
    });
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
      .select({
        id: schema.examPapers.id,
        title: schema.examPapers.title,
        totalMarks: schema.examPapers.totalMarks,
        durationMinutes: schema.examPapers.durationMinutes,
        subjectId: schema.examPapers.subjectId, // Assuming subject has an ID property
        classNameId: schema.examPapers.classId, // Assuming class has an ID property
        examTypeId: schema.examPapers.examTypeId,
        createdAt: schema.examPapers.createdAt, // Assuming exam paper has a createdAt property
        updatedAt: schema.examPapers.updatedAt, // Assuming exam paper has an updatedAt property
        examTypeName: schema.examTypes.name, // Add examTypeName
      })
      .from(schema.examPapers)
      .leftJoin(schema.examTypes, eq(schema.examPapers.examTypeId, schema.examTypes.id));

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
      // Delete all related exam paper sections first
      await tx
        .delete(schema.examPaperSections)
        .where(eq(schema.examPaperSections.examPaperId, id));

      // Delete the exam paper
      await tx
        .delete(schema.examPapers)
        .where(eq(schema.examPapers.id, id));
    });

    return { success: true };
  }
}