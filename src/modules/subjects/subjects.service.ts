import { subjects } from './../../db/schema/subject';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubjectRepository } from './subjects.repository';
import { CreateSubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
  private readonly mode: any;
  private readonly awsParams: string = '';
  constructor(
    private configService: ConfigService,
    private subjectRepository: SubjectRepository
  ) {
    this.mode = this.configService.get<number>('MODE');
    this.awsParams = this.configService.get<string>('MY_PARAMETER');
  }
  async findAllSubject() {
    const subjects = await this.subjectRepository.findAllSubject();
    return {
      mode: this.mode,
      data: subjects
    };
  }

  async createSubject(data: CreateSubjectDto) {
    return this.subjectRepository.createSubject(data);
  }
}
