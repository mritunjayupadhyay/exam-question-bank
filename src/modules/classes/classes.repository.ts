import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, like, desc } from 'drizzle-orm';
import * as schema from 'exam-question-bank-db';
import { CreateClassesDto } from './dto/classes.dto';

@Injectable()
export class ClassesRepository {
  constructor(
    @Inject('DATABASE') private db: PostgresJsDatabase<typeof schema>,
  ) {}

  // Assuming you have a questions table defined in your schema
  async findAllClass(limit = 100, offset = 0) {
    // Using the schema you defined earlier
    // Note: Update the table name to match your actual schema
    return this.db
      .select()
      .from(schema.classes)
      .limit(limit)
      .offset(offset);
  }

  async findById(id: string) {
    const results = await this.db
      .select()
      .from(schema.classes)
      .where(eq(schema.classes.id, id))
      .limit(1);
    
    return results.length ? results[0] : null;
  }
  async createClass(data: CreateClassesDto) {
    const [createdClass] = await this.db
      .insert(schema.classes)
      .values({
        name: data.name
      })
      .returning();
    
    return createdClass;
  }
}