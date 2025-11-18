/**
 * Task Domain Schemas
 * 
 * Single Source of Truth for Task domain validation and types
 */

import { z } from 'zod';
import { commonFields } from '../base';

/**
 * Task Priority Enum
 */
export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

/**
 * Task Type Enum
 */
export const taskTypeSchema = z.enum(['todo', 'reminder', 'follow-up', 'inspection', 'maintenance', 'lease', 'payment', 'other']);

/**
 * Task Create Schema
 */
export const taskCreateSchema = z.object({
  propertyId: commonFields.cuid.optional(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  type: taskTypeSchema.default('todo'),
  category: z.string().min(1, "Category is required").max(100),
  dueDate: commonFields.dateString,
  priority: taskPrioritySchema.default('medium'),
  linkedEntityType: z.string().optional(),
  linkedEntityId: commonFields.cuid.optional(),
  reminderDays: z.number().int().positive().optional(),
});

/**
 * Task Update Schema
 */
export const taskUpdateSchema = taskCreateSchema.partial().extend({
  isCompleted: z.boolean().optional(),
  completedAt: commonFields.dateString.optional(),
});

/**
 * Task Query Schema
 */
export const taskQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  propertyId: commonFields.cuid.optional(),
  category: z.string().optional(),
  type: taskTypeSchema.optional(),
  isCompleted: z.boolean().optional(),
  priority: taskPrioritySchema.optional(),
  startDate: commonFields.dateString.optional(),
  endDate: commonFields.dateString.optional(),
});

/**
 * Task Response Schema
 */
export const taskResponseSchema = z.object({
  id: commonFields.cuid,
  userId: z.string(),
  propertyId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  type: taskTypeSchema,
  category: z.string(),
  dueDate: z.date(),
  isCompleted: z.boolean(),
  completedAt: z.date().nullable(),
  priority: taskPrioritySchema,
  linkedEntityType: z.string().nullable(),
  linkedEntityId: z.string().nullable(),
  reminderDays: z.number().int().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  property: z.object({
    id: commonFields.cuid,
    propertyName: z.string().nullable(),
    addressLine1: z.string(),
  }).nullable().optional(),
});

/**
 * Task List Response Schema
 */
export const taskListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(taskResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Export types
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type TaskCreate = z.infer<typeof taskCreateSchema>;
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
export type TaskResponse = z.infer<typeof taskResponseSchema>;
export type TaskListResponse = z.infer<typeof taskListResponseSchema>;

