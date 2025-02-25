import { Injectable } from '@nestjs/common';
import { QuestionsService } from '../questions/questions.service';

@Injectable()
export class ExamPapersService {
  constructor(private readonly questionsService: QuestionsService) {}
  findAll() {
    return [];
  }

  findOne(id: string) {
    const question = this.questionsService.findOne(id);
    return {
      name: 'Physics',
      id,
      question,
    };
  }
}
