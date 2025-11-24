/**
 * Expense Domain Schemas
 * 
 * Single Source of Truth for Expense domain validation and types
 */

import { z } from 'zod';
import { commonFields } from '../base';

/**
 * Expense Category Schema
 */
export const expenseCategorySchema = z.string().min(1, "Category is required");

/**
 * Payment Method Schema
 */
export const expensePaymentMethodSchema = z.enum([
  'Cash',
  'Check',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Online Payment',
  'Other',
]).optional();

/**
 * Recurring Frequency Schema
 */
export const recurringFrequencySchema = z.enum([
  'Monthly',
  'Quarterly',
  'Yearly',
  'Weekly',
  'Bi-weekly',
]).optional();

/**
 * Expense Create Schema
 */
export const expenseCreateSchema = z.object({
  propertyId: commonFields.cuid.optional(), // Required if not maintenance-related
  maintenanceRequestId: commonFields.cuid.optional(), // Optional, links to maintenance request
  category: expenseCategorySchema,
  amount: commonFields.positiveNumber,
  date: commonFields.dateString,
  description: z.string().min(1, "Description is required").max(5000),
  receiptUrl: z.string().url().optional(),
  paidTo: z.string().max(200).optional(),
  paymentMethod: expensePaymentMethodSchema,
  isRecurring: z.boolean().default(false),
  recurringFrequency: recurringFrequencySchema.optional(),
  vendorId: commonFields.cuid.optional(), // For populating paidTo
});

/**
 * Expense Update Schema
 */
export const expenseUpdateSchema = expenseCreateSchema.partial().extend({
  propertyId: commonFields.cuid.optional(), // Can't change property
  maintenanceRequestId: commonFields.cuid.optional().nullable(), // Can unlink from maintenance
});

/**
 * Expense Query Schema
 */
export const expenseQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  propertyId: commonFields.cuid.optional(),
  maintenanceRequestId: commonFields.cuid.optional(),
  category: z.string().optional(),
  startDate: commonFields.dateString.optional(),
  endDate: commonFields.dateString.optional(),
  landlordId: commonFields.cuid.optional(),
});

/**
 * Expense Response Schema
 */
export const expenseResponseSchema = z.object({
  id: commonFields.cuid,
  propertyId: commonFields.cuid.nullable(),
  maintenanceRequestId: commonFields.cuid.nullable(),
  category: z.string(),
  amount: z.number(),
  date: z.date(),
  description: z.string(),
  receiptUrl: z.string().nullable(),
  paidTo: z.string().nullable(),
  paymentMethod: z.string().nullable(),
  isRecurring: z.boolean(),
  recurringFrequency: z.string().nullable(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdByPMC: z.boolean(),
  pmcId: z.string().nullable(),
  pmcApprovalRequestId: commonFields.cuid.nullable(),
  // Relations
  property: z.object({
    id: commonFields.cuid,
    propertyName: z.string().nullable(),
    addressLine1: z.string(),
    unitCount: z.number().optional(),
  }).nullable().optional(),
  maintenanceRequest: z.object({
    id: commonFields.cuid,
    ticketNumber: z.string().nullable(),
    title: z.string(),
    category: z.string(),
    status: z.string(),
    property: z.object({
      id: commonFields.cuid,
      propertyName: z.string().nullable(),
      addressLine1: z.string(),
      unitCount: z.number().optional(),
    }).optional(),
  }).nullable().optional(),
  pmcApprovalRequest: z.object({
    id: commonFields.cuid,
    status: z.string(),
    requestedAt: z.date(),
    approvedAt: z.date().nullable(),
    rejectedAt: z.date().nullable(),
    rejectionReason: z.string().nullable(),
    approvalNotes: z.string().nullable(),
  }).nullable().optional(),
});

/**
 * Expense List Response Schema
 */
export const expenseListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(expenseResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Export types
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type ExpensePaymentMethod = z.infer<typeof expensePaymentMethodSchema>;
export type RecurringFrequency = z.infer<typeof recurringFrequencySchema>;
export type ExpenseCreate = z.infer<typeof expenseCreateSchema>;
export type ExpenseUpdate = z.infer<typeof expenseUpdateSchema>;
export type ExpenseQuery = z.infer<typeof expenseQuerySchema>;
export type ExpenseResponse = z.infer<typeof expenseResponseSchema>;
export type ExpenseListResponse = z.infer<typeof expenseListResponseSchema>;

