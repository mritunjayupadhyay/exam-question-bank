/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSubjectDto } from './dto/subject.dto';
import { SubjectsService } from './subjects.service';

@ApiTags('subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get('/')
  findAll() {
    return this.subjectsService.findAllSubject();
  }

  @Post('/')
  create(
    @Body() createSubjectDto: CreateSubjectDto
  ) {
    return this.subjectsService.createSubject(createSubjectDto);
  }
}
