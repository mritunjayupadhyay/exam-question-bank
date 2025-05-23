import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Put, 
  Query, 
  ParseUUIDPipe, 
  DefaultValuePipe, 
  ParseIntPipe,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBody 
} from '@nestjs/swagger';
import { QuestionService } from './questions.service';
import { 
  QuestionBasicDto,
  QuestionDto,
} from './dto/question.dto';
import { QuestionFilterDto } from './dto/filter-question.dto';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/create-question.dto';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';
import { DifficultyLevel, QuestionType } from 'question-bank-interface';

@ApiTags('questions')
@Controller('questions')
@UseInterceptors(ClassSerializerInterceptor)  // This enables the @Exclude decorators
@UseInterceptors(ResponseInterceptor)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('filter')
  @ApiOperation({ summary: 'Filter questions by various criteria' })
  @ApiQuery({ name: 'subjectId', required: false, type: String })
  @ApiQuery({ name: 'topicIds', required: false, type: [String], isArray: true })
  @ApiQuery({ name: 'classId', required: false, type: String })
  @ApiQuery({ name: 'difficultyLevel', required: false, enum: DifficultyLevel })
  @ApiQuery({ name: 'questionType', required: false, enum: QuestionType })
  @ApiQuery({ name: 'minMarks', required: false, type: Number })
  @ApiQuery({ name: 'maxMarks', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async filterQuestions(
    @Query() filterDto: QuestionFilterDto,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    const questions = await this.questionService.filterQuestions(filterDto, limit, offset);
    return questions.map(q => new QuestionDto(q));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get question by ID' })
  @ApiParam({ name: 'id', required: true, type: String })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const question = await this.questionService.findById(id);
    return new QuestionDto(question);
  }

  @Get(':id/full')
  @ApiOperation({ summary: 'Get question by ID with all related data (options and images)' })
  @ApiParam({ name: 'id', required: true, type: String })
  async findOneWithRelations(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionService.findByIdWithRelations(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new question' })
  @ApiResponse({ status: 201, description: 'The question has been successfully created.' })
  async create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionService.create(createQuestionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a question' })
  @ApiParam({ name: 'id', required: true, type: String })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a question' })
  @ApiParam({ name: 'id', required: true, type: String })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionService.delete(id);
  }

  // Options management endpoints
  @Post(':id/options')
  @ApiOperation({ summary: 'Add an option to a question' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        optionText: { type: 'string' },
        isCorrect: { type: 'boolean' }
      },
      required: ['optionText', 'isCorrect']
    }
  })
  async addOption(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('optionText') optionText: string,
    @Body('isCorrect') isCorrect: boolean,
  ) {
    return this.questionService.addOption(id, optionText, isCorrect);
  }

  @Put('options/:optionId')
  @ApiOperation({ summary: 'Update an option' })
  @ApiParam({ name: 'optionId', required: true, type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        optionText: { type: 'string' },
        isCorrect: { type: 'boolean' }
      }
    }
  })
  async updateOption(
    @Param('optionId', ParseUUIDPipe) optionId: string,
    @Body('optionText') optionText?: string,
    @Body('isCorrect') isCorrect?: boolean,
  ) {
    return this.questionService.updateOption(optionId, optionText, isCorrect);
  }

  @Delete('options/:optionId')
  @ApiOperation({ summary: 'Delete an option' })
  @ApiParam({ name: 'optionId', required: true, type: String })
  async deleteOption(@Param('optionId', ParseUUIDPipe) optionId: string) {
    return this.questionService.deleteOption(optionId);
  }

  // Images management endpoints
  @Post(':id/images')
  @ApiOperation({ summary: 'Add an image to a question' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string' }
      },
      required: ['imageUrl']
    }
  })
  async addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.questionService.addImage(id, imageUrl);
  }

  @Put('images/:imageId')
  @ApiOperation({ summary: 'Update an image' })
  @ApiParam({ name: 'imageId', required: true, type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string' }
      },
      required: ['imageUrl']
    }
  })
  async updateImage(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.questionService.updateImage(imageId, imageUrl);
  }

  @Delete('images/:imageId')
  @ApiOperation({ summary: 'Delete an image' })
  @ApiParam({ name: 'imageId', required: true, type: String })
  async deleteImage(@Param('imageId', ParseUUIDPipe) imageId: string) {
    return this.questionService.deleteImage(imageId);
  }
}