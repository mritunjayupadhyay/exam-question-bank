import { subjects } from './../../db/schema/subject';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClassesRepository } from './classes.repository';
import { CreateClassesDto } from './dto/classes.dto';

@Injectable()
export class ClassesService {
  private readonly mode: any;
  private readonly awsParams: string = '';
  constructor(
    private configService: ConfigService,
    private classesRepository: ClassesRepository
  ) {
    this.mode = this.configService.get<number>('MODE');
    this.awsParams = this.configService.get<string>('MY_PARAMETER');
  }
  async findAllClasses() {
    const subjects = await this.classesRepository.findAllClass();
    return {
      mode: this.mode,
      data: subjects
    };
  }

  async createClasses(data: CreateClassesDto) {
    return this.classesRepository.createClass(data);
  }
}
