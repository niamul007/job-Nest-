import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import ApiResponse from '../utils/ApiResponse';

/**
 * Rate limiter middleware — prevents abuse by limiting requests per IP.
 * Uses Redis to track request counts with automatic expiry.
 * Fails open — if Redis is unavailable, requests pass through rather than blocking all traffic.
 *
 * Limits: 500 requests per 15 minutes per IP address.
 */

const WINDOW = 900  // time window in seconds (15 minutes)
const MAX = 500     // maximum requests allowed per window

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use IP address as the unique identifier per client
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rateLimit:${ip}`;

    /**
     * Atomic increment — Redis handles this as a single operation.
     * Creates key with value 1 if it doesn't exist.
     * Increments by 1 if it does exist.
     * Atomic prevents race conditions where two requests read the same count.
     */
    const count = await redisClient.incr(key);

    /**
     * Set expiry only on first request (count === 1).
     * Setting on every request would reset the 15 minute window each time.
     * After WINDOW seconds Redis auto-deletes the key — count resets to 0.
     */
    if (count === 1) {
      await redisClient.expire(key, WINDOW);
    }

    // Expose rate limit info in response headers — good API practice
    res.setHeader('X-RateLimit-Limit', MAX);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX - count)); // never negative
    res.setHeader('X-RateLimit-Reset', WINDOW);

    // Block request if limit exceeded
    if (count > MAX) {
      return res.status(429).json(
        ApiResponse.error("Too many requests. Please try again later.")
      );
    }

    next(); // within limit — continue to next middleware
  } catch (error) {
    // Redis unavailable — fail open (allow request) rather than blocking all traffic
    next();
  }
};