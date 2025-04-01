import { Controller, Get, Post, Body, Param, Delete, Put, Query, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TopicService } from './topics.service';
import { CreateTopicDto, UpdateTopicDto } from './dto/topic.dto';

@ApiTags('topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicService: TopicService) {}

  @Get()
  @ApiOperation({ summary: 'Get all topics with pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.topicService.findAll(limit, offset);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search topics by name' })
  @ApiQuery({ name: 'name', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async search(
    @Query('name') name: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.topicService.searchByName(name, limit, offset);
  }

  @Get('subject/:subjectId')
  @ApiOperation({ summary: 'Get topics by subject ID' })
  @ApiParam({ name: 'subjectId', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findBySubjectId(
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.topicService.findBySubjectId(subjectId, limit, offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get topic by ID' })
  @ApiParam({ name: 'id', required: true, type: String })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.topicService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiResponse({ status: 201, description: 'The topic has been successfully created.' })
  async create(@Body() createTopicDto: CreateTopicDto) {
    return this.topicService.create(createTopicDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a topic' })
  @ApiParam({ name: 'id', required: true, type: String })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTopicDto: UpdateTopicDto,
  ) {
    return this.topicService.update(id, updateTopicDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a topic' })
  @ApiParam({ name: 'id', required: true, type: String })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.topicService.delete(id);
  }
}