import { Module } from '@nestjs/common';
import { QuestionsModule } from '../questions/questions.module';
import { ExamPaperController } from './exam-papers.controller';
import { ExamPaperService } from './exam-papers.service';
import { ConfigModule } from '../../config/config.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { ExamPaperRepository } from './exam-paper.repository';
import { ExamTypeService } from './exam-type.service';
import { ExamTypeRepository } from './exam-type.repository';
import { ClassesModule } from '../classes/classes.module';
import { DatabaseModule } from 'src/db/database.module';
import { ExamTypeController } from './exam-type.controller';

@Module({
  imports: [ConfigModule, DatabaseModule, QuestionsModule, SubjectsModule, ClassesModule],
  controllers: [ExamPaperController, ExamTypeController],
  providers: [
    ExamPaperService, 
    ExamPaperRepository, 
    ExamTypeService, 
    ExamTypeRepository
  ],
  exports: [ExamPaperService, ExamPaperRepository, ExamTypeService, ExamTypeRepository],
})
export class ExamPapersModule {}
