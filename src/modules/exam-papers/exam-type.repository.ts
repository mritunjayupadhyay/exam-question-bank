import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, like, desc } from 'drizzle-orm';
import * as schema from 'exam-question-bank-db';
import { CreateExamTypeDto, UpdateExamTypeDto } from './dto/exam-type.dto';

@Injectable()
export class ExamTypeRepository {
  constructor(
    @Inject('DATABASE') private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAllExamTypes(limit = 100, offset = 0) {
    return this.db
      .select()
      .from(schema.examTypes)
      .limit(limit)
      .offset(offset);
  }

  async findById(id: string) {
    const results = await this.db
      .select()
      .from(schema.examTypes)
      .where(eq(schema.examTypes.id, id))
      .limit(1);
    
    return results.length ? results[0] : null;
  }

  async createExamType(data: CreateExamTypeDto) {
    const createData: any = {};
  
    if (data.name !== undefined) {
      createData.name = data.name;
    }
    
    const [examType] = await this.db
      .insert(schema.examTypes)
      .values(createData)
      .returning();
    
    return examType;
  }

  async updateExamType(id: string, data: UpdateExamTypeDto) {
    const updateData: any = {
      updatedAt: new Date()
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    const [updatedExamType] = await this.db
      .update(schema.examTypes)
      .set(updateData)
      .where(eq(schema.examTypes.id, id))
      .returning();
    
    return updatedExamType;
  }

  async deleteExamType(id: string) {
    const [deletedExamType] = await this.db
      .delete(schema.examTypes)
      .where(eq(schema.examTypes.id, id))
      .returning();
    
    return deletedExamType;
  }

  async searchExamTypesByName(name: string, limit = 100, offset = 0) {
    return this.db
      .select()
      .from(schema.examTypes)
      .where(like(schema.examTypes.name, `%${name}%`))
      .limit(limit)
      .offset(offset);
  }
}