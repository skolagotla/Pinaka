/**
 * Notification Domain Re-export
 * Re-exports from domains/notification/domain
 */

export * from '@/domains/notification/domain';
export { NotificationService } from '@/domains/notification/domain/NotificationService';
export { NotificationRepository } from '@/domains/notification/domain/NotificationRepository';

// Re-export service instance
import { NotificationService } from '@/domains/notification/domain/NotificationService';
import { NotificationRepository } from '@/domains/notification/domain/NotificationRepository';
import { prisma } from '@/lib/prisma';

const notificationRepository = new NotificationRepository(prisma);
export const notificationService = new NotificationService(notificationRepository);

