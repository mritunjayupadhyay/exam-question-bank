import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { DatabaseModule } from 'src/db/database.module';
import { SubjectsService } from './subjects.service';
import { SubjectRepository } from './subjects.repository';
import { SubjectsController } from './subjects.controller';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [SubjectsController],
  providers: [SubjectsService, SubjectRepository],
  exports: [SubjectsService],
})
export class SubjectsModule {}