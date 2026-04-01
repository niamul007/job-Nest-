// This file creates a PostgreSQL connection pool
// A pool manages multiple database connections at once
// instead of opening and closing a new connection every time
// which would be very slow

import { Pool } from 'pg';
import { env } from './env';

// Create the pool using our validated env variables
export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
});

// Test the connection when the app starts
// This will throw an error immediately if the database
// is not reachable instead of failing silently later
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    process.exit(1); // Stop the app — no point running without a database
  }

  console.log('✅ PostgreSQL connected successfully');
  release(); // Release the client back to the pool
});