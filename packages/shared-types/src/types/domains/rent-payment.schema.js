"use strict";
/**
 * Rent Payment Domain Schemas
 *
 * Single Source of Truth for Rent Payment domain validation and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rentPaymentQuerySchema = exports.rentPaymentListResponseSchema = exports.rentPaymentResponseSchema = exports.createPartialPaymentSchema = exports.recordPaymentSchema = exports.rentPaymentUpdateSchema = exports.rentPaymentCreateSchema = exports.partialPaymentSchema = exports.paymentStatusSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
const lease_schema_1 = require("./lease.schema");
/**
 * Payment Status Enum
 */
exports.paymentStatusSchema = zod_1.z.enum([
    'Unpaid',
    'Paid',
    'Partial',
    'Overdue',
    'Cancelled',
]);
/**
 * Partial Payment Schema
 */
exports.partialPaymentSchema = zod_1.z.object({
    id: base_1.commonFields.cuid.optional(),
    amount: base_1.commonFields.positiveNumber,
    paidDate: base_1.commonFields.dateString,
    paymentMethod: lease_schema_1.paymentMethodSchema.optional(),
    referenceNumber: zod_1.z.string().max(100).optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
/**
 * Rent Payment Create Schema
 */
exports.rentPaymentCreateSchema = zod_1.z.object({
    leaseId: base_1.commonFields.cuid,
    amount: base_1.commonFields.positiveNumber,
    dueDate: base_1.commonFields.dateString,
    paidDate: base_1.commonFields.dateString.optional(),
    paymentMethod: lease_schema_1.paymentMethodSchema.optional(),
    referenceNumber: zod_1.z.string().max(100).optional(),
    status: exports.paymentStatusSchema.default('Unpaid'),
    notes: zod_1.z.string().max(1000).optional(),
    // Partial payment (legacy support)
    partialAmountPaid: base_1.commonFields.nonNegativeNumber.optional(),
});
/**
 * Rent Payment Update Schema
 */
exports.rentPaymentUpdateSchema = exports.rentPaymentCreateSchema.partial().extend({
    leaseId: base_1.commonFields.cuid.optional(), // Can't change lease
});
/**
 * Record Payment Schema (mark as paid)
 */
exports.recordPaymentSchema = zod_1.z.object({
    paidDate: base_1.commonFields.dateString,
    paymentMethod: lease_schema_1.paymentMethodSchema,
    referenceNumber: zod_1.z.string().max(100).optional(),
    notes: zod_1.z.string().max(1000).optional(),
    amount: base_1.commonFields.positiveNumber.optional(), // Override amount if different
});
/**
 * Partial Payment Create Schema
 */
exports.createPartialPaymentSchema = zod_1.z.object({
    amount: base_1.commonFields.positiveNumber,
    paidDate: base_1.commonFields.dateString,
    paymentMethod: lease_schema_1.paymentMethodSchema.optional(),
    referenceNumber: zod_1.z.string().max(100).optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
/**
 * Rent Payment Response Schema
 */
exports.rentPaymentResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    leaseId: base_1.commonFields.cuid,
    amount: zod_1.z.number(),
    dueDate: zod_1.z.date(),
    paidDate: zod_1.z.date().nullable(),
    paymentMethod: zod_1.z.string().nullable(),
    referenceNumber: zod_1.z.string().nullable(),
    status: exports.paymentStatusSchema,
    notes: zod_1.z.string().nullable(),
    receiptNumber: zod_1.z.string().nullable(),
    receiptSent: zod_1.z.boolean(),
    receiptSentAt: zod_1.z.date().nullable(),
    overdueReminderSent: zod_1.z.boolean(),
    overdueReminderSentAt: zod_1.z.date().nullable(),
    reminderSent: zod_1.z.boolean(),
    reminderSentAt: zod_1.z.date().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    // Relations
    partialPayments: zod_1.z.array(exports.partialPaymentSchema).optional(),
    lease: zod_1.z.object({
        id: base_1.commonFields.cuid,
        leaseStart: zod_1.z.date(),
        leaseEnd: zod_1.z.date().nullable(),
        rentAmount: zod_1.z.number(),
        status: zod_1.z.string(),
        unit: zod_1.z.object({
            id: base_1.commonFields.cuid,
            unitName: zod_1.z.string(),
            property: zod_1.z.object({
                id: base_1.commonFields.cuid,
                propertyName: zod_1.z.string().nullable(),
                addressLine1: zod_1.z.string(),
                city: zod_1.z.string(),
                provinceState: zod_1.z.string().nullable(),
            }),
        }),
        leaseTenants: zod_1.z.array(zod_1.z.object({
            tenantId: base_1.commonFields.cuid,
            isPrimaryTenant: zod_1.z.boolean(),
            tenant: zod_1.z.object({
                id: base_1.commonFields.cuid,
                firstName: zod_1.z.string(),
                lastName: zod_1.z.string(),
                email: zod_1.z.string().email(),
            }),
        })).optional(),
    }).optional(),
    // Calculated fields
    totalPartialPaid: zod_1.z.number().optional(),
    stripePayment: zod_1.z.any().optional(),
});
/**
 * Rent Payment List Response Schema
 */
exports.rentPaymentListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.array(exports.rentPaymentResponseSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
/**
 * Rent Payment Query Parameters Schema
 */
exports.rentPaymentQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    leaseId: base_1.commonFields.cuid.optional(),
    propertyId: base_1.commonFields.cuid.optional(),
    tenantId: base_1.commonFields.cuid.optional(),
    status: exports.paymentStatusSchema.optional(),
    landlordId: base_1.commonFields.cuid.optional(),
    dueDateFrom: base_1.commonFields.dateString.optional(),
    dueDateTo: base_1.commonFields.dateString.optional(),
    paidDateFrom: base_1.commonFields.dateString.optional(),
    paidDateTo: base_1.commonFields.dateString.optional(),
});
