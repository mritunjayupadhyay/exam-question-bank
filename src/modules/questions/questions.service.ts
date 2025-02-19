import { Injectable } from '@nestjs/common';

@Injectable()
export class QuestionsService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return {
      name: 'John Doe',
      id,
    };
  }
}
