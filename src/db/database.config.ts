import { drizzle } from 'drizzle-orm/node-postgres';
import * as dotenv from 'dotenv';

import { migrate } from 'drizzle-orm/postgres-js/migrator';
// import postgres from 'postgres';
import * as postgres from 'postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Connection pooling is different in serverless environments
let db: ReturnType<typeof createDrizzleClient>;
let poolConnection: Pool; // Store the pool connection

// Create a new Drizzle client (avoiding multiple connections in serverless environment)
function createDrizzleClient() {
  // Load environment variables based on NODE_ENV
  const isLocal = process.env.NODE_ENV === 'local';
  const isDev = process.env.NODE_ENV === 'dev';
  const isProd = process.env.NODE_ENV === 'prod';
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

  console.log("what is env", { isLocal, isDev, isProd, NODE_ENV: process.env.NODE_ENV });

  // Build connection string based on environment variables
  let connectionString: string;

  if (isProd) {
    // Use the Neon URL directly
    connectionString = process.env.NEON_DATABASE_URL || '';
  } else if (isDev || isLocal) {
    // For development - either use DATABASE_URL directly or build it from components
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || 'postgres';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbName = process.env.DB_NAME || 'nestjs_db';

    connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
  } else {
    // Fallback to Neon
    connectionString = process.env.NEON_DATABASE_URL || '';
  }

  if (!connectionString) {
    throw new Error('Database connection string is not defined');
  }

  console.log(`Connecting to database in ${process.env.NODE_ENV} environment`);


  // For Neon serverless, we need different connection options
  const connectionOptions = isProd || (!isLocal && !isDev)
    ? {
      ssl: true,
      connection: {
        options: `project=${process.env.NEON_PROJECT_ID}`,
      },
      // Important settings for serverless
      max: 1, // Use a single connection in Lambda
      idle_timeout: 20, // Shorter idle timeout
      connect_timeout: 10, // Shorter connect timeout
    }
    : {
      // Dev/local settings
      max: 10, // Can use more connections locally
      idle_timeout: 30,
    };

  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '5432';
  const dbName = process.env.DB_NAME || 'nestjs_db';

  connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
  // Configure connection based on environment
  const connectionConfig = {
    host: dbHost,
    port: parseInt(dbPort),
    database: dbName,
    user: dbUser,
    password: dbPassword,
    ssl: !isLocal ? { rejectUnauthorized: false } : undefined,
  };
  // Create database pool with limited connections for serverless
  // Create database pool with limited connections for serverless
  poolConnection = new Pool({
    ...connectionConfig,
    max: 1, // Limit connections for serverless environment
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 5000, // Connection timeout after 5 seconds
  });

  // Create the Drizzle client
  //   return drizzle(sql, { schema });

  // Return drizzle instance
  return drizzle(poolConnection, { schema });
}

// Export a function to get the DB connection (ensures connection reuse)
export function getDb() {
  if (!db) {
    db = createDrizzleClient();
  }
  return db;
}

// Export the pool connection for migrations and cleanup
export const connection = {
  get pool() {
    if (!poolConnection) {
      // Ensure the pool is created if accessed directly
      createDrizzleClient();
    }
    return poolConnection;
  },
  end: async () => {
    if (poolConnection) {
      await poolConnection.end();
    }
  }
};