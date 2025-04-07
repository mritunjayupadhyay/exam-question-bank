/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateClassesDto } from './dto/classes.dto';
import { ClassesService } from './classes.service';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';

@ApiTags('classes')
@Controller('classes')
@UseInterceptors(ResponseInterceptor)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get('/')
  findAll() {
    return this.classesService.findAllClasses();
  }

  @Post('/')
  create(
    @Body() createClassesDto: CreateClassesDto
  ) {
    return this.classesService.createClasses(createClassesDto);
  }
}
