"use strict";
/**
 * Task Domain Schemas
 *
 * Single Source of Truth for Task domain validation and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskListResponseSchema = exports.taskResponseSchema = exports.taskQuerySchema = exports.taskUpdateSchema = exports.taskCreateSchema = exports.taskTypeSchema = exports.taskPrioritySchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
/**
 * Task Priority Enum
 */
exports.taskPrioritySchema = zod_1.z.enum(['low', 'medium', 'high', 'urgent']);
/**
 * Task Type Enum
 */
exports.taskTypeSchema = zod_1.z.enum(['todo', 'reminder', 'follow-up', 'inspection', 'maintenance', 'lease', 'payment', 'other']);
/**
 * Task Create Schema
 */
exports.taskCreateSchema = zod_1.z.object({
    propertyId: base_1.commonFields.cuid.optional(),
    title: zod_1.z.string().min(1, "Title is required").max(200),
    description: zod_1.z.string().max(5000).optional(),
    type: exports.taskTypeSchema.default('todo'),
    category: zod_1.z.string().min(1, "Category is required").max(100),
    dueDate: base_1.commonFields.dateString,
    priority: exports.taskPrioritySchema.default('medium'),
    linkedEntityType: zod_1.z.string().optional(),
    linkedEntityId: base_1.commonFields.cuid.optional(),
    reminderDays: zod_1.z.number().int().positive().optional(),
});
/**
 * Task Update Schema
 */
exports.taskUpdateSchema = exports.taskCreateSchema.partial().extend({
    isCompleted: zod_1.z.boolean().optional(),
    completedAt: base_1.commonFields.dateString.optional(),
});
/**
 * Task Query Schema
 */
exports.taskQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    propertyId: base_1.commonFields.cuid.optional(),
    category: zod_1.z.string().optional(),
    type: exports.taskTypeSchema.optional(),
    isCompleted: zod_1.z.boolean().optional(),
    priority: exports.taskPrioritySchema.optional(),
    startDate: base_1.commonFields.dateString.optional(),
    endDate: base_1.commonFields.dateString.optional(),
});
/**
 * Task Response Schema
 */
exports.taskResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    userId: zod_1.z.string(),
    propertyId: zod_1.z.string().nullable(),
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    type: exports.taskTypeSchema,
    category: zod_1.z.string(),
    dueDate: zod_1.z.date(),
    isCompleted: zod_1.z.boolean(),
    completedAt: zod_1.z.date().nullable(),
    priority: exports.taskPrioritySchema,
    linkedEntityType: zod_1.z.string().nullable(),
    linkedEntityId: zod_1.z.string().nullable(),
    reminderDays: zod_1.z.number().int().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    property: zod_1.z.object({
        id: base_1.commonFields.cuid,
        propertyName: zod_1.z.string().nullable(),
        addressLine1: zod_1.z.string(),
    }).nullable().optional(),
});
/**
 * Task List Response Schema
 */
exports.taskListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.array(exports.taskResponseSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
