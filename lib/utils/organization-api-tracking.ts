/**
 * Organization API Call Tracking
 * Tracks API calls per organization to enforce maxApiCallsPerMonth limits
 */

import { PrismaClient } from '@prisma/client';

interface ApiCallRecord {
  organizationId: string;
  count: number;
  resetTime: number; // Timestamp when counter resets (start of next month)
}

// In-memory cache for API call tracking
// In production, consider using Redis for distributed systems
const apiCallCache = new Map<string, ApiCallRecord>();

/**
 * Track an API call for an organization
 * Returns true if within limits, false if limit exceeded
 */
export async function trackApiCall(
  prisma: PrismaClient,
  organizationId: string | null
): Promise<{ allowed: boolean; remaining?: number; limit?: number; resetAt?: Date }> {
  if (!organizationId) {
    // No organization - allow (backward compatibility)
    return { allowed: true };
  }

  // Get organization to check limits
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      maxApiCallsPerMonth: true,
    },
  });

  if (!organization) {
    // Organization not found - allow (shouldn't happen, but be safe)
    return { allowed: true };
  }

  // If no limit set (null = unlimited for enterprise), allow
  if (organization.maxApiCallsPerMonth === null) {
    return { allowed: true };
  }

  const now = Date.now();
  const cacheKey = `org:${organizationId}`;
  const record = apiCallCache.get(cacheKey);

  // Calculate reset time (start of next month)
  const resetTime = getNextMonthStart();

  // Initialize or reset if month changed
  if (!record || record.resetTime < now) {
    apiCallCache.set(cacheKey, {
      organizationId,
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remaining: organization.maxApiCallsPerMonth - 1,
      limit: organization.maxApiCallsPerMonth,
      resetAt: new Date(resetTime),
    };
  }

  // Increment count
  record.count++;

  // Check if limit exceeded
  if (record.count > organization.maxApiCallsPerMonth) {
    return {
      allowed: false,
      remaining: 0,
      limit: organization.maxApiCallsPerMonth,
      resetAt: new Date(record.resetTime),
    };
  }

  return {
    allowed: true,
    remaining: organization.maxApiCallsPerMonth - record.count,
    limit: organization.maxApiCallsPerMonth,
    resetAt: new Date(record.resetTime),
  };
}

/**
 * Get API call statistics for an organization
 */
export function getApiCallStats(organizationId: string | null): {
  count: number;
  resetAt: Date | null;
} | null {
  if (!organizationId) {
    return null;
  }

  const cacheKey = `org:${organizationId}`;
  const record = apiCallCache.get(cacheKey);

  if (!record) {
    return { count: 0, resetAt: null };
  }

  return {
    count: record.count,
    resetAt: new Date(record.resetTime),
  };
}

/**
 * Get start of next month as timestamp
 */
function getNextMonthStart(): number {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  return nextMonth.getTime();
}

/**
 * Clear expired records from cache
 * Should be called periodically (e.g., via cron job)
 */
export function clearExpiredRecords(): number {
  const now = Date.now();
  let cleared = 0;

  for (const [key, record] of apiCallCache.entries()) {
    if (record.resetTime < now) {
      apiCallCache.delete(key);
      cleared++;
    }
  }

  return cleared;
}

/**
 * Get all API call statistics (for admin/debugging)
 */
export function getAllApiCallStats(): Array<{
  organizationId: string;
  count: number;
  resetAt: Date;
}> {
  return Array.from(apiCallCache.values()).map((record) => ({
    organizationId: record.organizationId,
    count: record.count,
    resetAt: new Date(record.resetTime),
  }));
}

