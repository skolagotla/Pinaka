"use strict";
/**
 * Application Domain Schemas
 *
 * Single Source of Truth for Application domain validation and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationRejectionSchema = exports.applicationApprovalSchema = exports.applicationListResponseSchema = exports.applicationResponseSchema = exports.applicationQuerySchema = exports.applicationUpdateSchema = exports.applicationCreateSchema = exports.applicationStatusSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
/**
 * Application Status Enum
 */
exports.applicationStatusSchema = zod_1.z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn']);
/**
 * Application Create Schema
 */
exports.applicationCreateSchema = zod_1.z.object({
    unitId: base_1.commonFields.cuid,
    applicantEmail: zod_1.z.string().email("Valid email is required"),
    applicantName: zod_1.z.string().min(1, "Applicant name is required"),
    applicantPhone: zod_1.z.string().optional(),
    coApplicantIds: zod_1.z.array(base_1.commonFields.cuid).optional().default([]),
});
/**
 * Application Update Schema
 */
exports.applicationUpdateSchema = zod_1.z.object({
    status: exports.applicationStatusSchema.optional(),
    screeningRequested: zod_1.z.boolean().optional(),
    screeningProvider: zod_1.z.string().optional(),
    screeningStatus: zod_1.z.enum(['pending', 'completed', 'failed']).optional(),
    approvedAt: base_1.commonFields.dateString.optional(),
    approvedBy: base_1.commonFields.cuid.optional(),
    approvedByType: zod_1.z.string().optional(),
    approvedByEmail: zod_1.z.string().email().optional(),
    approvedByName: zod_1.z.string().optional(),
    rejectedAt: base_1.commonFields.dateString.optional(),
    rejectedBy: base_1.commonFields.cuid.optional(),
    rejectedByType: zod_1.z.string().optional(),
    rejectedByEmail: zod_1.z.string().email().optional(),
    rejectedByName: zod_1.z.string().optional(),
    rejectionReason: zod_1.z.string().max(1000).optional(),
});
/**
 * Application Query Schema
 */
exports.applicationQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    unitId: base_1.commonFields.cuid.optional(),
    propertyId: base_1.commonFields.cuid.optional(),
    status: exports.applicationStatusSchema.optional(),
    applicantEmail: zod_1.z.string().email().optional(),
});
/**
 * Application Response Schema
 */
exports.applicationResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    unitId: base_1.commonFields.cuid,
    propertyId: base_1.commonFields.cuid,
    applicantId: zod_1.z.string().nullable(),
    applicantEmail: zod_1.z.string().email(),
    applicantName: zod_1.z.string(),
    applicantPhone: zod_1.z.string().nullable(),
    coApplicantIds: zod_1.z.array(zod_1.z.string()),
    status: exports.applicationStatusSchema,
    deadline: zod_1.z.date(),
    screeningRequested: zod_1.z.boolean(),
    screeningRequestedAt: zod_1.z.date().nullable(),
    screeningProvider: zod_1.z.string().nullable(),
    screeningStatus: zod_1.z.string().nullable(),
    screeningData: zod_1.z.any().nullable(),
    approvedAt: zod_1.z.date().nullable(),
    approvedBy: zod_1.z.string().nullable(),
    approvedByType: zod_1.z.string().nullable(),
    approvedByEmail: zod_1.z.string().nullable(),
    approvedByName: zod_1.z.string().nullable(),
    rejectedAt: zod_1.z.date().nullable(),
    rejectedBy: zod_1.z.string().nullable(),
    rejectedByType: zod_1.z.string().nullable(),
    rejectedByEmail: zod_1.z.string().nullable(),
    rejectedByName: zod_1.z.string().nullable(),
    rejectionReason: zod_1.z.string().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    unit: zod_1.z.object({
        id: base_1.commonFields.cuid,
        unitName: zod_1.z.string(),
    }).optional(),
    property: zod_1.z.object({
        id: base_1.commonFields.cuid,
        propertyName: zod_1.z.string().nullable(),
    }).optional(),
    lease: zod_1.z.object({
        id: base_1.commonFields.cuid,
        status: zod_1.z.string(),
    }).nullable().optional(),
});
/**
 * Application List Response Schema
 */
exports.applicationListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.array(exports.applicationResponseSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
/**
 * Application Approval Schema
 */
exports.applicationApprovalSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
    approvedBy: zod_1.z.string().optional(),
}).optional();
/**
 * Application Rejection Schema
 */
exports.applicationRejectionSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1, 'Rejection reason is required'),
});
