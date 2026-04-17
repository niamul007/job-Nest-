// This file creates a Redis client
// Redis is an in-memory data store we use for:
// 1. Caching job listings — so we don't hit the database every time
// 2. Rate limiting — tracking how many requests a user has made
// 3. Bull queues — managing background email jobs

import { createClient } from 'redis';
import { env } from './env';

// Create the Redis client
export const redisClient = createClient({
  username: env.redis.username,
  password: env.redis.password,
  socket: {
    host: env.redis.host,
    port: env.redis.port,
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

// Handle connection errors
redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});
           
// Connect to Redis
redisClient.connect().then(() => {
  console.log('✅ Redis connected successfully');
}).catch((err) => {
  console.error('❌ Failed to connect to Redis:', err.message);
  process.exit(1); // Stop the app if Redis is not available
});

