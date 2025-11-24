"use strict";
/**
 * Maintenance Request Domain Schemas
 *
 * Single Source of Truth for Maintenance Request domain validation and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceApprovalSchema = exports.maintenanceMarkViewedSchema = exports.maintenanceCommentAddSchema = exports.maintenanceRequestListResponseSchema = exports.maintenanceRequestResponseSchema = exports.maintenanceCommentSchema = exports.maintenanceRequestQuerySchema = exports.maintenanceRequestUpdateSchema = exports.maintenanceRequestCreateSchema = exports.maintenanceCategorySchema = exports.maintenanceStatusSchema = exports.maintenancePrioritySchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
/**
 * Maintenance Priority Enum
 */
exports.maintenancePrioritySchema = zod_1.z.enum(['Low', 'Medium', 'High', 'Urgent']);
/**
 * Maintenance Status Enum
 */
exports.maintenanceStatusSchema = zod_1.z.enum([
    'New',
    'Pending',
    'In Progress',
    'Completed',
    'Cancelled',
    'On Hold',
]);
/**
 * Maintenance Category Schema
 */
exports.maintenanceCategorySchema = zod_1.z.string().min(1, "Category is required");
/**
 * Maintenance Request Create Schema
 */
exports.maintenanceRequestCreateSchema = zod_1.z.object({
    propertyId: base_1.commonFields.cuid,
    tenantId: base_1.commonFields.cuid,
    title: zod_1.z.string().min(1, "Title is required").max(200),
    description: zod_1.z.string().min(1, "Description is required").max(5000),
    category: exports.maintenanceCategorySchema,
    priority: exports.maintenancePrioritySchema.default('Medium'),
    status: exports.maintenanceStatusSchema.default('New'),
    requestedDate: base_1.commonFields.dateString.optional(),
    scheduledDate: base_1.commonFields.dateString.optional(),
    estimatedCost: zod_1.z.number().min(0).optional(),
    initiatedBy: zod_1.z.enum(['tenant', 'landlord', 'pmc']).default('tenant'),
    // Photos (JSON array of URLs or base64)
    photos: zod_1.z.array(zod_1.z.string()).optional(),
    beforePhotos: zod_1.z.array(zod_1.z.string()).optional(),
    afterPhotos: zod_1.z.array(zod_1.z.string()).optional(),
    // Vendor assignment
    assignedToProviderId: base_1.commonFields.cuid.optional(),
    assignedToVendorId: zod_1.z.string().optional(), // Legacy field
});
/**
 * Maintenance Request Update Schema
 */
exports.maintenanceRequestUpdateSchema = exports.maintenanceRequestCreateSchema.partial().extend({
    propertyId: base_1.commonFields.cuid.optional(), // Can't change property
    tenantId: base_1.commonFields.cuid.optional(), // Can't change tenant
    completedDate: base_1.commonFields.dateString.optional(),
    actualCost: zod_1.z.number().min(0).optional(),
    tenantApproved: zod_1.z.boolean().optional(),
    landlordApproved: zod_1.z.boolean().optional(),
    completionNotes: zod_1.z.string().max(5000).optional(),
    tenantFeedback: zod_1.z.string().max(5000).optional(),
    rating: zod_1.z.number().int().min(1).max(5).optional(),
});
/**
 * Maintenance Request Query Schema
 */
exports.maintenanceRequestQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    propertyId: base_1.commonFields.cuid.optional(),
    tenantId: base_1.commonFields.cuid.optional(),
    status: exports.maintenanceStatusSchema.optional(),
    priority: exports.maintenancePrioritySchema.optional(),
    category: zod_1.z.string().optional(),
    landlordId: base_1.commonFields.cuid.optional(),
    assignedToProviderId: base_1.commonFields.cuid.optional(),
    requestedDateFrom: base_1.commonFields.dateString.optional(),
    requestedDateTo: base_1.commonFields.dateString.optional(),
});
/**
 * Maintenance Comment Schema
 */
exports.maintenanceCommentSchema = zod_1.z.object({
    id: base_1.commonFields.cuid.optional(),
    comment: zod_1.z.string().min(1).max(5000),
    authorEmail: zod_1.z.string().email(),
    authorName: zod_1.z.string().min(1),
    authorRole: zod_1.z.enum(['tenant', 'landlord', 'pmc', 'vendor']),
    isStatusUpdate: zod_1.z.boolean().default(false),
    oldStatus: zod_1.z.string().optional(),
    newStatus: zod_1.z.string().optional(),
    createdAt: zod_1.z.date().optional(),
});
/**
 * Maintenance Request Response Schema
 */
exports.maintenanceRequestResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    propertyId: base_1.commonFields.cuid,
    tenantId: base_1.commonFields.cuid,
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    category: zod_1.z.string(),
    priority: exports.maintenancePrioritySchema,
    status: exports.maintenanceStatusSchema,
    requestedDate: zod_1.z.date(),
    completedDate: zod_1.z.date().nullable(),
    tenantApproved: zod_1.z.boolean(),
    landlordApproved: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    ticketNumber: zod_1.z.string().nullable(),
    initiatedBy: zod_1.z.string(),
    actualCost: zod_1.z.number().nullable(),
    estimatedCost: zod_1.z.number().nullable(),
    scheduledDate: zod_1.z.date().nullable(),
    rating: zod_1.z.number().int().nullable(),
    tenantFeedback: zod_1.z.string().nullable(),
    completionNotes: zod_1.z.string().nullable(),
    assignedToVendorId: zod_1.z.string().nullable(),
    assignedToProviderId: base_1.commonFields.cuid.nullable(),
    photos: zod_1.z.any().nullable(), // JSON
    beforePhotos: zod_1.z.any().nullable(), // JSON
    afterPhotos: zod_1.z.any().nullable(), // JSON
    // Relations
    tenant: zod_1.z.object({
        id: base_1.commonFields.cuid,
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().nullable(),
    }).optional(),
    property: zod_1.z.object({
        id: base_1.commonFields.cuid,
        propertyName: zod_1.z.string().nullable(),
        addressLine1: zod_1.z.string(),
        city: zod_1.z.string(),
        provinceState: zod_1.z.string().nullable(),
    }).optional(),
    assignedToProvider: zod_1.z.object({
        id: base_1.commonFields.cuid,
        name: zod_1.z.string(),
        email: zod_1.z.string().nullable(),
        phone: zod_1.z.string().nullable(),
        type: zod_1.z.string(),
    }).nullable().optional(),
    comments: zod_1.z.array(exports.maintenanceCommentSchema).optional(),
});
/**
 * Maintenance Request List Response Schema
 */
exports.maintenanceRequestListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.array(exports.maintenanceRequestResponseSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
/**
 * Maintenance Comment Add Schema
 */
exports.maintenanceCommentAddSchema = zod_1.z.object({
    comment: zod_1.z.string().min(1, 'Comment is required'),
    authorInfo: zod_1.z.object({
        authorEmail: zod_1.z.string().email().optional(),
        authorName: zod_1.z.string().optional(),
        authorRole: zod_1.z.enum(['landlord', 'tenant', 'pmc', 'vendor']).optional(),
    }).optional(),
});
/**
 * Maintenance Mark Viewed Schema
 */
exports.maintenanceMarkViewedSchema = zod_1.z.object({
    role: zod_1.z.enum(['landlord', 'tenant', 'pmc']),
});
/**
 * Maintenance Approval Schema
 */
exports.maintenanceApprovalSchema = zod_1.z.object({
    approvedAmount: zod_1.z.number().optional(),
    notes: zod_1.z.string().optional(),
}).optional();
