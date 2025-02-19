import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExamPapersModule } from './modules/exam_papers/exam_papers.module';
import { QuestionsModule } from './modules/questions/questions.module';

@Module({
  imports: [ExamPapersModule, QuestionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
