import { Injectable, NotFoundException } from '@nestjs/common';
import { ExamTypeRepository } from './exam-type.repository';
import { CreateExamTypeDto, UpdateExamTypeDto } from './dto/exam-type.dto';

@Injectable()
export class ExamTypeService {
  constructor(
    private examTypeRepository: ExamTypeRepository,
  ) {}

  async findAll(limit?: number, offset?: number) {
    return this.examTypeRepository.findAllExamTypes(limit, offset);
  }

  async findById(id: string) {
    const examType = await this.examTypeRepository.findById(id);
    if (!examType) {
      throw new NotFoundException(`Exam type with ID ${id} not found`);
    }
    return examType;
  }

  async create(createExamTypeDto: CreateExamTypeDto) {
    return this.examTypeRepository.createExamType(createExamTypeDto);
  }

  async update(id: string, updateExamTypeDto: UpdateExamTypeDto) {
    // Check if exam type exists
    const examType = await this.examTypeRepository.findById(id);
    if (!examType) {
      throw new NotFoundException(`Exam type with ID ${id} not found`);
    }
    
    return this.examTypeRepository.updateExamType(id, updateExamTypeDto);
  }

  async delete(id: string) {
    // Check if exam type exists
    const examType = await this.examTypeRepository.findById(id);
    if (!examType) {
      throw new NotFoundException(`Exam type with ID ${id} not found`);
    }
    
    return this.examTypeRepository.deleteExamType(id);
  }

  async searchByName(name: string, limit?: number, offset?: number) {
    return this.examTypeRepository.searchExamTypesByName(name, limit, offset);
  }
}