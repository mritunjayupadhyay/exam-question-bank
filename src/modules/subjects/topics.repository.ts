import { topics } from './../../db/schema/subject';
import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, like, desc, sql } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { CreateTopicDto, UpdateTopicDto } from './dto/topic.dto';

@Injectable()
export class TopicRepository {
  constructor(
    @Inject('DATABASE') private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAllTopics(limit = 100, offset = 0) {
    return this.db
      .select()
      .from(schema.topics)
      .limit(limit)
      .offset(offset);
  }

  async findById(id: string) {
    const results = await this.db
      .select()
      .from(schema.topics)
      .where(eq(schema.topics.id, id))
      .limit(1);
    
    return results.length ? results[0] : null;
  }

  async findBySubjectId(subjectId: string, limit = 100, offset = 0) {
    return this.db
      .select()
      .from(schema.topics)
      .where(eq(schema.topics.subjectId, subjectId))
      .limit(limit)
      .offset(offset);
  }

  async createTopic(data: CreateTopicDto) {
    const createData: any = {};
  
    // Only add properties if they are defined
    if (data.name !== undefined) {
      createData.name = data.name;
    }
    
    if (data.subjectId !== undefined) {
      createData.subjectId = data.subjectId;
    }
    
    const [topic] = await this.db
      .insert(schema.topics)
      .values(createData)
      .returning();
    
    return topic;
  }

  async updateTopic(id: string, data: UpdateTopicDto) {
    // Create an update object with only the properties that are provided
    const updateData: any = {
        updatedAt: new Date()
      };
  
      // Only add properties if they are defined
      if (data.name !== undefined) {
        updateData.name = data.name;
      }
      
      if (data.subjectId !== undefined) {
        updateData.subjectId = data.subjectId;
      }
  
      const [updatedTopic] = await this.db
        .update(schema.topics)
        .set(updateData)
        .where(eq(schema.topics.id, id))
        .returning();
      
      return updatedTopic;
  }

  async deleteTopic(id: string) {
    const [deletedTopic] = await this.db
      .delete(schema.topics)
      .where(eq(schema.topics.id, id))
      .returning();
    
    return deletedTopic;
  }

  async searchTopicsByName(name: string, limit = 100, offset = 0) {
    return this.db
      .select()
      .from(schema.topics)
      .where(sql`LOWER(${schema.topics.name}) LIKE LOWER(${'%' + name + '%'})`)
      .limit(limit)
      .offset(offset);
  }
}