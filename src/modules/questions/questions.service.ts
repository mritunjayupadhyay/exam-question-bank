import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QuestionRepository } from './questions.repository';

@Injectable()
export class QuestionsService {
  private readonly mode: any;
  private readonly awsParams: string = '';
  constructor(
    private configService: ConfigService,
    private qQuestionRepository: QuestionRepository
  ) {
    this.mode = this.configService.get<number>('MODE');
    this.awsParams = this.configService.get<string>('MY_PARAMETER');
  }
  async findAll() {
    const dbConnectionString = this.configService.get<string>('DATABASE_URL');
    const questions = await this.qQuestionRepository.findAll();
    return {
      mode: this.mode,
      dbConnectionString,
      data: questions
    };
  }

  findOne(id: string) {
    const envV = process.env;
    return {
      name: 'John Doe',
      id,
      mode: this.mode,
      awsParams: this.awsParams,
    };
  }
  async create(data: any) {
    console.log('data', data);
    
    return this.qQuestionRepository.create(data);
  }
}
