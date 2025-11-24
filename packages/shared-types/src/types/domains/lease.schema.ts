/**
 * Lease Domain Schemas
 * 
 * Single Source of Truth for Lease domain validation and types
 */

import { z } from 'zod';
import { commonFields } from '../base';

/**
 * Lease Status Enum
 */
export const leaseStatusSchema = z.enum([
  'Active',
  'Expired',
  'Terminated',
  'Pending',
  'Draft',
]);

/**
 * Payment Method Enum
 */
export const paymentMethodSchema = z.enum([
  'Cash',
  'Check',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'Online Payment',
  'Other',
]);

/**
 * Renewal Decision Enum
 */
export const renewalDecisionSchema = z.enum(['renew', 'terminate', 'month_to_month']);

/**
 * Lease Tenant Schema (for lease-tenant relationships)
 */
export const leaseTenantSchema = z.object({
  tenantId: commonFields.cuid,
  isPrimaryTenant: z.boolean().default(false),
});

/**
 * Lease Create Schema
 */
export const leaseCreateSchema = z.object({
  unitId: commonFields.cuid,
  leaseStart: commonFields.dateString,
  leaseEnd: commonFields.dateString.optional(),
  rentAmount: commonFields.positiveNumber,
  rentDueDay: z.number().int().min(1).max(31).default(1),
  securityDeposit: commonFields.nonNegativeNumber.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  status: leaseStatusSchema.default('Active'),
  tenantIds: z.array(commonFields.cuid).min(1, 'At least one tenant is required'),
  primaryTenantId: commonFields.cuid.optional(), // Must be one of tenantIds
}).refine(
  (data) => {
    // Validate lease dates
    if (data.leaseEnd) {
      const start = new Date(data.leaseStart);
      const end = new Date(data.leaseEnd);
      return end > start;
    }
    return true;
  },
  {
    message: 'Lease end date must be after start date',
    path: ['leaseEnd'],
  }
).refine(
  (data) => {
    // Validate primary tenant is in tenantIds
    if (data.primaryTenantId && !data.tenantIds.includes(data.primaryTenantId)) {
      return false;
    }
    return true;
  },
  {
    message: 'Primary tenant must be one of the tenant IDs',
    path: ['primaryTenantId'],
  }
);

/**
 * Lease Update Schema (all fields optional)
 */
export const leaseUpdateSchema = leaseCreateSchema.partial().safeExtend({
  unitId: commonFields.cuid.optional(), // Can't change unit
});

/**
 * Lease Response Schema
 */
export const leaseResponseSchema = z.object({
  id: commonFields.cuid,
  unitId: commonFields.cuid,
  leaseStart: z.date(),
  leaseEnd: z.date().nullable(),
  rentAmount: z.number(),
  rentDueDay: z.number().int(),
  securityDeposit: z.number().nullable(),
  paymentMethod: z.string().nullable(),
  status: leaseStatusSchema,
  renewalReminderSent: z.boolean(),
  renewalReminderSentAt: z.date().nullable(),
  renewalDecision: renewalDecisionSchema.nullable(),
  renewalDecisionAt: z.date().nullable(),
  renewalDecisionBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Relations
  leaseTenants: z.array(z.object({
    leaseId: commonFields.cuid,
    tenantId: commonFields.cuid,
    isPrimaryTenant: z.boolean(),
    addedAt: z.date(),
    tenant: z.object({
      id: commonFields.cuid,
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phone: z.string().nullable(),
    }).optional(),
  })).optional(),
  unit: z.object({
    id: commonFields.cuid,
    unitName: z.string(),
    floorNumber: z.number().int().nullable(),
    bedrooms: z.number().int().nullable(),
    bathrooms: z.number().nullable(),
    rentPrice: z.number().nullable(),
    status: z.string(),
    property: z.object({
      id: commonFields.cuid,
      propertyName: z.string().nullable(),
      addressLine1: z.string(),
      city: z.string(),
      provinceState: z.string().nullable(),
    }).optional(),
  }).optional(),
});

/**
 * Lease List Response Schema
 */
export const leaseListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(leaseResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Lease Query Parameters Schema
 */
export const leaseQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  unitId: commonFields.cuid.optional(),
  propertyId: commonFields.cuid.optional(),
  tenantId: commonFields.cuid.optional(),
  status: leaseStatusSchema.optional(),
  landlordId: commonFields.cuid.optional(),
});

/**
 * Lease Renewal Schema
 */
export const leaseRenewalSchema = z.object({
  decision: z.enum(['renew', 'month-to-month', 'terminate']),
  newLeaseEnd: z.string().datetime().optional(),
  newRentAmount: z.number().optional(),
});

/**
 * Lease Termination Schema
 */
export const leaseTerminationSchema = z.object({
  reason: z.string().min(1, 'Termination reason is required'),
  terminationDate: z.string().datetime().or(z.date()),
  actualLoss: z.number().optional(),
});

// Export types
export type LeaseStatus = z.infer<typeof leaseStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type RenewalDecision = z.infer<typeof renewalDecisionSchema>;
export type LeaseTenant = z.infer<typeof leaseTenantSchema>;
export type LeaseCreate = z.infer<typeof leaseCreateSchema>;
export type LeaseUpdate = z.infer<typeof leaseUpdateSchema>;
export type LeaseResponse = z.infer<typeof leaseResponseSchema>;
export type LeaseListResponse = z.infer<typeof leaseListResponseSchema>;
export type LeaseQuery = z.infer<typeof leaseQuerySchema>;
export type LeaseRenewal = z.infer<typeof leaseRenewalSchema>;
export type LeaseTermination = z.infer<typeof leaseTerminationSchema>;

