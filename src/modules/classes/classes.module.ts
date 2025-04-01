import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { DatabaseModule } from 'src/db/database.module';
import { ClassesController } from './classes.controller';
import { ClassesRepository } from './classes.repository';
import { ClassesService } from './classes.service';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [ClassesController],
  providers: [ClassesService, ClassesRepository],
  exports: [ClassesService],
})
export class ClassesModule {}