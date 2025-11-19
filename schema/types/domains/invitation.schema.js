"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitationListResponseSchema = exports.invitationResponseSchema = exports.invitationQuerySchema = exports.invitationUpdateSchema = exports.invitationCreateSchema = exports.invitationMetadataSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
// Invitation metadata schema (flexible object for prefill data)
exports.invitationMetadataSchema = zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional();
// Base Invitation Schema
const baseInvitationSchema = zod_1.z.object({
    email: base_1.emailSchema,
    type: zod_1.z.enum(['landlord', 'tenant', 'vendor', 'contractor', 'pmc']),
    propertyId: base_1.optionalString,
    unitId: base_1.optionalString,
    expiresInDays: zod_1.z.number().int().min(1).max(365).optional().default(14),
    metadata: exports.invitationMetadataSchema,
});
// Schema for creating an invitation
exports.invitationCreateSchema = baseInvitationSchema;
// Schema for updating an invitation (for resend, cancel, etc.)
exports.invitationUpdateSchema = zod_1.z.object({
    id: base_1.cuidSchema,
    status: zod_1.z.enum(['pending', 'sent', 'opened', 'completed', 'expired', 'cancelled']).optional(),
    resend: zod_1.z.boolean().optional(), // Flag to resend invitation
}).partial();
// Schema for querying invitations
exports.invitationQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).optional().default(1),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(1000)).optional().default(20),
    type: zod_1.z.enum(['landlord', 'tenant', 'vendor', 'contractor', 'pmc']).optional(),
    status: zod_1.z.enum(['pending', 'sent', 'opened', 'completed', 'expired', 'cancelled']).optional(),
    email: base_1.optionalString, // Search by email
}).partial();
// Schema for a single invitation response
exports.invitationResponseSchema = baseInvitationSchema.extend({
    id: base_1.cuidSchema,
    token: zod_1.z.string(),
    status: zod_1.z.enum(['pending', 'sent', 'opened', 'completed', 'expired', 'cancelled']),
    expiresAt: zod_1.z.string().datetime().nullable(),
    openedAt: zod_1.z.string().datetime().nullable(),
    completedAt: zod_1.z.string().datetime().nullable(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    invitedBy: base_1.cuidSchema,
    invitedByRole: zod_1.z.string(),
    invitedByName: base_1.optionalString,
    invitedByEmail: base_1.optionalString,
    invitedByAdminId: base_1.optionalString,
    invitedByLandlordId: base_1.optionalString,
    invitedByPMCId: base_1.optionalString,
    landlordId: base_1.optionalString,
    tenantId: base_1.optionalString,
    pmcId: base_1.optionalString,
    approvalStatus: base_1.optionalString, // For completed invitations
});
// Schema for a list of invitations response
exports.invitationListResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.object({
        invitations: zod_1.z.array(exports.invitationResponseSchema),
        pagination: zod_1.z.object({
            page: zod_1.z.number().int().min(1),
            limit: zod_1.z.number().int().min(1),
            total: zod_1.z.number().int().min(0),
            totalPages: zod_1.z.number().int().min(0),
        }),
    }),
});
