import { Module } from '@nestjs/common';
import { QuestionController } from './questions.controller';
import { QuestionService } from './questions.service';
import { ConfigModule } from '../../config/config.module';
import { DatabaseModule } from 'src/db/database.module';
import { QuestionRepository } from './questions.repository';
import { SubjectsModule } from '../subjects/subjects.module';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [ConfigModule, DatabaseModule, SubjectsModule, ClassesModule],
  controllers: [QuestionController],
  providers: [QuestionService, QuestionRepository],
  exports: [QuestionService, QuestionRepository], 
})
export class QuestionsModule {}
