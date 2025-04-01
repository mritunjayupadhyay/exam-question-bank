import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { DatabaseModule } from 'src/db/database.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [ConfigModule, DatabaseModule, SubjectsModule, ClassesModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class BasicSetupModule {}
