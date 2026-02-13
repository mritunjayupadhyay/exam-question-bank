import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubjectRepository } from './subjects.repository';
import { CreateSubjectDto, SubjectDto } from './dto/subject.dto';

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
    return subjects.map(s => new SubjectDto({
      id: s.id,
      name: s.name
    }));
  }

  async createSubject(data: CreateSubjectDto) {
    return this.subjectRepository.createSubject(data);
  }
}
