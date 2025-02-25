import { Module } from '@nestjs/common';
import { QuestionsModule } from '../questions/questions.module';
import { ExamPapersController } from './exam-papers.controller';
import { ExamPapersService } from './exam-papers.service';

@Module({
  imports: [QuestionsModule],
  controllers: [ExamPapersController],
  providers: [ExamPapersService],
})
export class ExamPapersModule {}
