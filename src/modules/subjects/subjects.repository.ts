import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, like, desc } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { CreateSubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectRepository {
  constructor(
    @Inject('DATABASE') private db: PostgresJsDatabase<typeof schema>,
  ) {}

  // Assuming you have a questions table defined in your schema
  async findAllSubject(limit = 100, offset = 0) {
    // Using the schema you defined earlier
    // Note: Update the table name to match your actual schema
    return this.db
      .select()
      .from(schema.subjects)
      .limit(limit)
      .offset(offset);
  }

  async findById(id: string) {
    const results = await this.db
      .select()
      .from(schema.subjects)
      .where(eq(schema.subjects.id, id))
      .limit(1);
    
    return results.length ? results[0] : null;
  }
  async createSubject(data: CreateSubjectDto) {
    const [subject] = await this.db
      .insert(schema.subjects)
      .values({
        name: data.name
      })
      .returning();
    
    return subject;
  }
}