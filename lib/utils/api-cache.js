/**
 * In-Memory API Response Cache
 * 
 * Simple, efficient caching for frequently accessed API responses
 * Reduces database queries and improves response times
 * 
 * Features:
 * - TTL-based expiration
 * - Automatic cache invalidation
 * - Memory-efficient (LRU-like behavior)
 * - Per-endpoint cache configuration
 */

// Cache storage
const cache = new Map();

// Cache statistics
const stats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
};

// Default TTL: 30 seconds
const DEFAULT_TTL = 30000;

/**
 * Generate cache key from request
 */
function getCacheKey(url, method = 'GET', query = {}) {
  const queryString = Object.keys(query)
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('&');
  return `${method}:${url}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Check if cache entry is valid
 */
function isValid(entry) {
  if (!entry) return false;
  return Date.now() < entry.expiresAt;
}

/**
 * Get cached response
 */
export function getCache(url, method = 'GET', query = {}) {
  const key = getCacheKey(url, method, query);
  const entry = cache.get(key);
  
  if (isValid(entry)) {
    stats.hits++;
    return entry.data;
  }
  
  // Remove expired entry
  if (entry) {
    cache.delete(key);
  }
  
  stats.misses++;
  return null;
}

/**
 * Set cache entry
 */
export function setCache(url, data, method = 'GET', query = {}, ttl = DEFAULT_TTL) {
  const key = getCacheKey(url, method, query);
  
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
    createdAt: Date.now(),
  });
  
  stats.sets++;
  
  // Limit cache size (prevent memory leaks)
  if (cache.size > 1000) {
    // Remove oldest entries (simple LRU)
    const entries = Array.from(cache.entries())
      .sort((a, b) => a[1].createdAt - b[1].createdAt);
    
    // Remove oldest 100 entries
    for (let i = 0; i < 100 && i < entries.length; i++) {
      cache.delete(entries[i][0]);
    }
  }
}

/**
 * Delete cache entry
 */
export function deleteCache(url, method = 'GET', query = {}) {
  const key = getCacheKey(url, method, query);
  const deleted = cache.delete(key);
  if (deleted) {
    stats.deletes++;
  }
  return deleted;
}

/**
 * Clear cache by pattern
 */
export function clearCachePattern(pattern) {
  let cleared = 0;
  for (const [key] of cache) {
    if (key.includes(pattern)) {
      cache.delete(key);
      cleared++;
    }
  }
  return cleared;
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  const size = cache.size;
  cache.clear();
  return size;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const total = stats.hits + stats.misses;
  const hitRate = total > 0 ? ((stats.hits / total) * 100).toFixed(2) : 0;
  
  return {
    ...stats,
    size: cache.size,
    hitRate: `${hitRate}%`,
    totalRequests: total,
  };
}

/**
 * Cache configuration per endpoint
 */
const CACHE_CONFIG = {
  '/api/v1/properties': { ttl: 60000, enabled: true }, // 1 minute
  '/api/v1/tenants': { ttl: 60000, enabled: true }, // 1 minute
  '/api/v1/vendors': { ttl: 120000, enabled: true }, // 2 minutes
  '/api/reference-data': { ttl: 300000, enabled: true }, // 5 minutes
  '/api/v1/analytics/dashboard': { ttl: 30000, enabled: true }, // 30 seconds
  '/api/v1/expenses': { ttl: 60000, enabled: true }, // 1 minute
  '/api/v1/maintenance': { ttl: 30000, enabled: true }, // 30 seconds
};

/**
 * Get cache config for endpoint
 */
export function getCacheConfig(url) {
  // Find matching endpoint config
  for (const [endpoint, config] of Object.entries(CACHE_CONFIG)) {
    if (url.includes(endpoint)) {
      return config;
    }
  }
  
  // Default config
  return { ttl: DEFAULT_TTL, enabled: false };
}

/**
 * Check if endpoint should be cached
 */
export function shouldCache(url, method = 'GET') {
  // Only cache GET requests
  if (method !== 'GET') return false;
  
  const config = getCacheConfig(url);
  return config.enabled;
}

