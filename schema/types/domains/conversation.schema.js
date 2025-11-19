"use strict";
/**
 * Conversation/Message Domain Schemas
 *
 * Single Source of Truth for Conversation and Message domain validation and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationSendMessageSchema = exports.conversationListResponseSchema = exports.conversationResponseSchema = exports.messageResponseSchema = exports.conversationQuerySchema = exports.conversationUpdateSchema = exports.conversationCreateSchema = exports.messageCreateSchema = exports.messageAttachmentSchema = exports.conversationStatusSchema = exports.conversationTypeSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
/**
 * Conversation Type Enum
 */
exports.conversationTypeSchema = zod_1.z.enum(['LANDLORD_PMC', 'PMC_TENANT', 'LANDLORD_TENANT']);
/**
 * Conversation Status Enum
 */
exports.conversationStatusSchema = zod_1.z.enum(['ACTIVE', 'CLOSED', 'ARCHIVED']);
/**
 * Message Attachment Schema
 */
exports.messageAttachmentSchema = zod_1.z.object({
    id: base_1.commonFields.cuid.optional(),
    fileName: zod_1.z.string().min(1),
    originalName: zod_1.z.string().min(1),
    fileType: zod_1.z.string().min(1),
    fileSize: zod_1.z.number().int().positive(),
    storagePath: zod_1.z.string().min(1),
    mimeType: zod_1.z.string().optional(),
});
/**
 * Message Create Schema
 */
exports.messageCreateSchema = zod_1.z.object({
    conversationId: base_1.commonFields.cuid,
    messageText: zod_1.z.string().min(1, "Message text is required").max(10000),
    attachments: zod_1.z.array(exports.messageAttachmentSchema).optional().default([]),
});
/**
 * Conversation Create Schema
 */
exports.conversationCreateSchema = zod_1.z.object({
    subject: zod_1.z.string().min(1, "Subject is required").max(200),
    conversationType: exports.conversationTypeSchema,
    propertyId: base_1.commonFields.cuid.optional(),
    landlordId: base_1.commonFields.cuid.optional(),
    tenantId: base_1.commonFields.cuid.optional(),
    pmcId: base_1.commonFields.cuid.optional(),
    initialMessage: zod_1.z.string().min(1).max(10000).optional(),
});
/**
 * Conversation Update Schema
 */
exports.conversationUpdateSchema = zod_1.z.object({
    status: exports.conversationStatusSchema.optional(),
    subject: zod_1.z.string().min(1).max(200).optional(),
});
/**
 * Conversation Query Schema
 */
exports.conversationQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    status: exports.conversationStatusSchema.optional(),
    propertyId: base_1.commonFields.cuid.optional(),
    conversationType: exports.conversationTypeSchema.optional(),
});
/**
 * Message Response Schema
 */
exports.messageResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    conversationId: base_1.commonFields.cuid,
    senderId: zod_1.z.string(),
    senderLandlordId: zod_1.z.string().nullable(),
    senderTenantId: zod_1.z.string().nullable(),
    senderPMCId: zod_1.z.string().nullable(),
    senderRole: zod_1.z.enum(['landlord', 'tenant', 'pmc']),
    messageText: zod_1.z.string(),
    readByLandlord: zod_1.z.boolean(),
    readByTenant: zod_1.z.boolean(),
    readByPMC: zod_1.z.boolean(),
    readAt: zod_1.z.date().nullable(),
    createdAt: zod_1.z.date(),
    attachments: zod_1.z.array(exports.messageAttachmentSchema).optional(),
});
/**
 * Conversation Response Schema
 */
exports.conversationResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    subject: zod_1.z.string(),
    conversationType: exports.conversationTypeSchema,
    status: exports.conversationStatusSchema,
    propertyId: base_1.commonFields.cuid.nullable(),
    landlordId: base_1.commonFields.cuid.nullable(),
    tenantId: base_1.commonFields.cuid.nullable(),
    pmcId: base_1.commonFields.cuid.nullable(),
    lastMessageAt: zod_1.z.date().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    property: zod_1.z.object({
        id: base_1.commonFields.cuid,
        propertyName: zod_1.z.string().nullable(),
        addressLine1: zod_1.z.string(),
        city: zod_1.z.string(),
    }).nullable().optional(),
    landlord: zod_1.z.object({
        id: base_1.commonFields.cuid,
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        email: zod_1.z.string().email(),
    }).nullable().optional(),
    tenant: zod_1.z.object({
        id: base_1.commonFields.cuid,
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        email: zod_1.z.string().email(),
    }).nullable().optional(),
    pmc: zod_1.z.object({
        id: base_1.commonFields.cuid,
        companyName: zod_1.z.string(),
        email: zod_1.z.string().email(),
    }).nullable().optional(),
    messages: zod_1.z.array(exports.messageResponseSchema).optional(),
});
/**
 * Conversation List Response Schema
 */
exports.conversationListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.array(exports.conversationResponseSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
/**
 * Conversation Send Message Schema (supports both 'message' and 'messageText' for compatibility)
 */
exports.conversationSendMessageSchema = zod_1.z.object({
    message: zod_1.z.string().min(1, 'Message is required').optional(),
    messageText: zod_1.z.string().min(1, 'Message is required').optional(),
}).refine(data => data.message || data.messageText, {
    message: 'Either message or messageText is required',
});
