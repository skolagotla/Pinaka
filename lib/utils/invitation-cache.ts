/**
 * Invitation Cache
 * 
 * Caches invitation lookups to reduce database queries and API calls.
 * Invitations are relatively static (only status changes), so they're safe to cache.
 */

type CacheEntry = {
  data: any;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

// Cache TTL: 5 minutes (invitations don't change frequently)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Get cached invitation
 */
export function getCachedInvitation(token: string): any | null {
  const entry = cache.get(token);
  
  if (!entry) {
    return null;
  }
  
  // Check if expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(token);
    return null;
  }
  
  return entry.data;
}

/**
 * Cache invitation data
 */
export function setCachedInvitation(token: string, data: any): void {
  cache.set(token, {
    data,
    expiresAt: Date.now() + CACHE_TTL,
  });
}

/**
 * Invalidate cache for a token (when invitation is accepted/updated)
 */
export function invalidateInvitationCache(token: string): void {
  cache.delete(token);
}

/**
 * Clear all invitation cache (for testing/debugging)
 */
export function clearInvitationCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getInvitationCacheStats() {
  const now = Date.now();
  let valid = 0;
  let expired = 0;
  
  cache.forEach(entry => {
    if (entry.expiresAt > now) {
      valid++;
    } else {
      expired++;
    }
  });
  
  return {
    total: cache.size,
    valid,
    expired,
  };
}

