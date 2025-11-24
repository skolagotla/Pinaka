/**
 * ═══════════════════════════════════════════════════════════════
 * USER LOOKUP CACHE
 * ═══════════════════════════════════════════════════════════════
 * 
 * In-memory cache for user lookups to reduce database queries
 * Used by apiMiddleware to cache landlord/tenant lookups
 * 
 * TTL: 5 minutes (users rarely change)
 * Max Size: 1000 entries (LRU eviction)
 * 
 * ═══════════════════════════════════════════════════════════════
 */

interface CachedUser {
  landlord: any | null;
  tenant: any | null;
  timestamp: number;
}

const cache = new Map<string, CachedUser>();
const TTL = 5 * 60 * 1000; // 5 minutes
const MAX_SIZE = 1000;

/**
 * Get cached user lookup result
 */
export function getCachedUser(email: string): { landlord: any | null; tenant: any | null } | null {
  const cached = cache.get(email);
  
  if (!cached) {
    return null;
  }
  
  // Check if expired
  if (Date.now() - cached.timestamp > TTL) {
    cache.delete(email);
    return null;
  }
  
  return {
    landlord: cached.landlord,
    tenant: cached.tenant,
  };
}

/**
 * Set cached user lookup result
 */
export function setCachedUser(email: string, landlord: any | null, tenant: any | null): void {
  // Evict oldest entries if cache is full
  if (cache.size >= MAX_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) {
      cache.delete(firstKey);
    }
  }
  
  cache.set(email, {
    landlord,
    tenant,
    timestamp: Date.now(),
  });
}

/**
 * Invalidate cache for a specific email
 * Call this when user data is updated
 */
export function invalidateUserCache(email: string): void {
  cache.delete(email);
}

/**
 * Clear all cached users
 */
export function clearUserCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  maxSize: number;
  ttl: number;
} {
  return {
    size: cache.size,
    maxSize: MAX_SIZE,
    ttl: TTL,
  };
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [email, cached] of cache.entries()) {
    if (now - cached.timestamp > TTL) {
      cache.delete(email);
    }
  }
}

// Cleanup expired entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 60 * 1000);
}

