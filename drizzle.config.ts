// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: resolve(process.cwd(), envFile) });

// Connection string based on environment
// const connectionString = process.env.NODE_ENV === 'production'
//   ? process.env.NEON_DATABASE_URL
//   : process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/nestjs_db';

  const dbUser = process.env.DB_USER || 'postgres';
        const dbPassword = process.env.DB_PASSWORD || 'postgres';
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = process.env.DB_PORT || '5432';
        const dbName = process.env.DB_NAME || 'nestjs_db';
    const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

  export default defineConfig({
      schema: "./src/db/schema/index.ts",
      out: "./src/db/migrations",
      dialect: 'postgresql',
      dbCredentials: {
        url: connectionString as string,
      }
  });