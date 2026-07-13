import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimiter(maxRequests: number = 100, windowMs: number = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}-${req.path}`;
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = { count: 1, resetTime: now + windowMs };
      return next();
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      res.status(429).json({
        success: false,
        error: "Too many requests. Please try again later.",
      });
      return;
    }

    next();
  };
}

export function strictRateLimiter(maxRequests: number = 10, windowMs: number = 60 * 1000) {
  return rateLimiter(maxRequests, windowMs);
}
