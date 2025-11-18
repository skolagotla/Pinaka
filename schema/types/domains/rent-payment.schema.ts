/**
 * Rent Payment Domain Schemas
 * 
 * Single Source of Truth for Rent Payment domain validation and types
 */

import { z } from 'zod';
import { commonFields } from '../base';
import { paymentMethodSchema } from './lease.schema';

/**
 * Payment Status Enum
 */
export const paymentStatusSchema = z.enum([
  'Unpaid',
  'Paid',
  'Partial',
  'Overdue',
  'Cancelled',
]);

/**
 * Partial Payment Schema
 */
export const partialPaymentSchema = z.object({
  id: commonFields.cuid.optional(),
  amount: commonFields.positiveNumber,
  paidDate: commonFields.dateString,
  paymentMethod: paymentMethodSchema.optional(),
  referenceNumber: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Rent Payment Create Schema
 */
export const rentPaymentCreateSchema = z.object({
  leaseId: commonFields.cuid,
  amount: commonFields.positiveNumber,
  dueDate: commonFields.dateString,
  paidDate: commonFields.dateString.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  referenceNumber: z.string().max(100).optional(),
  status: paymentStatusSchema.default('Unpaid'),
  notes: z.string().max(1000).optional(),
  // Partial payment (legacy support)
  partialAmountPaid: commonFields.nonNegativeNumber.optional(),
});

/**
 * Rent Payment Update Schema
 */
export const rentPaymentUpdateSchema = rentPaymentCreateSchema.partial().extend({
  leaseId: commonFields.cuid.optional(), // Can't change lease
});

/**
 * Record Payment Schema (mark as paid)
 */
export const recordPaymentSchema = z.object({
  paidDate: commonFields.dateString,
  paymentMethod: paymentMethodSchema,
  referenceNumber: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  amount: commonFields.positiveNumber.optional(), // Override amount if different
});

/**
 * Partial Payment Create Schema
 */
export const createPartialPaymentSchema = z.object({
  amount: commonFields.positiveNumber,
  paidDate: commonFields.dateString,
  paymentMethod: paymentMethodSchema.optional(),
  referenceNumber: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Rent Payment Response Schema
 */
export const rentPaymentResponseSchema = z.object({
  id: commonFields.cuid,
  leaseId: commonFields.cuid,
  amount: z.number(),
  dueDate: z.date(),
  paidDate: z.date().nullable(),
  paymentMethod: z.string().nullable(),
  referenceNumber: z.string().nullable(),
  status: paymentStatusSchema,
  notes: z.string().nullable(),
  receiptNumber: z.string().nullable(),
  receiptSent: z.boolean(),
  receiptSentAt: z.date().nullable(),
  overdueReminderSent: z.boolean(),
  overdueReminderSentAt: z.date().nullable(),
  reminderSent: z.boolean(),
  reminderSentAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Relations
  partialPayments: z.array(partialPaymentSchema).optional(),
  lease: z.object({
    id: commonFields.cuid,
    leaseStart: z.date(),
    leaseEnd: z.date().nullable(),
    rentAmount: z.number(),
    status: z.string(),
    unit: z.object({
      id: commonFields.cuid,
      unitName: z.string(),
      property: z.object({
        id: commonFields.cuid,
        propertyName: z.string().nullable(),
        addressLine1: z.string(),
        city: z.string(),
        provinceState: z.string().nullable(),
      }),
    }),
    leaseTenants: z.array(z.object({
      tenantId: commonFields.cuid,
      isPrimaryTenant: z.boolean(),
      tenant: z.object({
        id: commonFields.cuid,
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
      }),
    })).optional(),
  }).optional(),
  // Calculated fields
  totalPartialPaid: z.number().optional(),
  stripePayment: z.any().optional(),
});

/**
 * Rent Payment List Response Schema
 */
export const rentPaymentListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(rentPaymentResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Rent Payment Query Parameters Schema
 */
export const rentPaymentQuerySchema = z.object({
        page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  leaseId: commonFields.cuid.optional(),
  propertyId: commonFields.cuid.optional(),
  tenantId: commonFields.cuid.optional(),
  status: paymentStatusSchema.optional(),
  landlordId: commonFields.cuid.optional(),
  dueDateFrom: commonFields.dateString.optional(),
  dueDateTo: commonFields.dateString.optional(),
  paidDateFrom: commonFields.dateString.optional(),
  paidDateTo: commonFields.dateString.optional(),
});

// Export types
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PartialPayment = z.infer<typeof partialPaymentSchema>;
export type RentPaymentCreate = z.infer<typeof rentPaymentCreateSchema>;
export type RentPaymentUpdate = z.infer<typeof rentPaymentUpdateSchema>;
export type RecordPayment = z.infer<typeof recordPaymentSchema>;
export type CreatePartialPayment = z.infer<typeof createPartialPaymentSchema>;
export type RentPaymentResponse = z.infer<typeof rentPaymentResponseSchema>;
export type RentPaymentListResponse = z.infer<typeof rentPaymentListResponseSchema>;
export type RentPaymentQuery = z.infer<typeof rentPaymentQuerySchema>;

