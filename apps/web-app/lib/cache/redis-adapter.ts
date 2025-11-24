/**
 * Redis Cache Adapter
 * 
 * Provides Redis caching with fallback to in-memory cache
 * Supports distributed caching across multiple server instances
 * 
 * Usage:
 *   import { cache } from '@/lib/cache/redis-adapter';
 *   await cache.set('key', data, 300); // 5 minutes
 *   const data = await cache.get('key');
 */

// Optional Redis import - fallback to in-memory if not available
let redisModule: any = null;
try {
  redisModule = require('redis');
} catch (error) {
  // Redis not installed, will use in-memory cache only
  console.log('[Cache] Redis module not available, using in-memory cache only');
}

type RedisClientType = any;

// In-memory fallback cache
const memoryCache = new Map<string, { data: any; expiresAt: number }>();

// Redis client (lazy initialization)
let redisClient: RedisClientType | null = null;
let redisInitialized = false;

/**
 * Initialize Redis client
 */
async function initRedis(): Promise<boolean> {
  if (redisInitialized) {
    return redisClient !== null;
  }

  redisInitialized = true;

  // Check if Redis URL is configured
  const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;
  if (!redisUrl) {
    console.log('[Cache] Redis not configured, using in-memory cache');
    return false;
  }

  if (!redisModule) {
    console.log('[Cache] Redis module not available, using in-memory cache');
    return false;
  }

  try {
    redisClient = redisModule.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            console.error('[Cache] Redis connection failed after 10 retries, using in-memory cache');
            return false; // Stop reconnecting
          }
          return Math.min(retries * 100, 3000); // Exponential backoff, max 3s
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('[Cache] Redis error:', err);
      // Fallback to memory cache on error
      redisClient = null;
    });

    await redisClient.connect();
    console.log('[Cache] Redis connected successfully');
    return true;
  } catch (error) {
    console.error('[Cache] Failed to connect to Redis:', error);
    console.log('[Cache] Falling back to in-memory cache');
    redisClient = null;
    return false;
  }
}

/**
 * Get value from cache (Redis or memory)
 */
export async function get<T = any>(key: string): Promise<T | null> {
  // Initialize Redis if not already done
  if (!redisInitialized) {
    await initRedis();
  }

  // Try Redis first
  if (redisClient) {
    try {
      const value = await redisClient.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
    } catch (error) {
      console.error('[Cache] Redis get error:', error);
      // Fallback to memory cache
    }
  }

  // Fallback to memory cache
  const entry = memoryCache.get(key);
  if (entry) {
    if (Date.now() < entry.expiresAt) {
      return entry.data as T;
    } else {
      // Expired, remove it
      memoryCache.delete(key);
    }
  }

  return null;
}

/**
 * Set value in cache (Redis or memory)
 */
export async function set<T = any>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
  // Initialize Redis if not already done
  if (!redisInitialized) {
    await initRedis();
  }

  const serialized = JSON.stringify(value);

  // Try Redis first
  if (redisClient) {
    try {
      await redisClient.setEx(key, ttlSeconds, serialized);
      return; // Success, don't use memory cache
    } catch (error) {
      console.error('[Cache] Redis set error:', error);
      // Fallback to memory cache
    }
  }

  // Fallback to memory cache
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memoryCache.set(key, { data: value, expiresAt });

  // Limit memory cache size (prevent memory leaks)
  if (memoryCache.size > 1000) {
    const entries = Array.from(memoryCache.entries())
      .sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    
    // Remove oldest 100 entries
    for (let i = 0; i < 100 && i < entries.length; i++) {
      memoryCache.delete(entries[i][0]);
    }
  }
}

/**
 * Delete value from cache
 */
export async function del(key: string): Promise<void> {
  // Initialize Redis if not already done
  if (!redisInitialized) {
    await initRedis();
  }

  // Try Redis first
  if (redisClient) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('[Cache] Redis delete error:', error);
    }
  }

  // Also delete from memory cache
  memoryCache.delete(key);
}

/**
 * Clear all cache entries (use with caution!)
 */
export async function clear(pattern?: string): Promise<void> {
  // Initialize Redis if not already done
  if (!redisInitialized) {
    await initRedis();
  }

  // Try Redis first
  if (redisClient) {
    try {
      if (pattern) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } else {
        await redisClient.flushDb();
      }
    } catch (error) {
      console.error('[Cache] Redis clear error:', error);
    }
  }

  // Clear memory cache
  if (pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  } else {
    memoryCache.clear();
  }
}

/**
 * Get cache statistics
 */
export async function getStats(): Promise<{
  type: 'redis' | 'memory';
  size: number;
  hitRate?: number;
}> {
  // Initialize Redis if not already done
  if (!redisInitialized) {
    await initRedis();
  }

  if (redisClient) {
    try {
      const info = await redisClient.info('stats');
      // Parse Redis info (simplified)
      return {
        type: 'redis',
        size: memoryCache.size, // Fallback size
      };
    } catch (error) {
      console.error('[Cache] Redis stats error:', error);
    }
  }

  return {
    type: 'memory',
    size: memoryCache.size,
  };
}

/**
 * Cache adapter with convenient methods
 */
export const cache = {
  get,
  set,
  del,
  clear,
  getStats,
};

// Auto-initialize on module load (server-side only)
if (typeof window === 'undefined') {
  initRedis().catch((error) => {
    console.error('[Cache] Failed to initialize Redis:', error);
  });
}

