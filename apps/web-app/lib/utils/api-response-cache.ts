/**
 * API Response Cache
 * Caches API responses to reduce database queries and improve response times
 * Used for frequently accessed, relatively static data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ApiResponseCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  // Default TTL: 5 minutes for API responses
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  
  // Longer TTL for reference data: 1 hour
  private readonly REFERENCE_DATA_TTL = 60 * 60 * 1000; // 1 hour

  /**
   * Get cached entry or null if expired/missing
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key); // Expired, remove from cache
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    });
  }

  /**
   * Set cache entry with reference data TTL (longer cache time)
   */
  setReferenceData<T>(key: string, data: T): void {
    this.set(key, data, this.REFERENCE_DATA_TTL);
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries matching a pattern
   */
  clearPattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;
    
    for (const entry of Array.from(this.cache.values())) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      } else {
        active++;
      }
    }
    
    return {
      total: this.cache.size,
      active,
      expired,
    };
  }
}

// Singleton instance
const cache = new ApiResponseCache();

// Clear expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.clearExpired();
  }, 10 * 60 * 1000); // 10 minutes
}

export default cache;

/**
 * Helper function to create cache key from request parameters
 */
export function createCacheKey(endpoint: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }
  
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  
  return `${endpoint}?${sortedParams}`;
}

