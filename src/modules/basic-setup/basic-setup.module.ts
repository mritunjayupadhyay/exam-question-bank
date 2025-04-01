import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { DatabaseModule } from 'src/db/database.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [ConfigModule, DatabaseModule, SubjectsModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class BasicSetupModule {}
