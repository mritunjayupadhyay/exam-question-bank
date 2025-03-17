import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, like, desc } from 'drizzle-orm';
import * as schema from '../../db/schema';

@Injectable()
export class QuestionRepository {
  constructor(
    @Inject('DATABASE') private db: PostgresJsDatabase<typeof schema>,
  ) {}

  // Assuming you have a questions table defined in your schema
  async findAll(limit = 100, offset = 0) {
    // Using the schema you defined earlier
    // Note: Update the table name to match your actual schema
    return this.db
      .select()
      .from(schema.question)
      .limit(limit)
      .offset(offset);
  }

  async findById(id: string) {
    const results = await this.db
      .select()
      .from(schema.question)
      .where(eq(schema.question.id, Number(id)))
      .limit(1);
    
    return results.length ? results[0] : null;
  }
  async create(data: any) {
    const [question] = await this.db
      .insert(schema.question)
      .values(data)
      .returning();
    
    return question;
  }
}