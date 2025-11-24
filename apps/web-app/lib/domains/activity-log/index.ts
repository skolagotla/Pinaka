/**
 * Activity Log Domain Re-export
 * Re-exports from domains/activity-log/domain
 */

export * from '@/domains/activity-log/domain';
export { ActivityLogService } from '@/domains/activity-log/domain/ActivityLogService';
export { ActivityLogRepository } from '@/domains/activity-log/domain/ActivityLogRepository';

// Re-export service instance
import { ActivityLogService } from '@/domains/activity-log/domain/ActivityLogService';
import { ActivityLogRepository } from '@/domains/activity-log/domain/ActivityLogRepository';
import { prisma } from '@/lib/prisma';

const activityLogRepository = new ActivityLogRepository(prisma);
export const activityLogService = new ActivityLogService(activityLogRepository);

