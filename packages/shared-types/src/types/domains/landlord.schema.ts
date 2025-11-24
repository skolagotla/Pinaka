/**
 * Landlord Domain Schemas
 * 
 * Single Source of Truth for Landlord domain validation and types
 */

import { z } from 'zod';
import { commonFields, patterns } from '../base';

/**
 * Approval Status Enum (shared with tenants)
 */
export const approvalStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

/**
 * Landlord Create Schema
 */
export const landlordCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: commonFields.email,
  phone: z.string().regex(patterns.phone, 'Invalid phone format').optional(),
  // Address
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  postalZip: z.string().max(20).optional(),
  // Legacy fields
  provinceState: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  // New FK fields
  countryCode: z.string().length(2).toUpperCase().optional(),
  regionCode: z.string().min(2).max(10).optional(),
  // Settings
  timezone: z.string().default('America/Toronto'),
  theme: z.string().default('default'),
  // Organization (for multi-tenancy)
  organizationId: commonFields.cuid.optional(),
});

/**
 * Landlord Update Schema (all fields optional)
 */
export const landlordUpdateSchema = landlordCreateSchema.partial().safeExtend({
  email: commonFields.email.optional(), // Can update email but must be valid if provided
});

/**
 * Landlord Response Schema
 */
export const landlordResponseSchema = z.object({
  id: commonFields.cuid,
  landlordId: z.string(),
  firstName: z.string(),
  middleName: z.string().nullable(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  postalZip: z.string().nullable(),
  provinceState: z.string().nullable(),
  country: z.string().nullable(),
  countryCode: z.string().nullable(),
  regionCode: z.string().nullable(),
  timezone: z.string().nullable(),
  theme: z.string().nullable(),
  signatureFileName: z.string().nullable(),
  organizationId: z.string().nullable(),
  approvalStatus: approvalStatusSchema,
  approvedBy: z.string().nullable(),
  approvedAt: z.date().nullable(),
  rejectedBy: z.string().nullable(),
  rejectedAt: z.date().nullable(),
  rejectionReason: z.string().nullable(),
  invitedBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Landlord List Response Schema
 */
export const landlordListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(landlordResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Landlord Query Parameters Schema
 */
export const landlordQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  approvalStatus: approvalStatusSchema.optional(),
  search: z.string().max(100).optional(), // Search by name or email
  organizationId: commonFields.cuid.optional(),
});

// Export types
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
export type LandlordCreate = z.infer<typeof landlordCreateSchema>;
export type LandlordUpdate = z.infer<typeof landlordUpdateSchema>;
export type LandlordResponse = z.infer<typeof landlordResponseSchema>;
export type LandlordListResponse = z.infer<typeof landlordListResponseSchema>;
export type LandlordQuery = z.infer<typeof landlordQuerySchema>;

