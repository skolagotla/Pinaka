"use strict";
/**
 * Tenant Domain Schemas
 *
 * Single Source of Truth for Tenant domain validation and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantRejectionSchema = exports.tenantApprovalSchema = exports.tenantQuerySchema = exports.tenantListResponseSchema = exports.tenantResponseSchema = exports.tenantUpdateSchema = exports.tenantCreateSchema = exports.employerSchema = exports.emergencyContactSchema = exports.employmentStatusSchema = exports.approvalStatusSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
/**
 * Approval Status Enum
 */
exports.approvalStatusSchema = zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED']);
/**
 * Employment Status Enum
 */
exports.employmentStatusSchema = zod_1.z.enum([
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
exports.emergencyContactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Emergency contact name is required').max(100),
    phone: zod_1.z.string().regex(base_1.patterns.phone, 'Invalid phone format').max(20),
    relationship: zod_1.z.string().max(50).optional(),
});
/**
 * Employer Schema
 */
exports.employerSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(1, 'Company name is required').max(200),
    position: zod_1.z.string().max(100).optional(),
    startDate: base_1.commonFields.dateString.optional(),
    endDate: base_1.commonFields.dateString.optional(),
    monthlyIncome: base_1.commonFields.nonNegativeNumber.optional(),
    phone: zod_1.z.string().regex(base_1.patterns.phone, 'Invalid phone format').optional(),
    address: zod_1.z.string().max(500).optional(),
});
/**
 * Tenant Create Schema
 */
exports.tenantCreateSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required').max(100),
    middleName: zod_1.z.string().max(100).optional(),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(100),
    email: base_1.commonFields.email,
    phone: zod_1.z.string().regex(base_1.patterns.phone, 'Invalid phone format').optional(),
    // Address
    currentAddress: zod_1.z.string().max(500).optional(),
    city: zod_1.z.string().max(100).optional(),
    postalZip: zod_1.z.string().max(20).optional(),
    // Legacy fields
    provinceState: zod_1.z.string().max(100).optional(),
    country: zod_1.z.string().max(100).optional(),
    // New FK fields
    countryCode: zod_1.z.string().length(2).toUpperCase().optional(),
    regionCode: zod_1.z.string().min(2).max(10).optional(),
    // Personal details
    dateOfBirth: base_1.commonFields.dateString.optional(),
    numberOfAdults: zod_1.z.number().int().nonnegative().optional(),
    numberOfChildren: zod_1.z.number().int().nonnegative().optional(),
    moveInDate: base_1.commonFields.dateString.optional(),
    leaseTerm: zod_1.z.string().max(50).optional(),
    // Emergency contact
    emergencyContactName: zod_1.z.string().max(100).optional(),
    emergencyContactPhone: zod_1.z.string().regex(base_1.patterns.phone, 'Invalid phone format').optional(),
    // Employment
    employmentStatus: exports.employmentStatusSchema.optional(),
    monthlyIncome: base_1.commonFields.nonNegativeNumber.optional(),
    // Additional
    timezone: zod_1.z.string().default('America/New_York'),
    // Relations (for nested creation)
    emergencyContacts: zod_1.z.array(exports.emergencyContactSchema).optional(),
    employers: zod_1.z.array(exports.employerSchema).optional(),
});
/**
 * Tenant Update Schema (all fields optional)
 */
exports.tenantUpdateSchema = exports.tenantCreateSchema.partial().extend({
    email: base_1.commonFields.email.optional(), // Can update email but must be valid if provided
});
/**
 * Tenant Response Schema
 */
exports.tenantResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    tenantId: zod_1.z.string(),
    firstName: zod_1.z.string(),
    middleName: zod_1.z.string().nullable(),
    lastName: zod_1.z.string(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().nullable(),
    currentAddress: zod_1.z.string().nullable(),
    city: zod_1.z.string().nullable(),
    postalZip: zod_1.z.string().nullable(),
    provinceState: zod_1.z.string().nullable(),
    country: zod_1.z.string().nullable(),
    countryCode: zod_1.z.string().nullable(),
    regionCode: zod_1.z.string().nullable(),
    dateOfBirth: zod_1.z.date().nullable(),
    numberOfAdults: zod_1.z.number().int().nullable(),
    numberOfChildren: zod_1.z.number().int().nullable(),
    moveInDate: zod_1.z.date().nullable(),
    leaseTerm: zod_1.z.string().nullable(),
    emergencyContactName: zod_1.z.string().nullable(),
    emergencyContactPhone: zod_1.z.string().nullable(),
    employmentStatus: zod_1.z.string().nullable(),
    monthlyIncome: zod_1.z.number().nullable(),
    invitationToken: zod_1.z.string().nullable(),
    invitationSentAt: zod_1.z.date().nullable(),
    invitedBy: zod_1.z.string().nullable(),
    hasAccess: zod_1.z.boolean(),
    lastLoginAt: zod_1.z.date().nullable(),
    timezone: zod_1.z.string().nullable(),
    approvalStatus: exports.approvalStatusSchema,
    approvedBy: zod_1.z.string().nullable(),
    approvedAt: zod_1.z.date().nullable(),
    rejectedBy: zod_1.z.string().nullable(),
    rejectedAt: zod_1.z.date().nullable(),
    rejectionReason: zod_1.z.string().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    // Relations
    leaseTenants: zod_1.z.array(zod_1.z.any()).optional(),
    emergencyContacts: zod_1.z.array(zod_1.z.any()).optional(),
    employers: zod_1.z.array(zod_1.z.any()).optional(),
});
/**
 * Tenant List Response Schema
 */
exports.tenantListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.array(exports.tenantResponseSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
/**
 * Tenant Query Parameters Schema
 */
exports.tenantQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    landlordId: base_1.commonFields.cuid.optional(),
    propertyId: base_1.commonFields.cuid.optional(),
    approvalStatus: exports.approvalStatusSchema.optional(),
    hasAccess: zod_1.z.string().transform(val => val === 'true').pipe(zod_1.z.boolean()).optional(),
    search: zod_1.z.string().max(100).optional(), // Search by name or email
});
/**
 * Tenant Approval Schema
 */
exports.tenantApprovalSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
    approvedBy: zod_1.z.string().optional(),
});
/**
 * Tenant Rejection Schema
 */
exports.tenantRejectionSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1, 'Rejection reason is required'),
});
