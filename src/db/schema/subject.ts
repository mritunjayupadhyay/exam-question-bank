import { relations } from "drizzle-orm";
import { integer, pgTable, serial, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { questions } from "./question";
import { examPapers } from "./examPaper";

export const subjects = pgTable('subjects', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
  });

  export const topics = pgTable('topics', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 200 }).notNull(),
    subjectId: uuid('subject_id').references(() => subjects.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
  });


  // Relations
  export const subjectsRelations = relations(subjects, ({ many }) => ({
    topics: many(topics),
    questions: many(questions),
    examPapers: many(examPapers)
  }));

  export const topicsRelations = relations(topics, ({ one, many }) => ({
    subject: one(subjects, {
      fields: [topics.subjectId],
      references: [subjects.id]
    }),
    questions: many(questions)
  }));