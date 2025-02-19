/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get } from '@nestjs/common';
import { ExamPapersService } from './exam_papers.service';

@Controller('exam_papers')
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
