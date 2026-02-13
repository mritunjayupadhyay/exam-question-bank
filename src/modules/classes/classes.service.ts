import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClassesRepository } from './classes.repository';
import { ClassDto, CreateClassesDto } from './dto/classes.dto';

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
    const allClassses = await this.classesRepository.findAllClass();
    return allClassses.map(s => new ClassDto({
          id: s.id,
          name: s.name
        }));
  }

  async createClasses(data: CreateClassesDto) {
    return this.classesRepository.createClass(data);
  }
}
