/**
 * Task Domain Schemas
 *
 * Single Source of Truth for Task domain validation and types
 */
import { z } from 'zod';
/**
 * Task Priority Enum
 */
export declare const taskPrioritySchema: z.ZodEnum<{
    low: "low";
    high: "high";
    urgent: "urgent";
    medium: "medium";
}>;
/**
 * Task Type Enum
 */
export declare const taskTypeSchema: z.ZodEnum<{
    lease: "lease";
    other: "other";
    todo: "todo";
    reminder: "reminder";
    "follow-up": "follow-up";
    inspection: "inspection";
    maintenance: "maintenance";
    payment: "payment";
}>;
/**
 * Task Create Schema
 */
export declare const taskCreateSchema: z.ZodObject<{
    propertyId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<{
        lease: "lease";
        other: "other";
        todo: "todo";
        reminder: "reminder";
        "follow-up": "follow-up";
        inspection: "inspection";
        maintenance: "maintenance";
        payment: "payment";
    }>>;
    category: z.ZodString;
    dueDate: z.ZodString;
    priority: z.ZodDefault<z.ZodEnum<{
        low: "low";
        high: "high";
        urgent: "urgent";
        medium: "medium";
    }>>;
    linkedEntityType: z.ZodOptional<z.ZodString>;
    linkedEntityId: z.ZodOptional<z.ZodString>;
    reminderDays: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Task Update Schema
 */
export declare const taskUpdateSchema: z.ZodObject<{
    propertyId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        lease: "lease";
        other: "other";
        todo: "todo";
        reminder: "reminder";
        "follow-up": "follow-up";
        inspection: "inspection";
        maintenance: "maintenance";
        payment: "payment";
    }>>>;
    category: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        low: "low";
        high: "high";
        urgent: "urgent";
        medium: "medium";
    }>>>;
    linkedEntityType: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    linkedEntityId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    reminderDays: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    isCompleted: z.ZodOptional<z.ZodBoolean>;
    completedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Task Query Schema
 */
export declare const taskQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    propertyId: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        lease: "lease";
        other: "other";
        todo: "todo";
        reminder: "reminder";
        "follow-up": "follow-up";
        inspection: "inspection";
        maintenance: "maintenance";
        payment: "payment";
    }>>;
    isCompleted: z.ZodOptional<z.ZodBoolean>;
    priority: z.ZodOptional<z.ZodEnum<{
        low: "low";
        high: "high";
        urgent: "urgent";
        medium: "medium";
    }>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Task Response Schema
 */
export declare const taskResponseSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    propertyId: z.ZodNullable<z.ZodString>;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    type: z.ZodEnum<{
        lease: "lease";
        other: "other";
        todo: "todo";
        reminder: "reminder";
        "follow-up": "follow-up";
        inspection: "inspection";
        maintenance: "maintenance";
        payment: "payment";
    }>;
    category: z.ZodString;
    dueDate: z.ZodDate;
    isCompleted: z.ZodBoolean;
    completedAt: z.ZodNullable<z.ZodDate>;
    priority: z.ZodEnum<{
        low: "low";
        high: "high";
        urgent: "urgent";
        medium: "medium";
    }>;
    linkedEntityType: z.ZodNullable<z.ZodString>;
    linkedEntityId: z.ZodNullable<z.ZodString>;
    reminderDays: z.ZodNullable<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    property: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        propertyName: z.ZodNullable<z.ZodString>;
        addressLine1: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/**
 * Task List Response Schema
 */
export declare const taskListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        propertyId: z.ZodNullable<z.ZodString>;
        title: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        type: z.ZodEnum<{
            lease: "lease";
            other: "other";
            todo: "todo";
            reminder: "reminder";
            "follow-up": "follow-up";
            inspection: "inspection";
            maintenance: "maintenance";
            payment: "payment";
        }>;
        category: z.ZodString;
        dueDate: z.ZodDate;
        isCompleted: z.ZodBoolean;
        completedAt: z.ZodNullable<z.ZodDate>;
        priority: z.ZodEnum<{
            low: "low";
            high: "high";
            urgent: "urgent";
            medium: "medium";
        }>;
        linkedEntityType: z.ZodNullable<z.ZodString>;
        linkedEntityId: z.ZodNullable<z.ZodString>;
        reminderDays: z.ZodNullable<z.ZodNumber>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        property: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            propertyName: z.ZodNullable<z.ZodString>;
            addressLine1: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type TaskCreate = z.infer<typeof taskCreateSchema>;
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
export type TaskResponse = z.infer<typeof taskResponseSchema>;
export type TaskListResponse = z.infer<typeof taskListResponseSchema>;
