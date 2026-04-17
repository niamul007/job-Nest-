import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import ApiResponse from '../utils/ApiResponse';

const WINDOW = 900;
const MAX = 100;

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rateLimit:${ip}`;

    // ✅ atomic increment
    const count = await redisClient.incr(key);

    // ✅ set expiry on first request
    if (count === 1) {
      await redisClient.expire(key, WINDOW);
    }

    // ✅ rate limit headers
    res.setHeader('X-RateLimit-Limit', MAX);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX - count));
    res.setHeader('X-RateLimit-Reset', WINDOW);

    if (count > MAX) {
      return res.status(429).json(ApiResponse.error("Too many requests. Please try again later."));
    }

    next();
  } catch (error) {
    next(); // don't block if Redis fails
  }
};