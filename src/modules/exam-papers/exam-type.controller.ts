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
    ApiQuery 
  } from '@nestjs/swagger';
  import { ExamTypeService } from './exam-type.service';
  import { CreateExamTypeDto, UpdateExamTypeDto } from './dto/exam-type.dto';
  
  @ApiTags('exam-types')
  @Controller('exam-types')
  export class ExamTypeController {
    constructor(private readonly examTypeService: ExamTypeService) {}
  
    @Get()
    @ApiOperation({ summary: 'Get all exam types with pagination' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'offset', required: false, type: Number })
    async findAll(
      @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
      @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    ) {
      return this.examTypeService.findAll(limit, offset);
    }
  
    @Get('search')
    @ApiOperation({ summary: 'Search exam types by name' })
    @ApiQuery({ name: 'name', required: true, type: String })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'offset', required: false, type: Number })
    async search(
      @Query('name') name: string,
      @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
      @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    ) {
      return this.examTypeService.searchByName(name, limit, offset);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get exam type by ID' })
    @ApiParam({ name: 'id', required: true, type: String })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.examTypeService.findById(id);
    }
  
    @Post()
    @ApiOperation({ summary: 'Create a new exam type' })
    @ApiResponse({ status: 201, description: 'The exam type has been successfully created.' })
    async create(@Body() createExamTypeDto: CreateExamTypeDto) {
      return this.examTypeService.create(createExamTypeDto);
    }
  
    @Put(':id')
    @ApiOperation({ summary: 'Update an exam type' })
    @ApiParam({ name: 'id', required: true, type: String })
    async update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateExamTypeDto: UpdateExamTypeDto,
    ) {
      return this.examTypeService.update(id, updateExamTypeDto);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete an exam type' })
    @ApiParam({ name: 'id', required: true, type: String })
    async delete(@Param('id', ParseUUIDPipe) id: string) {
      return this.examTypeService.delete(id);
    }
  }