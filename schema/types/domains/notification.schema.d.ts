/**
 * Notification Domain Schemas
 *
 * Single Source of Truth for Notification domain validation and types
 */
import { z } from 'zod';
/**
 * Notification Type Enum
 */
export declare const notificationTypeSchema: z.ZodEnum<{
    rent_due: "rent_due";
    rent_overdue: "rent_overdue";
    maintenance_update: "maintenance_update";
    approval_request: "approval_request";
    document_expiring: "document_expiring";
    lease_renewal: "lease_renewal";
    payment_received: "payment_received";
    task_due: "task_due";
    task_overdue: "task_overdue";
    inspection_due: "inspection_due";
    application_update: "application_update";
    conversation_message: "conversation_message";
    system_announcement: "system_announcement";
    other: "other";
}>;
/**
 * Notification Priority Enum
 */
export declare const notificationPrioritySchema: z.ZodEnum<{
    low: "low";
    normal: "normal";
    high: "high";
    urgent: "urgent";
}>;
/**
 * Notification Create Schema
 */
export declare const notificationCreateSchema: z.ZodObject<{
    userId: z.ZodString;
    userRole: z.ZodEnum<{
        landlord: "landlord";
        tenant: "tenant";
        pmc: "pmc";
        admin: "admin";
    }>;
    userEmail: z.ZodString;
    type: z.ZodEnum<{
        rent_due: "rent_due";
        rent_overdue: "rent_overdue";
        maintenance_update: "maintenance_update";
        approval_request: "approval_request";
        document_expiring: "document_expiring";
        lease_renewal: "lease_renewal";
        payment_received: "payment_received";
        task_due: "task_due";
        task_overdue: "task_overdue";
        inspection_due: "inspection_due";
        application_update: "application_update";
        conversation_message: "conversation_message";
        system_announcement: "system_announcement";
        other: "other";
    }>;
    title: z.ZodString;
    message: z.ZodString;
    priority: z.ZodDefault<z.ZodEnum<{
        low: "low";
        normal: "normal";
        high: "high";
        urgent: "urgent";
    }>>;
    entityType: z.ZodOptional<z.ZodString>;
    entityId: z.ZodOptional<z.ZodString>;
    verificationId: z.ZodOptional<z.ZodString>;
    actionUrl: z.ZodOptional<z.ZodString>;
    actionLabel: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
/**
 * Notification Update Schema
 */
export declare const notificationUpdateSchema: z.ZodObject<{
    isRead: z.ZodOptional<z.ZodBoolean>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Notification Query Schema
 */
export declare const notificationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    unreadOnly: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>>;
    archived: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>>;
    type: z.ZodOptional<z.ZodEnum<{
        rent_due: "rent_due";
        rent_overdue: "rent_overdue";
        maintenance_update: "maintenance_update";
        approval_request: "approval_request";
        document_expiring: "document_expiring";
        lease_renewal: "lease_renewal";
        payment_received: "payment_received";
        task_due: "task_due";
        task_overdue: "task_overdue";
        inspection_due: "inspection_due";
        application_update: "application_update";
        conversation_message: "conversation_message";
        system_announcement: "system_announcement";
        other: "other";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        low: "low";
        normal: "normal";
        high: "high";
        urgent: "urgent";
    }>>;
    entityType: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Notification Response Schema
 */
export declare const notificationResponseSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    userRole: z.ZodString;
    userEmail: z.ZodString;
    type: z.ZodEnum<{
        rent_due: "rent_due";
        rent_overdue: "rent_overdue";
        maintenance_update: "maintenance_update";
        approval_request: "approval_request";
        document_expiring: "document_expiring";
        lease_renewal: "lease_renewal";
        payment_received: "payment_received";
        task_due: "task_due";
        task_overdue: "task_overdue";
        inspection_due: "inspection_due";
        application_update: "application_update";
        conversation_message: "conversation_message";
        system_announcement: "system_announcement";
        other: "other";
    }>;
    title: z.ZodString;
    message: z.ZodString;
    priority: z.ZodEnum<{
        low: "low";
        normal: "normal";
        high: "high";
        urgent: "urgent";
    }>;
    entityType: z.ZodNullable<z.ZodString>;
    entityId: z.ZodNullable<z.ZodString>;
    verificationId: z.ZodNullable<z.ZodString>;
    actionUrl: z.ZodNullable<z.ZodString>;
    actionLabel: z.ZodNullable<z.ZodString>;
    metadata: z.ZodNullable<z.ZodAny>;
    isRead: z.ZodBoolean;
    readAt: z.ZodNullable<z.ZodDate>;
    isArchived: z.ZodBoolean;
    archivedAt: z.ZodNullable<z.ZodDate>;
    emailSent: z.ZodBoolean;
    emailSentAt: z.ZodNullable<z.ZodDate>;
    smsSent: z.ZodBoolean;
    smsSentAt: z.ZodNullable<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, z.core.$strip>;
/**
 * Notification List Response Schema
 */
export declare const notificationListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        notifications: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            userId: z.ZodString;
            userRole: z.ZodString;
            userEmail: z.ZodString;
            type: z.ZodEnum<{
                rent_due: "rent_due";
                rent_overdue: "rent_overdue";
                maintenance_update: "maintenance_update";
                approval_request: "approval_request";
                document_expiring: "document_expiring";
                lease_renewal: "lease_renewal";
                payment_received: "payment_received";
                task_due: "task_due";
                task_overdue: "task_overdue";
                inspection_due: "inspection_due";
                application_update: "application_update";
                conversation_message: "conversation_message";
                system_announcement: "system_announcement";
                other: "other";
            }>;
            title: z.ZodString;
            message: z.ZodString;
            priority: z.ZodEnum<{
                low: "low";
                normal: "normal";
                high: "high";
                urgent: "urgent";
            }>;
            entityType: z.ZodNullable<z.ZodString>;
            entityId: z.ZodNullable<z.ZodString>;
            verificationId: z.ZodNullable<z.ZodString>;
            actionUrl: z.ZodNullable<z.ZodString>;
            actionLabel: z.ZodNullable<z.ZodString>;
            metadata: z.ZodNullable<z.ZodAny>;
            isRead: z.ZodBoolean;
            readAt: z.ZodNullable<z.ZodDate>;
            isArchived: z.ZodBoolean;
            archivedAt: z.ZodNullable<z.ZodDate>;
            emailSent: z.ZodBoolean;
            emailSentAt: z.ZodNullable<z.ZodDate>;
            smsSent: z.ZodBoolean;
            smsSentAt: z.ZodNullable<z.ZodDate>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
        }, z.core.$strip>>;
        unreadCount: z.ZodNumber;
        totalCount: z.ZodNumber;
    }, z.core.$strip>;
    pagination: z.ZodOptional<z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Notification Preference Schema
 */
