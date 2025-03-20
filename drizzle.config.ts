import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: resolve(process.cwd(), envFile) });
const isProduction = process.env.NODE_ENV === 'production';
let connectionString: string;

if (isProduction) {
  connectionString = process.env.NEON_DATABASE_URL || '';
  if (!connectionString) {
    throw new Error('NEON_DATABASE_URL is required in production mode');
  }
} else {
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '5432';
  const dbName = process.env.DB_NAME || 'nestjs_db';
  connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
}

  export default defineConfig({
      schema: "./src/db/schema/index.ts",
      out: "./src/db/migrations",
      dialect: 'postgresql',
      dbCredentials: {
        url: connectionString as string,
      }
  });