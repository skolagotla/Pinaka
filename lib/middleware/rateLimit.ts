import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Rate Limiting Middleware
 * 
 * Simple in-memory rate limiting for API endpoints.
 * For production, consider using Redis or a dedicated service.
 */

type RateLimitStore = {
  [key: string]: {
    count: number;
    resetTime: number;
  };
};

const store: RateLimitStore = {};

/**
 * Rate limit configuration
 */
export type RateLimitOptions = {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string; // Custom error message
  keyGenerator?: (req: NextApiRequest) => string; // Custom key generator
};

/**
 * Default key generator (uses IP address or user ID)
 */
function defaultKeyGenerator(req: NextApiRequest): string {
  // Try to use user ID from session if available
  const userId = (req as any).user?.userId;
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP address
  const ip = 
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown';
  
  return `ip:${ip}`;
}

/**
 * Clean up expired entries (runs periodically)
 */
function cleanup() {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

// Clean up every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);

/**
 * Clear rate limit store (for testing/debugging)
 */
export function clearRateLimitStore(): void {
  Object.keys(store).forEach(key => {
    delete store[key];
  });
}

/**
 * Get rate limit store stats (for debugging)
 */
export function getRateLimitStats() {
  const now = Date.now();
  let active = 0;
  let expired = 0;
  
  Object.values(store).forEach(record => {
    if (record.resetTime > now) {
      active++;
    } else {
      expired++;
    }
  });
  
  return {
    total: Object.keys(store).length,
    active,
    expired,
  };
}

/**
 * Rate limit middleware for Next.js API routes
 * Returns a function that wraps the handler
 * Supports handlers with optional third parameter (user) from withAuth
 */
export function rateLimit(options: RateLimitOptions) {
  return (handler: (req: NextApiRequest, res: NextApiResponse, user?: any) => Promise<void> | void) => {
    return async (req: NextApiRequest, res: NextApiResponse, user?: any) => {
      // Bypass rate limiting in development if DISABLE_RATE_LIMIT is set
      if (process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true') {
        return handler(req, res, user);
      }
      
      const key = options.keyGenerator 
        ? options.keyGenerator(req)
        : defaultKeyGenerator(req);
      
      const now = Date.now();
      const record = store[key];
      
      // Initialize or reset if window expired
      if (!record || record.resetTime < now) {
        store[key] = {
          count: 1,
          resetTime: now + options.windowMs,
        };
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', options.max.toString());
        res.setHeader('X-RateLimit-Remaining', (options.max - 1).toString());
        res.setHeader('X-RateLimit-Reset', new Date(now + options.windowMs).toISOString());
        // Call handler - handlers may or may not accept user parameter
        return (handler as any).length === 3 ? handler(req, res, user) : handler(req, res);
      }
      
      // Increment count
      record.count++;
      
      // Check if limit exceeded
      if (record.count > options.max) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfter.toString());
        res.setHeader('X-RateLimit-Limit', options.max.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
        
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: options.message || 'Too many requests, please try again later',
          },
          meta: {
            timestamp: new Date().toISOString(),
            retryAfter,
          },
        });
      }
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', options.max.toString());
      res.setHeader('X-RateLimit-Remaining', (options.max - record.count).toString());
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
      
      // Call handler - handlers may or may not accept user parameter
      return (handler as any).length === 3 ? handler(req, res, user) : handler(req, res);
    };
  };
}

/**
 * Pre-configured rate limiters
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Rate limit exceeded. Please slow down.',
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again later.',
});

