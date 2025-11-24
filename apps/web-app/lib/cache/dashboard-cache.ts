/**
 * Dashboard Cache Helper
 * 
 * Wraps dashboard API with caching
 */

import { cache } from './redis-adapter';

/**
 * Get dashboard cache key
 */
function getDashboardCacheKey(userId: string, role: string): string {
  return `dashboard:${role}:${userId}`;
}

/**
 * Get cached dashboard data
 */
export async function getCachedDashboard<T = any>(userId: string, role: string): Promise<T | null> {
  const key = getDashboardCacheKey(userId, role);
  return await cache.get<T>(key);
}

/**
 * Set dashboard cache
 */
export async function setCachedDashboard<T = any>(userId: string, role: string, data: T, ttl: number = 60): Promise<void> {
  const key = getDashboardCacheKey(userId, role);
  await cache.set(key, data, ttl);
}

/**
 * Invalidate dashboard cache
 */
export async function invalidateDashboardCache(userId: string, role?: string): Promise<void> {
  if (role) {
    const key = getDashboardCacheKey(userId, role);
    await cache.del(key);
  } else {
    // Invalidate for all roles
    await cache.del(getDashboardCacheKey(userId, 'landlord'));
    await cache.del(getDashboardCacheKey(userId, 'pmc'));
  }
}

