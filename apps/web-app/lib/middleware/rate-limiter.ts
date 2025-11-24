/**
 * Rate Limiting Middleware
 * 
 * Prevents API abuse by limiting the number of requests per IP address
 * Uses in-memory store (for development) - should use Redis in production
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production)
const store: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default: 15 minutes)
  maxRequests?: number; // Maximum requests per window (default: 100)
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

/**
 * Get client identifier (IP address)
 */
function getClientId(req: NextApiRequest): string {
  // Try to get real IP from various headers (for proxies/load balancers)
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const ip = forwarded 
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim())
    : realIp
    ? (Array.isArray(realIp) ? realIp[0] : realIp)
    : req.socket.remoteAddress || 'unknown';
  
  return ip as string;
}

/**
 * Rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const clientId = getClientId(req);
    const now = Date.now();
    const key = `${clientId}:${req.url}`;

    // Get or create rate limit entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const entry = store[key];
    entry.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000), // seconds
      });
    }

    // Store original json method to track response status
    const originalJson = res.json.bind(res);
    res.json = function(body: any) {
      const statusCode = res.statusCode;
      const isSuccess = statusCode >= 200 && statusCode < 400;
      const isFailure = statusCode >= 400;

      // Adjust count based on response status
      if (skipSuccessfulRequests && isSuccess) {
        entry.count = Math.max(0, entry.count - 1);
      }
      if (skipFailedRequests && isFailure) {
        entry.count = Math.max(0, entry.count - 1);
      }

      return originalJson(body);
    };

    next();
  };
}

/**
 * Create rate limiter with custom options
 */
export function createRateLimiter(options: RateLimitOptions) {
  return rateLimit(options);
}

/**
 * Strict rate limiter for sensitive endpoints (login, registration, etc.)
 */
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // Only 5 requests per 15 minutes
  message: 'Too many attempts. Please try again later.',
});

/**
 * Standard rate limiter for regular API endpoints
 */
export const standardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many requests. Please try again later.',
});

/**
 * Lenient rate limiter for read-only endpoints
 */
export const lenientRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 500, // 500 requests per 15 minutes
  message: 'Too many requests. Please try again later.',
});

