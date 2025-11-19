/**
 * User Schema
 * 
 * Shared schema for User domain operations
 * Single Source of Truth for user validation
 */

import { z } from 'zod';

/**
 * Schema for user status query
 */
export const userStatusQuerySchema = z.object({
  email: z.string().email('Invalid email address').optional(),
});

/**
 * Schema for user status response
 */
export const userStatusResponseSchema = z.object({
  success: z.boolean(),
  role: z.enum(['landlord', 'tenant', 'pmc']),
  approvalStatus: z.string(),
  rejectionReason: z.string().nullable(),
  rejectedAt: z.string().nullable(),
});

/**
 * Type exports
 */
export type UserStatusQuery = z.infer<typeof userStatusQuerySchema>;
export type UserStatusResponse = z.infer<typeof userStatusResponseSchema>;

