import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { ConfigModule } from '../../config/config.module';
import { DatabaseModule } from 'src/db/database.module';
import { QuestionRepository } from './questions.repository';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [ConfigModule, DatabaseModule, SubjectsModule],
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionRepository],
  exports: [QuestionsService],
})
export class QuestionsModule {}
