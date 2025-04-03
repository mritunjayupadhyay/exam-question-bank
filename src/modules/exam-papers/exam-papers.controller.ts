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
  ParseIntPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBody 
} from '@nestjs/swagger';
import { 
  CreateExamPaperDto, 
  UpdateExamPaperDto, 
  ExamPaperFilterDto, 
  AddQuestionToExamPaperDto, 
  UpdateExamPaperQuestionDto 
} from './dto/exam-paper.dto';
import { ExamPaperService } from './exam-papers.service';
import { ExamPaperGeneratorService } from './exam-paper.generator.service';
import { GenerateExamPaperDto, GenerateQuestionForExamSectionDto } from './dto/exam-paper-generator.dto';

@ApiTags('exam-papers')
@Controller('exam-papers')
export class ExamPaperController {
  constructor(
    private readonly examPaperService: ExamPaperService,
    private readonly examPaperGeneratorService: ExamPaperGeneratorService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all exam papers with pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.examPaperService.findAll(limit, offset);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search exam papers by title' })
  @ApiQuery({ name: 'title', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async search(
    @Query('title') title: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.examPaperService.searchByTitle(title, limit, offset);
  }

  @Get('filter')
  @ApiOperation({ summary: 'Filter exam papers by various criteria' })
  @ApiQuery({ name: 'examTypeId', required: false, type: String })
  @ApiQuery({ name: 'subjectId', required: false, type: String })
  @ApiQuery({ name: 'classId', required: false, type: String })
  @ApiQuery({ name: 'minTotalMarks', required: false, type: Number })
  @ApiQuery({ name: 'maxTotalMarks', required: false, type: Number })
  @ApiQuery({ name: 'minDurationMinutes', required: false, type: Number })
  @ApiQuery({ name: 'maxDurationMinutes', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async filterExamPapers(
    @Query() filterDto: ExamPaperFilterDto,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.examPaperService.filterExamPapers(filterDto, limit, offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam paper by ID' })
  @ApiParam({ name: 'id', required: true, type: String })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.examPaperService.findById(id);
  }

  @Get(':id/full')
  @ApiOperation({ summary: 'Get exam paper by ID with all questions' })
  @ApiParam({ name: 'id', required: true, type: String })
  async findOneWithQuestions(@Param('id', ParseUUIDPipe) id: string) {
    return this.examPaperService.findByIdWithQuestions(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new exam paper' })
  @ApiResponse({ status: 201, description: 'The exam paper has been successfully created.' })
  async create(@Body() createExamPaperDto: CreateExamPaperDto) {
    return this.examPaperService.create(createExamPaperDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an exam paper' })
  @ApiParam({ name: 'id', required: true, type: String })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExamPaperDto: UpdateExamPaperDto,
  ) {
    return this.examPaperService.update(id, updateExamPaperDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an exam paper' })
  @ApiParam({ name: 'id', required: true, type: String })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.examPaperService.delete(id);
  }

  // Question management endpoints
  @Get(':id/questions')
  @ApiOperation({ summary: 'Get all questions in an exam paper' })
  @ApiParam({ name: 'id', required: true, type: String })
  async getExamPaperQuestions(@Param('id', ParseUUIDPipe) id: string) {
    return this.examPaperService.getExamPaperQuestions(id);
  }

  @Post(':id/questions')
  @ApiOperation({ summary: 'Add a question to an exam paper' })
  @ApiParam({ name: 'id', required: true, type: String })
  async addQuestionToExamPaper(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: AddQuestionToExamPaperDto,
  ) {
    return this.examPaperService.addQuestionToExamPaper(id, data);
  }

  @Put(':examPaperId/questions/:questionId')
  @ApiOperation({ summary: 'Update a question in an exam paper' })
  @ApiParam({ name: 'examPaperId', required: true, type: String })
  @ApiParam({ name: 'questionId', required: true, type: String })
  async updateExamPaperQuestion(
    @Param('examPaperId', ParseUUIDPipe) examPaperId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() data: UpdateExamPaperQuestionDto,
  ) {
    return this.examPaperService.updateExamPaperQuestion(examPaperId, questionId, data);
  }

  @Delete(':examPaperId/questions/:questionId')
  @ApiOperation({ summary: 'Remove a question from an exam paper' })
  @ApiParam({ name: 'examPaperId', required: true, type: String })
  @ApiParam({ name: 'questionId', required: true, type: String })
  async removeQuestionFromExamPaper(
    @Param('examPaperId', ParseUUIDPipe) examPaperId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
  ) {
    return this.examPaperService.removeQuestionFromExamPaper(examPaperId, questionId);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate an exam paper automatically using configuration' })
  @ApiResponse({ 
    status: 201, 
    description: 'The exam paper has been successfully generated.' 
  })
  async generateExamPaper(@Body() generateDto: GenerateExamPaperDto) {
    return this.examPaperGeneratorService.generateExamPaper(generateDto);
  } 

  @Post('questions-for-exam-paper-section')
  @ApiOperation({ summary: 'Generate an exam paper automatically using configuration' })
  @ApiResponse({ 
    status: 201, 
    description: 'The exam paper section has been successfully generated.' 
  })
  async getQuestionForExamPaperSection(@Body() generateDto: GenerateQuestionForExamSectionDto) {
    return this.examPaperGeneratorService.generateQuestionsForSection(generateDto);
  }
}