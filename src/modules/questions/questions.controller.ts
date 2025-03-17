/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Body, Controller, Get, Post } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateQuestionDto } from './dto/create-question.dto';

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll() {
    return this.questionsService.findAll();
  }

  @Get('/question')
  findOne() {
    const parsedId = '10';
    return this.questionsService.findOne(parsedId);
  }
  @Post('/question')
  create(
    @Body() createSubjectDto: CreateQuestionDto
  ) {
    return this.questionsService.create(createSubjectDto);
  }
}
