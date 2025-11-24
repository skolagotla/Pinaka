"use strict";
/**
 * Expense Domain Schemas
 *
 * Single Source of Truth for Expense domain validation and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseListResponseSchema = exports.expenseResponseSchema = exports.expenseQuerySchema = exports.expenseUpdateSchema = exports.expenseCreateSchema = exports.recurringFrequencySchema = exports.expensePaymentMethodSchema = exports.expenseCategorySchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
/**
 * Expense Category Schema
 */
exports.expenseCategorySchema = zod_1.z.string().min(1, "Category is required");
/**
 * Payment Method Schema
 */
exports.expensePaymentMethodSchema = zod_1.z.enum([
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
exports.recurringFrequencySchema = zod_1.z.enum([
    'Monthly',
    'Quarterly',
    'Yearly',
    'Weekly',
    'Bi-weekly',
]).optional();
/**
 * Expense Create Schema
 */
exports.expenseCreateSchema = zod_1.z.object({
    propertyId: base_1.commonFields.cuid.optional(), // Required if not maintenance-related
    maintenanceRequestId: base_1.commonFields.cuid.optional(), // Optional, links to maintenance request
    category: exports.expenseCategorySchema,
    amount: base_1.commonFields.positiveNumber,
    date: base_1.commonFields.dateString,
    description: zod_1.z.string().min(1, "Description is required").max(5000),
    receiptUrl: zod_1.z.string().url().optional(),
    paidTo: zod_1.z.string().max(200).optional(),
    paymentMethod: exports.expensePaymentMethodSchema,
    isRecurring: zod_1.z.boolean().default(false),
    recurringFrequency: exports.recurringFrequencySchema.optional(),
    vendorId: base_1.commonFields.cuid.optional(), // For populating paidTo
});
/**
 * Expense Update Schema
 */
exports.expenseUpdateSchema = exports.expenseCreateSchema.partial().extend({
    propertyId: base_1.commonFields.cuid.optional(), // Can't change property
    maintenanceRequestId: base_1.commonFields.cuid.optional().nullable(), // Can unlink from maintenance
});
/**
 * Expense Query Schema
 */
exports.expenseQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    propertyId: base_1.commonFields.cuid.optional(),
    maintenanceRequestId: base_1.commonFields.cuid.optional(),
    category: zod_1.z.string().optional(),
    startDate: base_1.commonFields.dateString.optional(),
    endDate: base_1.commonFields.dateString.optional(),
    landlordId: base_1.commonFields.cuid.optional(),
});
/**
 * Expense Response Schema
 */
exports.expenseResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    propertyId: base_1.commonFields.cuid.nullable(),
    maintenanceRequestId: base_1.commonFields.cuid.nullable(),
    category: zod_1.z.string(),
    amount: zod_1.z.number(),
    date: zod_1.z.date(),
    description: zod_1.z.string(),
    receiptUrl: zod_1.z.string().nullable(),
    paidTo: zod_1.z.string().nullable(),
    paymentMethod: zod_1.z.string().nullable(),
    isRecurring: zod_1.z.boolean(),
    recurringFrequency: zod_1.z.string().nullable(),
    createdBy: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    createdByPMC: zod_1.z.boolean(),
    pmcId: zod_1.z.string().nullable(),
    pmcApprovalRequestId: base_1.commonFields.cuid.nullable(),
    // Relations
    property: zod_1.z.object({
        id: base_1.commonFields.cuid,
        propertyName: zod_1.z.string().nullable(),
        addressLine1: zod_1.z.string(),
        unitCount: zod_1.z.number().optional(),
    }).nullable().optional(),
    maintenanceRequest: zod_1.z.object({
        id: base_1.commonFields.cuid,
        ticketNumber: zod_1.z.string().nullable(),
        title: zod_1.z.string(),
        category: zod_1.z.string(),
        status: zod_1.z.string(),
        property: zod_1.z.object({
            id: base_1.commonFields.cuid,
            propertyName: zod_1.z.string().nullable(),
            addressLine1: zod_1.z.string(),
            unitCount: zod_1.z.number().optional(),
        }).optional(),
    }).nullable().optional(),
    pmcApprovalRequest: zod_1.z.object({
        id: base_1.commonFields.cuid,
        status: zod_1.z.string(),
        requestedAt: zod_1.z.date(),
        approvedAt: zod_1.z.date().nullable(),
        rejectedAt: zod_1.z.date().nullable(),
        rejectionReason: zod_1.z.string().nullable(),
        approvalNotes: zod_1.z.string().nullable(),
    }).nullable().optional(),
});
/**
 * Expense List Response Schema
 */
exports.expenseListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.array(exports.expenseResponseSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
