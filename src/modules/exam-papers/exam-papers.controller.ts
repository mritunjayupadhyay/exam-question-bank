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
  UseInterceptors,
  HttpCode,
  HttpStatus
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
} from './dto/exam-paper.dto';
import { ExamPaperService } from './exam-papers.service';
// import { ExamPaperGeneratorService } from './exam-paper.generator.service';
// import { GenerateExamPaperDto, GenerateQuestionForExamSectionDto } from './dto/exam-paper-generator.dto';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';
import { ExamPaperSectionService } from './exam-paper-section.service';
import { AddMultipleQuestionsToSectionDto, AddQuestionToSectionDto, CreateSectionDto, UpdateQuestionInSectionDto, UpdateSectionDto } from './dto/exam-section.dto';

@ApiTags('exam-papers')
@Controller('exam-papers')
@UseInterceptors(ResponseInterceptor)
export class ExamPaperController {
  constructor(
    private readonly examPaperService: ExamPaperService,
    private readonly examPaperSectionService: ExamPaperSectionService,
    // private readonly examPaperGeneratorService: ExamPaperGeneratorService
  ) { }

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

  @Get(':id/short-details')
  @ApiOperation({ summary: 'Get exam paper by ID with all questions' })
  @ApiParam({ name: 'id', required: true, type: String })
  async findOneNoDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.examPaperService.findOneNoDetails(id);
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

  // @Post('generate')
  // @ApiOperation({ summary: 'Generate an exam paper automatically using configuration' })
  // @ApiResponse({ 
  //   status: 201, 
  //   description: 'The exam paper has been successfully generated.' 
  // })
  // async generateExamPaper(@Body() generateDto: GenerateExamPaperDto) {
  //   return this.examPaperGeneratorService.generateExamPaper(generateDto);
  // } 

  // @Post('questions-for-exam-paper-section')
  // @ApiOperation({ summary: 'Generate an exam paper automatically using configuration' })
  // @ApiResponse({ 
  //   status: 201, 
  //   description: 'The exam paper section has been successfully generated.' 
  // })
  // async getQuestionForExamPaperSection(@Body() generateDto: GenerateQuestionForExamSectionDto) {
  //   return this.examPaperGeneratorService.generateQuestionsForSection(generateDto);
  // }

  @Get(':examPaperId/sections')
  @ApiOperation({ summary: 'Get all sections for an exam paper' })
  @ApiParam({ name: 'examPaperId', description: 'Exam paper UUID' })
  @ApiResponse({ status: 200, description: 'Sections retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Exam paper not found' })
  async getSections(@Param('examPaperId', ParseUUIDPipe) examPaperId: string) {
    return this.examPaperSectionService.getSectionsByExamPaper(examPaperId);
  }

  @Post(':examPaperId/sections')
  @ApiOperation({ summary: 'Create a new section for an exam paper' })
  @ApiParam({ name: 'examPaperId', description: 'Exam paper UUID' })
  @ApiResponse({ status: 201, description: 'Section created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Exam paper not found' })
  @ApiResponse({ status: 409, description: 'Section number already exists' })
  @HttpCode(HttpStatus.CREATED)
  async createSection(
    @Param('examPaperId', ParseUUIDPipe) examPaperId: string,
    @Body() createSectionDto: CreateSectionDto,
  ) {
    console.log('Creating section for exam paper:', examPaperId, 'with data:', createSectionDto);
    return this.examPaperSectionService.createSection(examPaperId, createSectionDto);
  }

