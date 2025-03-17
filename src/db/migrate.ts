// import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import config from '../../drizzle.config';
import { connection, getDb } from './database.config';

async function runMigrations() {
  await migrate(getDb(), { migrationsFolder: config.out! });
  await connection.end();
}

runMigrations().catch(error => {
  console.error(error);
  process.exit(1);
});