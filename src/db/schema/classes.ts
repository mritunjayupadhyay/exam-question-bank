import { relations } from "drizzle-orm";
import { integer, pgTable, serial, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { questions } from "./question";
import { examPapers } from "./examPaper";

export const classes = pgTable('classes', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 20 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
  });

  export const classesRelations = relations(classes, ({ many }) => ({
    questions: many(questions),
    examPapers: many(examPapers)
  }));