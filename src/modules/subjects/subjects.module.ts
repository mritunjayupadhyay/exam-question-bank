import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { DatabaseModule } from 'src/db/database.module';
import { SubjectsService } from './subjects.service';
import { SubjectRepository } from './subjects.repository';
import { SubjectsController } from './subjects.controller';
import { TopicsController } from './topics.controller';
import { TopicService } from './topics.service';
import { TopicRepository } from './topics.repository';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [SubjectsController, TopicsController],
  providers: [SubjectsService, SubjectRepository, TopicService, TopicRepository],
  exports: [SubjectsService, TopicService],
})
export class SubjectsModule {}