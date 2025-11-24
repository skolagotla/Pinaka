"use strict";
/**
 * Inspection Domain Schemas
 *
 * Single Source of Truth for Inspection domain validation and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectionListResponseSchema = exports.inspectionResponseSchema = exports.inspectionQuerySchema = exports.inspectionUpdateSchema = exports.inspectionCreateSchema = exports.inspectionChecklistListResponseSchema = exports.inspectionChecklistResponseSchema = exports.inspectionChecklistQuerySchema = exports.inspectionChecklistUpdateSchema = exports.inspectionChecklistCreateSchema = exports.inspectionChecklistItemSchema = exports.inspectionStatusSchema = exports.inspectionChecklistTypeSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
/**
 * Inspection Checklist Type Enum
 */
exports.inspectionChecklistTypeSchema = zod_1.z.enum(['move-in', 'move-out']);
/**
 * Inspection Status Enum
 */
exports.inspectionStatusSchema = zod_1.z.enum(['pending', 'submitted', 'approved', 'rejected']);
/**
 * Inspection Checklist Item Schema
 */
exports.inspectionChecklistItemSchema = zod_1.z.object({
    id: base_1.commonFields.cuid.optional(),
    itemId: zod_1.z.string().min(1),
    itemLabel: zod_1.z.string().min(1),
    category: zod_1.z.string().min(1),
    isChecked: zod_1.z.boolean().default(false),
    notes: zod_1.z.string().max(1000).optional(),
    photos: zod_1.z.array(zod_1.z.object({
        url: zod_1.z.string().url(),
        comment: zod_1.z.string().optional(),
    })).optional(),
    landlordNotes: zod_1.z.string().max(1000).optional(),
    landlordApproval: zod_1.z.enum(['approved', 'rejected']).optional(),
    landlordApprovedAt: zod_1.z.date().optional(),
});
/**
 * Inspection Checklist Create Schema
 */
exports.inspectionChecklistCreateSchema = zod_1.z.object({
    tenantId: base_1.commonFields.cuid,
    propertyId: base_1.commonFields.cuid.optional(),
    unitId: base_1.commonFields.cuid.optional(),
    leaseId: base_1.commonFields.cuid.optional(),
    checklistType: exports.inspectionChecklistTypeSchema,
    inspectionDate: base_1.commonFields.dateString.optional(),
    isRequest: zod_1.z.boolean().default(false), // For tenant requests
});
/**
 * Inspection Checklist Update Schema
 */
exports.inspectionChecklistUpdateSchema = zod_1.z.object({
    status: exports.inspectionStatusSchema.optional(),
    inspectionDate: base_1.commonFields.dateString.optional(),
    submittedAt: base_1.commonFields.dateString.optional(),
    approvedAt: base_1.commonFields.dateString.optional(),
    approvedBy: base_1.commonFields.cuid.optional(),
    approvedByName: zod_1.z.string().optional(),
    rejectionReason: zod_1.z.string().max(1000).optional(),
    rejectedAt: base_1.commonFields.dateString.optional(),
    rejectedBy: base_1.commonFields.cuid.optional(),
    rejectedByName: zod_1.z.string().optional(),
    items: zod_1.z.array(exports.inspectionChecklistItemSchema).optional(),
});
/**
 * Inspection Checklist Query Schema
 */
exports.inspectionChecklistQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    propertyId: base_1.commonFields.cuid.optional(),
    unitId: base_1.commonFields.cuid.optional(),
    tenantId: base_1.commonFields.cuid.optional(),
    leaseId: base_1.commonFields.cuid.optional(),
    checklistType: exports.inspectionChecklistTypeSchema.optional(),
    status: exports.inspectionStatusSchema.optional(),
});
/**
 * Inspection Checklist Response Schema
 */
exports.inspectionChecklistResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    tenantId: base_1.commonFields.cuid,
    propertyId: base_1.commonFields.cuid.nullable(),
    unitId: base_1.commonFields.cuid.nullable(),
    leaseId: base_1.commonFields.cuid.nullable(),
    checklistType: exports.inspectionChecklistTypeSchema,
    inspectionDate: zod_1.z.date().nullable(),
    status: exports.inspectionStatusSchema,
    submittedAt: zod_1.z.date().nullable(),
    approvedAt: zod_1.z.date().nullable(),
    approvedBy: zod_1.z.string().nullable(),
    approvedByName: zod_1.z.string().nullable(),
    rejectionReason: zod_1.z.string().nullable(),
    rejectedAt: zod_1.z.date().nullable(),
    rejectedBy: zod_1.z.string().nullable(),
    rejectedByName: zod_1.z.string().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    tenant: zod_1.z.object({
        id: base_1.commonFields.cuid,
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        email: zod_1.z.string().email(),
    }).optional(),
    items: zod_1.z.array(exports.inspectionChecklistItemSchema).optional(),
});
/**
 * Inspection Checklist List Response Schema
 */
exports.inspectionChecklistListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.array(exports.inspectionChecklistResponseSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
// Aliases for backward compatibility
exports.inspectionCreateSchema = exports.inspectionChecklistCreateSchema;
exports.inspectionUpdateSchema = exports.inspectionChecklistUpdateSchema;
exports.inspectionQuerySchema = exports.inspectionChecklistQuerySchema;
exports.inspectionResponseSchema = exports.inspectionChecklistResponseSchema;
exports.inspectionListResponseSchema = exports.inspectionChecklistListResponseSchema;
