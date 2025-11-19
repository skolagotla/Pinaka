"use strict";
/**
 * Lease Domain Schemas
 *
 * Single Source of Truth for Lease domain validation and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaseTerminationSchema = exports.leaseRenewalSchema = exports.leaseQuerySchema = exports.leaseListResponseSchema = exports.leaseResponseSchema = exports.leaseUpdateSchema = exports.leaseCreateSchema = exports.leaseTenantSchema = exports.renewalDecisionSchema = exports.paymentMethodSchema = exports.leaseStatusSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
/**
 * Lease Status Enum
 */
exports.leaseStatusSchema = zod_1.z.enum([
    'Active',
    'Expired',
    'Terminated',
    'Pending',
    'Draft',
]);
/**
 * Payment Method Enum
 */
exports.paymentMethodSchema = zod_1.z.enum([
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
exports.renewalDecisionSchema = zod_1.z.enum(['renew', 'terminate', 'month_to_month']);
/**
 * Lease Tenant Schema (for lease-tenant relationships)
 */
exports.leaseTenantSchema = zod_1.z.object({
    tenantId: base_1.commonFields.cuid,
    isPrimaryTenant: zod_1.z.boolean().default(false),
});
/**
 * Lease Create Schema
 */
exports.leaseCreateSchema = zod_1.z.object({
    unitId: base_1.commonFields.cuid,
    leaseStart: base_1.commonFields.dateString,
    leaseEnd: base_1.commonFields.dateString.optional(),
    rentAmount: base_1.commonFields.positiveNumber,
    rentDueDay: zod_1.z.number().int().min(1).max(31).default(1),
    securityDeposit: base_1.commonFields.nonNegativeNumber.optional(),
    paymentMethod: exports.paymentMethodSchema.optional(),
    status: exports.leaseStatusSchema.default('Active'),
    tenantIds: zod_1.z.array(base_1.commonFields.cuid).min(1, 'At least one tenant is required'),
    primaryTenantId: base_1.commonFields.cuid.optional(), // Must be one of tenantIds
}).refine((data) => {
    // Validate lease dates
    if (data.leaseEnd) {
        const start = new Date(data.leaseStart);
        const end = new Date(data.leaseEnd);
        return end > start;
    }
    return true;
}, {
    message: 'Lease end date must be after start date',
    path: ['leaseEnd'],
}).refine((data) => {
    // Validate primary tenant is in tenantIds
    if (data.primaryTenantId && !data.tenantIds.includes(data.primaryTenantId)) {
        return false;
    }
    return true;
}, {
    message: 'Primary tenant must be one of the tenant IDs',
    path: ['primaryTenantId'],
});
/**
 * Lease Update Schema (all fields optional)
 */
exports.leaseUpdateSchema = exports.leaseCreateSchema.partial().safeExtend({
    unitId: base_1.commonFields.cuid.optional(), // Can't change unit
});
/**
 * Lease Response Schema
 */
exports.leaseResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    unitId: base_1.commonFields.cuid,
    leaseStart: zod_1.z.date(),
    leaseEnd: zod_1.z.date().nullable(),
    rentAmount: zod_1.z.number(),
    rentDueDay: zod_1.z.number().int(),
    securityDeposit: zod_1.z.number().nullable(),
    paymentMethod: zod_1.z.string().nullable(),
    status: exports.leaseStatusSchema,
    renewalReminderSent: zod_1.z.boolean(),
    renewalReminderSentAt: zod_1.z.date().nullable(),
    renewalDecision: exports.renewalDecisionSchema.nullable(),
    renewalDecisionAt: zod_1.z.date().nullable(),
    renewalDecisionBy: zod_1.z.string().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    // Relations
    leaseTenants: zod_1.z.array(zod_1.z.object({
        leaseId: base_1.commonFields.cuid,
        tenantId: base_1.commonFields.cuid,
        isPrimaryTenant: zod_1.z.boolean(),
        addedAt: zod_1.z.date(),
        tenant: zod_1.z.object({
            id: base_1.commonFields.cuid,
            firstName: zod_1.z.string(),
            lastName: zod_1.z.string(),
            email: zod_1.z.string().email(),
            phone: zod_1.z.string().nullable(),
        }).optional(),
    })).optional(),
    unit: zod_1.z.object({
        id: base_1.commonFields.cuid,
        unitName: zod_1.z.string(),
        floorNumber: zod_1.z.number().int().nullable(),
        bedrooms: zod_1.z.number().int().nullable(),
        bathrooms: zod_1.z.number().nullable(),
        rentPrice: zod_1.z.number().nullable(),
        status: zod_1.z.string(),
        property: zod_1.z.object({
            id: base_1.commonFields.cuid,
            propertyName: zod_1.z.string().nullable(),
            addressLine1: zod_1.z.string(),
            city: zod_1.z.string(),
            provinceState: zod_1.z.string().nullable(),
        }).optional(),
    }).optional(),
});
/**
 * Lease List Response Schema
 */
exports.leaseListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.array(exports.leaseResponseSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
/**
 * Lease Query Parameters Schema
 */
exports.leaseQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    unitId: base_1.commonFields.cuid.optional(),
    propertyId: base_1.commonFields.cuid.optional(),
    tenantId: base_1.commonFields.cuid.optional(),
    status: exports.leaseStatusSchema.optional(),
    landlordId: base_1.commonFields.cuid.optional(),
});
/**
 * Lease Renewal Schema
 */
exports.leaseRenewalSchema = zod_1.z.object({
    decision: zod_1.z.enum(['renew', 'month-to-month', 'terminate']),
    newLeaseEnd: zod_1.z.string().datetime().optional(),
    newRentAmount: zod_1.z.number().optional(),
});
/**
 * Lease Termination Schema
 */
exports.leaseTerminationSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1, 'Termination reason is required'),
    terminationDate: zod_1.z.string().datetime().or(zod_1.z.date()),
    actualLoss: zod_1.z.number().optional(),
});
