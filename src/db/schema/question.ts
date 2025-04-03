import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { subjects, topics } from "./subject";
import { classes } from "./classes";
import { relations } from "drizzle-orm";
import { examPaperQuestions } from "./examPaper";

// Custom enums
export const difficultyLevelEnum = pgEnum('difficulty_level', ['low', 'medium', 'hard']);
export const questionTypeEnum = pgEnum('question_type', ['multiple_choice', 'descriptive']);

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionText: text('question_text').notNull(),
  marks: integer('marks').notNull(),
  difficultyLevel: difficultyLevelEnum('difficulty_level').notNull(),
  questionType: questionTypeEnum('question_type').notNull(),
  subjectId: uuid('subject_id').references(() => subjects.id),
  topicId: uuid('topic_id').references(() => topics.id),
  classId: uuid('class_id').references(() => classes.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const questionImages = pgTable('question_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').references(() => questions.id),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const questionOptions = pgTable('question_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').notNull().references(() => questions.id),
  optionText: text('option_text').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});


// Relations

export const questionsRelations = relations(questions, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [questions.subjectId],
    references: [subjects.id]
  }),
  topic: one(topics, {
    fields: [questions.topicId],
    references: [topics.id]
  }),
  class: one(classes, {
    fields: [questions.classId],
    references: [classes.id]
  }),
  images: many(questionImages),
  options: many(questionOptions),
  examPaperQuestions: many(examPaperQuestions)
}));

export const questionImagesRelations = relations(questionImages, ({ one }) => ({
  question: one(questions, {
    fields: [questionImages.questionId],
    references: [questions.id]
  })
}));

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
  question: one(questions, {
    fields: [questionOptions.questionId],
    references: [questions.id]
  })
}));