import { drizzle } from 'drizzle-orm/node-postgres';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import * as schema from './schema';

// Connection pooling is different in serverless environments
let db: ReturnType<typeof createDrizzleClient>;
let poolConnection: Pool; // Store the pool connection

// Create a new Drizzle client (avoiding multiple connections in serverless environment)
function createDrizzleClient() {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
  const isProduction = process.env.NODE_ENV === 'production';

  let connectionString: string;
  let poolConfig: any;

  console.log('isProduction', isProduction);

  if (isProduction) {
    // Use the Neon URL directly
    connectionString = process.env.NEON_DATABASE_URL || '';
    if (!connectionString) {
      throw new Error('NEON_DATABASE_URL is required in production mode');
    }
    
    poolConfig = { 
      connectionString,
      ssl: { rejectUnauthorized: false },
      // Add connection pool settings optimized for serverless
      max: 1, // Limit to 1 connection per Lambda instance
      idleTimeoutMillis: 120000, // Keep connections alive between invocations
      connectionTimeoutMillis: 10000, // Timeout for new connections

    };
  } else {
    poolConfig = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };
  } 

  poolConnection = new Pool(poolConfig);

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