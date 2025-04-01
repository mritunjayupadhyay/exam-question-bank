import { Module } from '@nestjs/common';
import { QuestionsModule } from '../questions/questions.module';
import { ExamPapersController } from './exam-papers.controller';
import { ExamPapersService } from './exam-papers.service';
import { ConfigModule } from '../../config/config.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [ConfigModule, QuestionsModule, SubjectsModule],
  controllers: [ExamPapersController],
  providers: [ExamPapersService],
})
export class ExamPapersModule {}
