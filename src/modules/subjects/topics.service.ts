import { Injectable, NotFoundException } from '@nestjs/common';
import { TopicRepository } from './topics.repository';
import { CreateTopicDto, TopicDto, UpdateTopicDto } from './dto/topic.dto';
import { SubjectRepository } from './subjects.repository';

@Injectable()
export class TopicService {
  constructor(
    private topicRepository: TopicRepository,
    private subjectRepository: SubjectRepository,
  ) {}

  async findAll(limit?: number, offset?: number) {
    return this.topicRepository.findAllTopics(limit, offset);
  }

  async findById(id: string) {
    const topic = await this.topicRepository.findById(id);
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    return topic;
  }

  async findBySubjectId(subjectId: string, limit?: number, offset?: number) {
    // Check if subject exists
    const subject = await this.subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }
    
    const topics = await this.topicRepository.findBySubjectId(subjectId, limit, offset);
    return topics.map(s => new TopicDto({
              id: s.id,
              name: s.name
            }));
  }

  async create(createTopicDto: CreateTopicDto) {
    // Check if subject exists
    const subject = await this.subjectRepository.findById(createTopicDto.subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${createTopicDto.subjectId} not found`);
    }
    
    return this.topicRepository.createTopic(createTopicDto);
  }

  async update(id: string, updateTopicDto: UpdateTopicDto) {
    // Check if topic exists
    const topic = await this.topicRepository.findById(id);
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    
    // If subjectId is being updated, check if the subject exists
    if (updateTopicDto.subjectId) {
      const subject = await this.subjectRepository.findById(updateTopicDto.subjectId);
      if (!subject) {
        throw new NotFoundException(`Subject with ID ${updateTopicDto.subjectId} not found`);
      }
    }
    
    return this.topicRepository.updateTopic(id, updateTopicDto);
  }

  async delete(id: string) {
    // Check if topic exists
    const topic = await this.topicRepository.findById(id);
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    
    return this.topicRepository.deleteTopic(id);
  }

  async searchByName(name: string, limit?: number, offset?: number) {
    return this.topicRepository.searchTopicsByName(name, limit, offset);
  }
}