import { integer, pgTable, serial, unique, varchar } from "drizzle-orm/pg-core";

const question = pgTable(
  "questions",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    code: varchar("code", { length: 20 }).notNull().unique(),
  }
);

export default question;