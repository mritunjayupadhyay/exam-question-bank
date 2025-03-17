import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDb } from './database.config';

// Database provider - Note we're not running migrations on Lambda initialization
const databaseProvider: Provider = {
  provide: 'DATABASE',
  useFactory: (configService: ConfigService) => {
    return getDb();
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  providers: [databaseProvider],
  exports: ['DATABASE'],
})
export class DatabaseModule {}