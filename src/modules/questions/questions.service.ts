import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QuestionsService {
  private readonly mode: any;
  private readonly awsParams: string = '';
  constructor(private configService: ConfigService) {
    this.mode = this.configService.get<number>('MODE');
    this.awsParams = this.configService.get<string>('MY_PARAMETER');
  }
  findAll() {
    return {
      mode: this.mode,
      data: []
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
}
