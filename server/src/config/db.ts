// This file creates a PostgreSQL connection pool
// A pool manages multiple database connections at once
// instead of opening and closing a new connection every time
// which would be very slow

import { Pool } from 'pg';
import { env } from './env';

// Create the pool using our validated env variables
export const pool = new Pool({
  connectionString: env.database.url,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

console.log('✅ PostgreSQL pool created');
// Test the connection when the app starts
// This will throw an error immediately if the database
// is not reachable instead of failing silently later

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    process.exit(1); // stop the app
  }
  console.log('✅ PostgreSQL connected');
  release(); // give connection back to pool
});

