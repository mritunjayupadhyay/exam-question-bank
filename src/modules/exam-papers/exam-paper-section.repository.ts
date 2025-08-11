import { Inject, Injectable } from "@nestjs/common";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { eq, and, like, desc, gte, lte, SQL, sql, inArray } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { IExamSectionAddQuestionPayload, IExamSectionCreatePayload, IExamSectionPayloadPartial, IExamSectionUpdateQuestionPayload } from "question-bank-interface";


@Injectable()
export class ExamSectionRepository {
    constructor(
        @Inject('DATABASE') private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async createSection(examPaperId: string, sectionData: IExamSectionCreatePayload) {
        const sectionMarks = sectionData.marksPerQuestion * sectionData.questionsToAnswer;
        console.log("4. in repository createSection, sectionData:", sectionData);
        const [createdSection] = await this.db
            .insert(schema.examPaperSections)
            .values({
                examPaperId,
                sectionNumber: sectionData.sectionNumber,
                title: sectionData.title,
                marksPerQuestion: sectionData.marksPerQuestion,
                questionsToAnswer: sectionData.questionsToAnswer,
                totalQuestions: sectionData.totalQuestions,
                sectionMarks,
                ...(sectionData.instructions && { instructions: sectionData.instructions })
            })
            .returning();

        return createdSection;
    }

    async getSectionsByExamPaperId(examPaperId: string) {
        return this.db
            .select()
            .from(schema.examPaperSections)
            .where(eq(schema.examPaperSections.examPaperId, examPaperId))
            .orderBy(schema.examPaperSections.sectionNumber);
    }

    async getSectionById(sectionId: string) {
        return this.db
            .select()
            .from(schema.examPaperSections)
            .where(eq(schema.examPaperSections.id, sectionId))
            .limit(1)
            .then(rows => rows[0] || null);
    }

    async updateSection(sectionId: string, updateData: IExamSectionPayloadPartial) {
        const currentSection = await this.getSectionById(sectionId);
        if (!currentSection) {
            throw new Error('Section not found');
        }

        // Calculate new section marks if relevant fields are updated
        const marksPerQuestion = updateData.marksPerQuestion ?? currentSection.marksPerQuestion;
        const questionsToAnswer = updateData.questionsToAnswer ?? currentSection.questionsToAnswer;
        const sectionMarks = marksPerQuestion * questionsToAnswer;

        const [updatedSection] = await this.db
            .update(schema.examPaperSections)
            .set({
                ...updateData,
                sectionMarks
            })
            .where(eq(schema.examPaperSections.id, sectionId))
            .returning();

        return updatedSection;
    }

    async deleteSection(sectionId: string) {
        await this.db.transaction(async (tx) => {
            // First delete all questions in this section
            await tx
                .delete(schema.examPaperQuestions)
                .where(eq(schema.examPaperQuestions.sectionId, sectionId));

            // Then delete the section
            await tx
                .delete(schema.examPaperSections)
                .where(eq(schema.examPaperSections.id, sectionId));
        });

        return { success: true };
    }

    async addQuestionToSection(sectionId: string, questionData: IExamSectionAddQuestionPayload) {
        const [addedQuestion] = await this.db
            .insert(schema.examPaperQuestions)
            .values({
                sectionId,
                questionId: questionData.questionId,
                questionNumber: questionData.questionNumber,
                isOptional: questionData.isOptional || false,
                ...(questionData.isOptional && { isOptional: questionData.isOptional })
            })
            .returning();

        return addedQuestion;
    }

    async addQuestionsToSection(sectionId: string, questionsData: Array<{
        questionId: string;
        questionNumber: number;
        isOptional?: boolean;
    }>) {
        const questionsToInsert = questionsData.map(q => ({
            sectionId,
            questionId: q.questionId,
            questionNumber: q.questionNumber,
            isOptional: q.isOptional || false
        }));
        if (questionsToInsert.length === 0) {
            throw new Error('No questions provided to add');
        }
        const addedQuestions = await this.db
            .insert(schema.examPaperQuestions)
            .values(questionsToInsert)
            .returning();

        return addedQuestions;
    }

    async getQuestionsInSection(sectionId: string) {
        return this.db
            .select({
                id: schema.examPaperQuestions.id,
                questionNumber: schema.examPaperQuestions.questionNumber,
                isOptional: schema.examPaperQuestions.isOptional,
                questionDetails: {
                    id: schema.questions.id,
                    text: schema.questions.questionText,
                    type: schema.questions.questionType
                }
            })
            .from(schema.examPaperQuestions)
            .leftJoin(
                schema.questions,
                eq(schema.examPaperQuestions.questionId, schema.questions.id)
            )
            .where(eq(schema.examPaperQuestions.sectionId, sectionId))
            .orderBy(schema.examPaperQuestions.questionNumber);
    }

    async removeQuestionFromSection(sectionId: string, questionId: string) {
        const [deletedQuestion] = await this.db
            .delete(schema.examPaperQuestions)
            .where(
                and(
                    eq(schema.examPaperQuestions.sectionId, sectionId),
                    eq(schema.examPaperQuestions.questionId, questionId)
                )
            )
            .returning();

        return deletedQuestion;
    }

    async removeQuestionFromSectionById(examPaperQuestionId: string) {
        const [deletedQuestion] = await this.db
            .delete(schema.examPaperQuestions)
            .where(eq(schema.examPaperQuestions.id, examPaperQuestionId))
            .returning();

        return deletedQuestion;
    }

    async updateQuestionInSection(examPaperQuestionId: string, updateData: IExamSectionUpdateQuestionPayload) {
        const [updatedQuestion] = await this.db
            .update(schema.examPaperQuestions)
            .set(updateData)
            .where(eq(schema.examPaperQuestions.id, examPaperQuestionId))
            .returning();

        return updatedQuestion;
    }

    async reorderQuestionsInSection(sectionId: string, questionOrders: Array<{
        examPaperQuestionId: string;
        newQuestionNumber: number;
    }>) {
        await this.db.transaction(async (tx) => {
            for (const { examPaperQuestionId, newQuestionNumber } of questionOrders) {
                await tx
                    .update(schema.examPaperQuestions)
                    .set({ questionNumber: newQuestionNumber })
                    .where(
                        and(
                            eq(schema.examPaperQuestions.id, examPaperQuestionId),
                            eq(schema.examPaperQuestions.sectionId, sectionId)
                        )
                    );
            }
        });

        return { success: true };
    }

    async getNextQuestionNumber(sectionId: string): Promise<number> {
        const result = await this.db
            .select({
                maxNumber: sql<number>`COALESCE(MAX(${schema.examPaperQuestions.questionNumber}), 0)`
            })
            .from(schema.examPaperQuestions)
            .where(eq(schema.examPaperQuestions.sectionId, sectionId));

        return (result[0]?.maxNumber || 0) + 1;
    }

    async getSectionWithQuestions(sectionId: string) {
        return await this.db.transaction(async (tx) => {
            // Get section details
            const section = await tx
                .select()
                .from(schema.examPaperSections)
                .where(eq(schema.examPaperSections.id, sectionId))
                .limit(1);

            if (!section.length) {
                return null;
            }

            // Get questions with their details
            const questionsWithDetails = await tx
                .select({
                    id: schema.examPaperQuestions.id,
                    questionNumber: schema.examPaperQuestions.questionNumber,
                    isOptional: schema.examPaperQuestions.isOptional,
                    questionDetails: {
                        id: schema.questions.id,
                        text: schema.questions.questionText,
                        type: schema.questions.questionType
                    }
                })
                .from(schema.examPaperQuestions)
                .leftJoin(
                    schema.questions,
                    eq(schema.examPaperQuestions.questionId, schema.questions.id)
                )
                .where(eq(schema.examPaperQuestions.sectionId, sectionId))
                .orderBy(schema.examPaperQuestions.questionNumber);

            return {
                ...section[0],
                questions: questionsWithDetails
            };
        });
    }

    async isQuestionInSection(sectionId: string, questionId: string): Promise<boolean> {
        const result = await this.db
            .select({ id: schema.examPaperQuestions.id })
            .from(schema.examPaperQuestions)
            .where(
                and(
                    eq(schema.examPaperQuestions.sectionId, sectionId),
                    eq(schema.examPaperQuestions.questionId, questionId)
                )
            )
            .limit(1);

        return result.length > 0;
    }

}
