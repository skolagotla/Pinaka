/**
 * Tenant Domain Schemas
 * 
 * Single Source of Truth for Tenant domain validation and types
 */

import { z } from 'zod';
import { commonFields, patterns } from '../base';

/**
 * Approval Status Enum
 */
export const approvalStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

/**
 * Employment Status Enum
 */
export const employmentStatusSchema = z.enum([
  'Full-time',
  'Part-time',
  'Self-employed',
  'Unemployed',
  'Student',
  'Retired',
  'Other',
]);

/**
 * Emergency Contact Schema
 */
export const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Emergency contact name is required').max(100),
  phone: z.string().regex(patterns.phone, 'Invalid phone format').max(20),
  relationship: z.string().max(50).optional(),
});

/**
 * Employer Schema
 */
export const employerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  position: z.string().max(100).optional(),
  startDate: commonFields.dateString.optional(),
  endDate: commonFields.dateString.optional(),
  monthlyIncome: commonFields.nonNegativeNumber.optional(),
  phone: z.string().regex(patterns.phone, 'Invalid phone format').optional(),
  address: z.string().max(500).optional(),
});

/**
 * Tenant Create Schema
 */
export const tenantCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: commonFields.email,
  phone: z.string().regex(patterns.phone, 'Invalid phone format').optional(),
  // Address
  currentAddress: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  postalZip: z.string().max(20).optional(),
  // Legacy fields
  provinceState: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  // New FK fields
  countryCode: z.string().length(2).toUpperCase().optional(),
  regionCode: z.string().min(2).max(10).optional(),
  // Personal details
  dateOfBirth: commonFields.dateString.optional(),
  numberOfAdults: z.number().int().nonnegative().optional(),
  numberOfChildren: z.number().int().nonnegative().optional(),
  moveInDate: commonFields.dateString.optional(),
  leaseTerm: z.string().max(50).optional(),
  // Emergency contact
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().regex(patterns.phone, 'Invalid phone format').optional(),
  // Employment
  employmentStatus: employmentStatusSchema.optional(),
  monthlyIncome: commonFields.nonNegativeNumber.optional(),
  // Additional
  timezone: z.string().default('America/New_York'),
  // Relations (for nested creation)
  emergencyContacts: z.array(emergencyContactSchema).optional(),
  employers: z.array(employerSchema).optional(),
});

/**
 * Tenant Update Schema (all fields optional)
 */
export const tenantUpdateSchema = tenantCreateSchema.partial().extend({
  email: commonFields.email.optional(), // Can update email but must be valid if provided
});

/**
 * Tenant Response Schema
 */
export const tenantResponseSchema = z.object({
  id: commonFields.cuid,
  tenantId: z.string(),
  firstName: z.string(),
  middleName: z.string().nullable(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  currentAddress: z.string().nullable(),
  city: z.string().nullable(),
  postalZip: z.string().nullable(),
  provinceState: z.string().nullable(),
  country: z.string().nullable(),
  countryCode: z.string().nullable(),
  regionCode: z.string().nullable(),
  dateOfBirth: z.date().nullable(),
  numberOfAdults: z.number().int().nullable(),
  numberOfChildren: z.number().int().nullable(),
  moveInDate: z.date().nullable(),
  leaseTerm: z.string().nullable(),
  emergencyContactName: z.string().nullable(),
  emergencyContactPhone: z.string().nullable(),
  employmentStatus: z.string().nullable(),
  monthlyIncome: z.number().nullable(),
  invitationToken: z.string().nullable(),
  invitationSentAt: z.date().nullable(),
  invitedBy: z.string().nullable(),
  hasAccess: z.boolean(),
  lastLoginAt: z.date().nullable(),
  timezone: z.string().nullable(),
  approvalStatus: approvalStatusSchema,
  approvedBy: z.string().nullable(),
  approvedAt: z.date().nullable(),
  rejectedBy: z.string().nullable(),
  rejectedAt: z.date().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Relations
  leaseTenants: z.array(z.any()).optional(),
  emergencyContacts: z.array(z.any()).optional(),
  employers: z.array(z.any()).optional(),
});

/**
 * Tenant List Response Schema
 */
export const tenantListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(tenantResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Tenant Query Parameters Schema
 */
export const tenantQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  landlordId: commonFields.cuid.optional(),
  propertyId: commonFields.cuid.optional(),
  approvalStatus: approvalStatusSchema.optional(),
  hasAccess: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
  search: z.string().max(100).optional(), // Search by name or email
});

/**
 * Tenant Approval Schema
 */
export const tenantApprovalSchema = z.object({
  notes: z.string().optional(),
  approvedBy: z.string().optional(),
});

/**
 * Tenant Rejection Schema
 */
export const tenantRejectionSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

// Export types
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
export type EmploymentStatus = z.infer<typeof employmentStatusSchema>;
export type EmergencyContact = z.infer<typeof emergencyContactSchema>;
export type Employer = z.infer<typeof employerSchema>;
export type TenantCreate = z.infer<typeof tenantCreateSchema>;
export type TenantUpdate = z.infer<typeof tenantUpdateSchema>;
export type TenantResponse = z.infer<typeof tenantResponseSchema>;
export type TenantListResponse = z.infer<typeof tenantListResponseSchema>;
export type TenantQuery = z.infer<typeof tenantQuerySchema>;
export type TenantApproval = z.infer<typeof tenantApprovalSchema>;
export type TenantRejection = z.infer<typeof tenantRejectionSchema>;

