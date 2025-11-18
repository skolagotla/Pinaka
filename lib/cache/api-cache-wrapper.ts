/**
 * API Cache Wrapper
 * 
 * Wraps API endpoints with Redis caching
 * Automatically caches GET requests and invalidates on mutations
 */

import { cache } from './redis-adapter';

/**
 * Generate cache key from request
 */
function getCacheKey(endpoint: string, query: Record<string, any> = {}): string {
  const queryString = Object.keys(query)
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('&');
  return `api:${endpoint}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Cache middleware for API routes
 * 
 * @param endpoint - API endpoint path
 * @param handler - Original handler function
 * @param options - Cache options
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  endpoint: string,
  handler: T,
  options: {
    ttl?: number; // Time to live in seconds (default: 300 = 5 minutes)
    keyGenerator?: (req: any) => string; // Custom cache key generator
    shouldCache?: (req: any) => boolean; // Whether to cache this request
    invalidateOn?: string[]; // Endpoints that should invalidate this cache
  } = {}
): T {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator,
    shouldCache = () => true,
    invalidateOn = [],
  } = options;

  return (async (...args: any[]) => {
    const [req, res] = args;

    // Only cache GET requests
    if (req.method !== 'GET') {
      // For mutations, invalidate related caches
      if (invalidateOn.length > 0) {
        for (const invalidateEndpoint of invalidateOn) {
          await cache.clear(`api:${invalidateEndpoint}*`);
        }
      }
      return handler(...args);
    }

    // Check if we should cache this request
    if (!shouldCache(req)) {
      return handler(...args);
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : getCacheKey(endpoint, req.query);

    // Try to get from cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      // Return cached response
      if (res && typeof res.json === 'function') {
        return res.json(cached);
      }
      return cached;
    }

    // Cache miss - execute handler
    const result = await handler(...args);

    // Cache the result
    if (result && typeof result === 'object') {
      await cache.set(cacheKey, result, ttl);
    }

    return result;
  }) as T;
}

/**
 * Invalidate cache for an endpoint
 */
export async function invalidateCache(endpoint: string, pattern?: string): Promise<void> {
  const key = pattern ? `api:${endpoint}*` : `api:${endpoint}`;
  await cache.clear(key);
}

/**
 * Cache configuration for common endpoints
 */
export const CACHE_CONFIG = {
  // Dashboard endpoints - cache for 1 minute (frequently accessed)
  '/api/dashboard': { ttl: 60 },
  
  // Admin users - cache for 2 minutes (moderate update frequency)
  '/api/admin/users': { ttl: 120 },
  
  // Reference data - cache for 1 hour (rarely changes)
  '/api/reference-data': { ttl: 3600 },
  
  // System health - cache for 30 seconds (real-time data)
  '/api/admin/system/health': { ttl: 30 },
  
  // Analytics - cache for 5 minutes (expensive queries)
  '/api/v1/analytics/*': { ttl: 300 },
};