export declare const notificationPreferenceSchema: z.ZodObject<{
    notificationType: z.ZodEnum<{
        rent_due: "rent_due";
        rent_overdue: "rent_overdue";
        maintenance_update: "maintenance_update";
        approval_request: "approval_request";
        document_expiring: "document_expiring";
        lease_renewal: "lease_renewal";
        payment_received: "payment_received";
        task_due: "task_due";
        task_overdue: "task_overdue";
        inspection_due: "inspection_due";
        application_update: "application_update";
        conversation_message: "conversation_message";
        system_announcement: "system_announcement";
        other: "other";
    }>;
    emailEnabled: z.ZodDefault<z.ZodBoolean>;
    smsEnabled: z.ZodDefault<z.ZodBoolean>;
    pushEnabled: z.ZodDefault<z.ZodBoolean>;
    sendBeforeDays: z.ZodOptional<z.ZodNumber>;
    sendOnDay: z.ZodDefault<z.ZodBoolean>;
    sendAfterDays: z.ZodOptional<z.ZodNumber>;
    quietHoursStart: z.ZodOptional<z.ZodString>;
    quietHoursEnd: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationPriority = z.infer<typeof notificationPrioritySchema>;
export type NotificationCreate = z.infer<typeof notificationCreateSchema>;
export type NotificationUpdate = z.infer<typeof notificationUpdateSchema>;
export type NotificationQuery = z.infer<typeof notificationQuerySchema>;
export type NotificationResponse = z.infer<typeof notificationResponseSchema>;
export type NotificationListResponse = z.infer<typeof notificationListResponseSchema>;
export type NotificationPreference = z.infer<typeof notificationPreferenceSchema>;
