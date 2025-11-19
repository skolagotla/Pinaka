"use strict";
/**
 * Document Domain Schemas
 *
 * Single Source of Truth for Document domain validation and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentPromoteVersionSchema = exports.documentMutualApproveSchema = exports.documentApproveDeletionSchema = exports.documentMessageSchema = exports.documentListResponseSchema = exports.documentResponseSchema = exports.documentQuerySchema = exports.documentUpdateSchema = exports.documentCreateSchema = exports.documentVisibilitySchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
/**
 * Document Visibility Enum
 */
exports.documentVisibilitySchema = zod_1.z.enum(['shared', 'tenant-only', 'landlord-only']);
/**
 * Document Create Schema (for API)
 */
exports.documentCreateSchema = zod_1.z.object({
    tenantId: base_1.commonFields.cuid,
    propertyId: base_1.commonFields.cuid.optional(),
    category: zod_1.z.string().min(1, "Category is required"),
    subcategory: zod_1.z.string().optional(),
    description: zod_1.z.string().max(1000).default(""),
    expirationDate: base_1.commonFields.dateString.optional(),
    isRequired: zod_1.z.boolean().default(false),
    visibility: exports.documentVisibilitySchema.default('shared'),
    tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
    // File metadata (set by server after upload)
    fileName: zod_1.z.string().optional(),
    originalName: zod_1.z.string().optional(),
    fileType: zod_1.z.string().optional(),
    fileSize: zod_1.z.number().int().positive().optional(),
    storagePath: zod_1.z.string().optional(),
});
/**
 * Document Update Schema
 */
exports.documentUpdateSchema = zod_1.z.object({
    category: zod_1.z.string().min(1).optional(),
    subcategory: zod_1.z.string().optional(),
    description: zod_1.z.string().max(1000).optional(),
    expirationDate: base_1.commonFields.dateString.optional().nullable(),
    isRequired: zod_1.z.boolean().optional(),
    visibility: exports.documentVisibilitySchema.optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    isVerified: zod_1.z.boolean().optional(),
    verificationComment: zod_1.z.string().max(1000).optional(),
    isRejected: zod_1.z.boolean().optional(),
    rejectionReason: zod_1.z.string().max(1000).optional(),
    metadata: zod_1.z.string().nullable().optional(), // JSON string for document metadata
});
/**
 * Document Query Schema
 */
exports.documentQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    tenantId: base_1.commonFields.cuid.optional(),
    propertyId: base_1.commonFields.cuid.optional(),
    category: zod_1.z.string().optional(),
    subcategory: zod_1.z.string().optional(),
    isRequired: zod_1.z.boolean().optional(),
    isVerified: zod_1.z.boolean().optional(),
    isDeleted: zod_1.z.boolean().optional().default(false),
    expirationDateFrom: base_1.commonFields.dateString.optional(),
    expirationDateTo: base_1.commonFields.dateString.optional(),
});
/**
 * Document Response Schema
 */
exports.documentResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    tenantId: base_1.commonFields.cuid,
    propertyId: base_1.commonFields.cuid.nullable(),
    fileName: zod_1.z.string(),
    originalName: zod_1.z.string(),
    fileType: zod_1.z.string(),
    fileSize: zod_1.z.number().int(),
    category: zod_1.z.string(),
    subcategory: zod_1.z.string().nullable(),
    description: zod_1.z.string(),
    storagePath: zod_1.z.string(),
    uploadedAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    canLandlordDelete: zod_1.z.boolean(),
    canTenantDelete: zod_1.z.boolean(),
    expirationDate: zod_1.z.date().nullable(),
    isRequired: zod_1.z.boolean(),
    isVerified: zod_1.z.boolean(),
    reminderSent: zod_1.z.boolean(),
    reminderSentAt: zod_1.z.date().nullable(),
    visibility: zod_1.z.string(),
    tags: zod_1.z.array(zod_1.z.string()),
    uploadedBy: zod_1.z.string(),
    uploadedByEmail: zod_1.z.string(),
    uploadedByName: zod_1.z.string(),
    verifiedAt: zod_1.z.date().nullable(),
    verifiedBy: zod_1.z.string().nullable(),
    verifiedByName: zod_1.z.string().nullable(),
    verifiedByRole: zod_1.z.string().nullable(),
    isRejected: zod_1.z.boolean(),
    rejectedAt: zod_1.z.date().nullable(),
    rejectedBy: zod_1.z.string().nullable(),
    rejectedByName: zod_1.z.string().nullable(),
    rejectedByRole: zod_1.z.string().nullable(),
    rejectionReason: zod_1.z.string().nullable(),
    verificationComment: zod_1.z.string().nullable(),
    documentHash: zod_1.z.string().nullable(),
    metadata: zod_1.z.string().nullable(),
    isDeleted: zod_1.z.boolean(),
    deletedAt: zod_1.z.date().nullable(),
    deletedBy: zod_1.z.string().nullable(),
    deletedByEmail: zod_1.z.string().nullable(),
    deletedByName: zod_1.z.string().nullable(),
    deletionReason: zod_1.z.string().nullable(),
});
/**
 * Document List Response Schema
 */
exports.documentListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.array(exports.documentResponseSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
/**
 * Document Message Schema
 */
exports.documentMessageSchema = zod_1.z.object({
    message: zod_1.z.string().min(1, 'Message is required'),
});
/**
 * Document Approve Deletion Schema
 */
exports.documentApproveDeletionSchema = zod_1.z.object({
    reason: zod_1.z.string().max(1000).optional().nullable(),
});
/**
 * Document Mutual Approve Schema
 */
exports.documentMutualApproveSchema = zod_1.z.object({
    comment: zod_1.z.string().max(1000).optional().nullable(),
});
/**
 * Document Promote Version Schema
 */
exports.documentPromoteVersionSchema = zod_1.z.object({
    versionIndex: zod_1.z.number().int().min(0),
});
