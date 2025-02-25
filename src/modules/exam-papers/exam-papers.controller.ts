/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get } from '@nestjs/common';
import { ExamPapersService } from './exam-papers.service';

@Controller('exam-papers')
export class ExamPapersController {
  constructor(private readonly examPapersService: ExamPapersService) {}

  @Get()
  findAll() {
    return this.examPapersService.findAll();
  }

  @Get('/:id')
  findOne() {
    const parsedId = '10';
    return this.examPapersService.findOne(parsedId);
  }
}
