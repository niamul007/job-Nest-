import Bull from "bull";
import { env } from "../config/env";

/**
 * Email queue — Bull job queue for background email processing.
 * Jobs are stored in Redis and processed by email.worker.ts.
 * Decouples email sending from request/response cycle —
 * users get instant responses while emails send in background.
 */
const emailQueue = new Bull("email", {
  // Same Redis instance used for caching and rate limiting
  redis: {
    host: env.redis.host,
    port: env.redis.port,
    username: env.redis.username,
    password: env.redis.password,
  },

  defaultJobOptions: {
    /**
     * Retry failed jobs up to 3 times before marking as failed.
     * Handles transient failures like network issues or email service downtime.
     */
    attempts: 3,

    /**
     * Exponential backoff — wait longer between each retry:
     * Attempt 1 fails → wait 2s → retry
     * Attempt 2 fails → wait 4s → retry
     * Attempt 3 fails → wait 8s → retry
     * Gives email server time to recover instead of hammering it.
     */
    backoff: {
      type: 'exponential',
      delay: 2000
    },

    // Remove completed jobs from Redis — saves memory, no clutter
    removeOnComplete: true,

    // Keep failed jobs in Redis for debugging and manual retry
    removeOnFail: false
  }
});

export default emailQueue;