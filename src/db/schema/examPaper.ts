import { integer, pgEnum, pgTable, primaryKey, serial, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { subjects } from "./subject";
import { classes } from "./classes";
import { questions } from "./question";
import { relations } from "drizzle-orm";


export const examTypes = pgTable('exam_types', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 50 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
  });

// Exam papers table
export const examPapers = pgTable('exam_papers', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 200 }).notNull(),
    examTypeId: uuid('exam_type_id').references(() => examTypes.id),
    subjectId: uuid('subject_id').references(() => subjects.id),
    classId: uuid('class_id').references(() => classes.id),
    totalMarks: integer('total_marks').notNull(),
    durationMinutes: integer('duration_minutes').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
  });
  
  // Exam paper questions junction table
  export const examPaperQuestions = pgTable('exam_paper_questions', {
    examPaperId: uuid('exam_paper_id').references(() => examPapers.id),
    questionId: uuid('question_id').references(() => questions.id),
    questionNumber: integer('question_number').notNull(),
    section: varchar('section', { length: 50 }),
  }, (table) => {
    return {
      pk: primaryKey({ columns: [table.examPaperId, table.questionId] })
    };
  });

  // Relations

  export const examPapersRelations = relations(examPapers, ({ one, many }) => ({
    examType: one(examTypes, {
      fields: [examPapers.examTypeId],
      references: [examTypes.id]
    }),
    subject: one(subjects, {
      fields: [examPapers.subjectId],
      references: [subjects.id]
    }),
    class: one(classes, {
      fields: [examPapers.classId],
      references: [classes.id]
    }),
    examPaperQuestions: many(examPaperQuestions)
  }));

  export const examTypesRelations = relations(examTypes, ({ many }) => ({
    examPapers: many(examPapers)
  }));
  
  export const examPaperQuestionsRelations = relations(examPaperQuestions, ({ one }) => ({
    examPaper: one(examPapers, {
      fields: [examPaperQuestions.examPaperId],
      references: [examPapers.id]
    }),
    question: one(questions, {
      fields: [examPaperQuestions.questionId],
      references: [questions.id]
    })
  }));