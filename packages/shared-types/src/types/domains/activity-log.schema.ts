/**
 * Activity Log Domain Schemas
 * 
 * Single Source of Truth for Activity Log domain validation and types
 */

import { z } from 'zod';
import { commonFields } from '../base';

/**
 * Activity Log Query Schema
 */
export const activityLogQuerySchema = z.object({
  type: z.string().optional(),
  entityType: z.string().optional(),
  action: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * Activity Log Response Schema
 */
export const activityLogResponseSchema = z.object({
  id: commonFields.cuid,
  type: z.string(),
  entityType: z.string().nullable(),
  entityId: z.string().nullable(),
  action: z.string(),
  userId: z.string().nullable(),
  userEmail: z.string().nullable(),
  userName: z.string().nullable(),
  userRole: z.string().nullable(),
  landlordId: z.string().nullable(),
  tenantId: z.string().nullable(),
  pmcId: z.string().nullable(),
  description: z.string().nullable(),
  metadata: z.any().nullable(),
  createdAt: z.date(),
});

/**
 * Activity Log List Response Schema
 */
export const activityLogListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(activityLogResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Export types
export type ActivityLogQuery = z.infer<typeof activityLogQuerySchema>;
export type ActivityLogResponse = z.infer<typeof activityLogResponseSchema>;
export type ActivityLogListResponse = z.infer<typeof activityLogListResponseSchema>;