  @Get('sections/:sectionId')
  @ApiOperation({ summary: 'Get section by ID' })
  @ApiParam({ name: 'sectionId', description: 'Section UUID' })
  @ApiResponse({ status: 200, description: 'Section found' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async getSection(@Param('sectionId', ParseUUIDPipe) sectionId: string) {
    return this.examPaperSectionService.getSectionById(sectionId);
  }

  @Get('sections/:sectionId/with-questions')
  @ApiOperation({ summary: 'Get section with all its questions' })
  @ApiParam({ name: 'sectionId', description: 'Section UUID' })
  @ApiResponse({ status: 200, description: 'Section with questions found' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async getSectionWithQuestions(@Param('sectionId', ParseUUIDPipe) sectionId: string) {
    return this.examPaperSectionService.getSectionWithQuestions(sectionId);
  }

  @Put('sections/:sectionId')
  @ApiOperation({ summary: 'Update a section' })
  @ApiParam({ name: 'sectionId', description: 'Section UUID' })
  @ApiResponse({ status: 200, description: 'Section updated successfully' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateSection(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    return this.examPaperSectionService.updateSection(sectionId, updateSectionDto);
  }

  @Delete('sections/:sectionId')
  @ApiOperation({ summary: 'Delete a section and all its questions' })
  @ApiParam({ name: 'sectionId', description: 'Section UUID' })
  @ApiResponse({ status: 200, description: 'Section deleted successfully' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async deleteSection(@Param('sectionId', ParseUUIDPipe) sectionId: string) {
    return this.examPaperSectionService.deleteSection(sectionId);
  }

  @Get('sections/:sectionId/questions')
  @ApiOperation({ summary: 'Get all questions in a section' })
  @ApiParam({ name: 'sectionId', description: 'Section UUID' })
  @ApiResponse({ status: 200, description: 'Questions retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async getQuestionsInSection(@Param('sectionId', ParseUUIDPipe) sectionId: string) {
    return this.examPaperSectionService.getQuestionsInSection(sectionId);
  }

  @Post('sections/:sectionId/questions')
  @ApiOperation({ summary: 'Add a question to a section' })
  @ApiParam({ name: 'sectionId', description: 'Section UUID' })
  @ApiResponse({ status: 201, description: 'Question added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or section is full' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  @ApiResponse({ status: 409, description: 'Question already exists in section or question number taken' })
  @HttpCode(HttpStatus.CREATED)
  async addQuestionToSection(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() addQuestionDto: AddQuestionToSectionDto,
  ) {
    return this.examPaperSectionService.addQuestionToSection(sectionId, addQuestionDto);
  }

  @Post('sections/:sectionId/questions/bulk')
  @ApiOperation({ summary: 'Add multiple questions to a section' })
  @ApiParam({ name: 'sectionId', description: 'Section UUID' })
  @ApiResponse({ status: 201, description: 'Questions added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or would exceed section limit' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  @ApiResponse({ status: 409, description: 'Some questions already exist in section' })
  @HttpCode(HttpStatus.CREATED)
  async addMultipleQuestionsToSection(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() addQuestionsDto: AddMultipleQuestionsToSectionDto,
  ) {
    return this.examPaperSectionService.addMultipleQuestionsToSection(sectionId, addQuestionsDto);
  }

  @Delete('sections/:sectionId/questions/:questionId')
  @ApiOperation({ summary: 'Remove a question from a section by question ID' })
  @ApiParam({ name: 'sectionId', description: 'Section UUID' })
  @ApiParam({ name: 'questionId', description: 'Question UUID' })
  @ApiResponse({ status: 200, description: 'Question removed successfully' })
  @ApiResponse({ status: 404, description: 'Section or question not found' })
  async removeQuestionFromSection(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
  ) {
    return this.examPaperSectionService.removeQuestionFromSection(sectionId, questionId);
  }

  @Delete('exam-paper-questions/:examPaperQuestionId')
  @ApiOperation({ summary: 'Remove a question from section by exam paper question ID' })
  @ApiParam({ name: 'examPaperQuestionId', description: 'Exam paper question UUID (junction table ID)' })
  @ApiResponse({ status: 200, description: 'Question removed successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async removeQuestionFromSectionById(
    @Param('examPaperQuestionId', ParseUUIDPipe) examPaperQuestionId: string,
  ) {
    return this.examPaperSectionService.removeQuestionFromSectionById(examPaperQuestionId);
  }

  @Put('exam-paper-questions/:examPaperQuestionId')
  @ApiOperation({ summary: 'Update question details in a section' })
  @ApiParam({ name: 'examPaperQuestionId', description: 'Exam paper question UUID (junction table ID)' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateQuestionInSection(
    @Param('examPaperQuestionId', ParseUUIDPipe) examPaperQuestionId: string,
    @Body() updateQuestionDto: UpdateQuestionInSectionDto,
  ) {
    return this.examPaperSectionService.updateQuestionInSection(examPaperQuestionId, updateQuestionDto);
  }
}