import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import ApiResponse from '../utils/ApiResponse';

const WINDOW = 900;    // 15 minutes in seconds
const MAX = 100;       // max requests per window

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip;
    const key = `rateLimit:${ip}`;
    const count = await redisClient.get(key);
    if(count && parseInt(count) >= MAX) {
      return res.status(429).json(ApiResponse.error("Too many requests. Please try again later."));
    }
    if(!count) {
      await redisClient.setEx(key, WINDOW, '1');
    } else {
      await redisClient.incr(key);
    }
    next(); 

  } catch (error) {
    next();
  }
};