"use strict";
/**
 * Landlord Domain Schemas
 *
 * Single Source of Truth for Landlord domain validation and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.landlordQuerySchema = exports.landlordListResponseSchema = exports.landlordResponseSchema = exports.landlordUpdateSchema = exports.landlordCreateSchema = exports.approvalStatusSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
/**
 * Approval Status Enum (shared with tenants)
 */
exports.approvalStatusSchema = zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED']);
/**
 * Landlord Create Schema
 */
exports.landlordCreateSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required').max(100),
    middleName: zod_1.z.string().max(100).optional(),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(100),
    email: base_1.commonFields.email,
    phone: zod_1.z.string().regex(base_1.patterns.phone, 'Invalid phone format').optional(),
    // Address
    addressLine1: zod_1.z.string().max(255).optional(),
    addressLine2: zod_1.z.string().max(255).optional(),
    city: zod_1.z.string().max(100).optional(),
    postalZip: zod_1.z.string().max(20).optional(),
    // Legacy fields
    provinceState: zod_1.z.string().max(100).optional(),
    country: zod_1.z.string().max(100).optional(),
    // New FK fields
    countryCode: zod_1.z.string().length(2).toUpperCase().optional(),
    regionCode: zod_1.z.string().min(2).max(10).optional(),
    // Settings
    timezone: zod_1.z.string().default('America/Toronto'),
    theme: zod_1.z.string().default('default'),
    // Organization (for multi-tenancy)
    organizationId: base_1.commonFields.cuid.optional(),
});
/**
 * Landlord Update Schema (all fields optional)
 */
exports.landlordUpdateSchema = exports.landlordCreateSchema.partial().safeExtend({
    email: base_1.commonFields.email.optional(), // Can update email but must be valid if provided
});
/**
 * Landlord Response Schema
 */
exports.landlordResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    landlordId: zod_1.z.string(),
    firstName: zod_1.z.string(),
    middleName: zod_1.z.string().nullable(),
    lastName: zod_1.z.string(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().nullable(),
    addressLine1: zod_1.z.string().nullable(),
    addressLine2: zod_1.z.string().nullable(),
    city: zod_1.z.string().nullable(),
    postalZip: zod_1.z.string().nullable(),
    provinceState: zod_1.z.string().nullable(),
    country: zod_1.z.string().nullable(),
    countryCode: zod_1.z.string().nullable(),
    regionCode: zod_1.z.string().nullable(),
    timezone: zod_1.z.string().nullable(),
    theme: zod_1.z.string().nullable(),
    signatureFileName: zod_1.z.string().nullable(),
    organizationId: zod_1.z.string().nullable(),
    approvalStatus: exports.approvalStatusSchema,
    approvedBy: zod_1.z.string().nullable(),
    approvedAt: zod_1.z.date().nullable(),
    rejectedBy: zod_1.z.string().nullable(),
    rejectedAt: zod_1.z.date().nullable(),
    rejectionReason: zod_1.z.string().nullable(),
    invitedBy: zod_1.z.string().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
/**
 * Landlord List Response Schema
 */
exports.landlordListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.array(exports.landlordResponseSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
/**
 * Landlord Query Parameters Schema
 */
exports.landlordQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    approvalStatus: exports.approvalStatusSchema.optional(),
    search: zod_1.z.string().max(100).optional(), // Search by name or email
    organizationId: base_1.commonFields.cuid.optional(),
});
