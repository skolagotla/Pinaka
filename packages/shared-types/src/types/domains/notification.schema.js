"use strict";
/**
 * Notification Domain Schemas
 *
 * Single Source of Truth for Notification domain validation and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationPreferenceSchema = exports.notificationListResponseSchema = exports.notificationResponseSchema = exports.notificationQuerySchema = exports.notificationUpdateSchema = exports.notificationCreateSchema = exports.notificationPrioritySchema = exports.notificationTypeSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
/**
 * Notification Type Enum
 */
exports.notificationTypeSchema = zod_1.z.enum([
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
exports.notificationPrioritySchema = zod_1.z.enum(['low', 'normal', 'high', 'urgent']);
/**
 * Notification Create Schema
 */
exports.notificationCreateSchema = zod_1.z.object({
    userId: base_1.commonFields.cuid,
    userRole: zod_1.z.enum(['landlord', 'tenant', 'pmc', 'admin']),
    userEmail: zod_1.z.string().email(),
    type: exports.notificationTypeSchema,
    title: zod_1.z.string().min(1, "Title is required").max(200),
    message: zod_1.z.string().min(1, "Message is required").max(5000),
    priority: exports.notificationPrioritySchema.default('normal'),
    entityType: zod_1.z.string().optional(),
    entityId: base_1.commonFields.cuid.optional(),
    verificationId: base_1.commonFields.cuid.optional(),
    actionUrl: zod_1.z.string().url().optional(),
    actionLabel: zod_1.z.string().max(100).optional(),
    metadata: zod_1.z.any().optional(),
});
/**
 * Notification Update Schema
 */
exports.notificationUpdateSchema = zod_1.z.object({
    isRead: zod_1.z.boolean().optional(),
    isArchived: zod_1.z.boolean().optional(),
});
/**
 * Notification Query Schema
 */
exports.notificationQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    unreadOnly: zod_1.z.string().transform(val => val === 'true').optional().default(false),
    archived: zod_1.z.string().transform(val => val === 'true').optional().default(false),
    type: exports.notificationTypeSchema.optional(),
    priority: exports.notificationPrioritySchema.optional(),
    entityType: zod_1.z.string().optional(),
});
/**
 * Notification Response Schema
 */
exports.notificationResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    userId: zod_1.z.string(),
    userRole: zod_1.z.string(),
    userEmail: zod_1.z.string().email(),
    type: exports.notificationTypeSchema,
    title: zod_1.z.string(),
    message: zod_1.z.string(),
    priority: exports.notificationPrioritySchema,
    entityType: zod_1.z.string().nullable(),
    entityId: zod_1.z.string().nullable(),
    verificationId: zod_1.z.string().nullable(),
    actionUrl: zod_1.z.string().nullable(),
    actionLabel: zod_1.z.string().nullable(),
    metadata: zod_1.z.any().nullable(),
    isRead: zod_1.z.boolean(),
    readAt: zod_1.z.date().nullable(),
    isArchived: zod_1.z.boolean(),
    archivedAt: zod_1.z.date().nullable(),
    emailSent: zod_1.z.boolean(),
    emailSentAt: zod_1.z.date().nullable(),
    smsSent: zod_1.z.boolean(),
    smsSentAt: zod_1.z.date().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
/**
 * Notification List Response Schema
 */
exports.notificationListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.object({
        notifications: zod_1.z.array(exports.notificationResponseSchema),
        unreadCount: zod_1.z.number().int().nonnegative(),
        totalCount: zod_1.z.number().int().nonnegative(),
    }),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }).optional(),
});
/**
 * Notification Preference Schema
 */
exports.notificationPreferenceSchema = zod_1.z.object({
    notificationType: exports.notificationTypeSchema,
    emailEnabled: zod_1.z.boolean().default(true),
    smsEnabled: zod_1.z.boolean().default(false),
    pushEnabled: zod_1.z.boolean().default(true),
    sendBeforeDays: zod_1.z.number().int().optional(),
    sendOnDay: zod_1.z.boolean().default(true),
    sendAfterDays: zod_1.z.number().int().optional(),
    quietHoursStart: zod_1.z.string().optional(),
    quietHoursEnd: zod_1.z.string().optional(),
});
