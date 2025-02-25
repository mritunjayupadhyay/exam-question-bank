import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExamPapersModule } from './modules/exam-papers/exam-papers.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ExamPapersModule, QuestionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
