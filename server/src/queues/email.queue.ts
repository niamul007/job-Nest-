import Bull from "bull";
import { env } from "../config/env";

const emailQueue = new Bull("email", {
  redis: {
    host: env.redis.host,
    port: env.redis.port,
    username: env.redis.username,
    password: env.redis.password,
  },
  // ✅ add these - you were missing them
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
})

export default emailQueue;