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
  UseInterceptors
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

@ApiTags('exam-papers')
@Controller('exam-papers')
@UseInterceptors(ResponseInterceptor)
export class ExamPaperController {
  constructor(
    private readonly examPaperService: ExamPaperService,
    // private readonly examPaperGeneratorService: ExamPaperGeneratorService
  ) {}

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
}