/**
 * Notification Domain Schemas
 * 
 * Single Source of Truth for Notification domain validation and types
 */

import { z } from 'zod';
import { commonFields } from '../base';

/**
 * Notification Type Enum
 */
export const notificationTypeSchema = z.enum([
  'rent_due',
  'rent_overdue',
  'maintenance_update',
  'approval_request',
  'document_expiring',
  'lease_renewal',
  'payment_received',
  'task_due',
  'task_overdue',
  'inspection_due',
  'application_update',
  'conversation_message',
  'system_announcement',
  'other',
]);

/**
 * Notification Priority Enum
 */
export const notificationPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

/**
 * Notification Create Schema
 */
export const notificationCreateSchema = z.object({
  userId: commonFields.cuid,
  userRole: z.enum(['landlord', 'tenant', 'pmc', 'admin']),
  userEmail: z.string().email(),
  type: notificationTypeSchema,
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().min(1, "Message is required").max(5000),
  priority: notificationPrioritySchema.default('normal'),
  entityType: z.string().optional(),
  entityId: commonFields.cuid.optional(),
  verificationId: commonFields.cuid.optional(),
  actionUrl: z.string().url().optional(),
  actionLabel: z.string().max(100).optional(),
  metadata: z.any().optional(),
});

/**
 * Notification Update Schema
 */
export const notificationUpdateSchema = z.object({
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

/**
 * Notification Query Schema
 */
export const notificationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  unreadOnly: z.string().transform(val => val === 'true').optional().default(false),
  archived: z.string().transform(val => val === 'true').optional().default(false),
  type: notificationTypeSchema.optional(),
  priority: notificationPrioritySchema.optional(),
  entityType: z.string().optional(),
});

/**
 * Notification Response Schema
 */
export const notificationResponseSchema = z.object({
  id: commonFields.cuid,
  userId: z.string(),
  userRole: z.string(),
  userEmail: z.string().email(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  priority: notificationPrioritySchema,
  entityType: z.string().nullable(),
  entityId: z.string().nullable(),
  verificationId: z.string().nullable(),
  actionUrl: z.string().nullable(),
  actionLabel: z.string().nullable(),
  metadata: z.any().nullable(),
  isRead: z.boolean(),
  readAt: z.date().nullable(),
  isArchived: z.boolean(),
  archivedAt: z.date().nullable(),
  emailSent: z.boolean(),
  emailSentAt: z.date().nullable(),
  smsSent: z.boolean(),
  smsSentAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Notification List Response Schema
 */
export const notificationListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    notifications: z.array(notificationResponseSchema),
    unreadCount: z.number().int().nonnegative(),
    totalCount: z.number().int().nonnegative(),
  }),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }).optional(),
});

/**
 * Notification Preference Schema
 */
export const notificationPreferenceSchema = z.object({
  notificationType: notificationTypeSchema,
  emailEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  pushEnabled: z.boolean().default(true),
  sendBeforeDays: z.number().int().optional(),
  sendOnDay: z.boolean().default(true),
  sendAfterDays: z.number().int().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
});

// Export types
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationPriority = z.infer<typeof notificationPrioritySchema>;
export type NotificationCreate = z.infer<typeof notificationCreateSchema>;
export type NotificationUpdate = z.infer<typeof notificationUpdateSchema>;
export type NotificationQuery = z.infer<typeof notificationQuerySchema>;
export type NotificationResponse = z.infer<typeof notificationResponseSchema>;
export type NotificationListResponse = z.infer<typeof notificationListResponseSchema>;
export type NotificationPreference = z.infer<typeof notificationPreferenceSchema>;

