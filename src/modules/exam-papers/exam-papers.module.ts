import { Module } from '@nestjs/common';
import { QuestionsModule } from '../questions/questions.module';
import { ExamPapersController } from './exam-papers.controller';
import { ExamPapersService } from './exam-papers.service';
import { ConfigModule } from '../../config/config.module';

@Module({
  imports: [ConfigModule, QuestionsModule],
  controllers: [ExamPapersController],
  providers: [ExamPapersService],
})
export class ExamPapersModule {}
