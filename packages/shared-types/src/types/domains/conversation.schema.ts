/**
 * Conversation/Message Domain Schemas
 * 
 * Single Source of Truth for Conversation and Message domain validation and types
 */

import { z } from 'zod';
import { commonFields } from '../base';

/**
 * Conversation Type Enum
 */
export const conversationTypeSchema = z.enum(['LANDLORD_PMC', 'PMC_TENANT', 'LANDLORD_TENANT']);

/**
 * Conversation Status Enum
 */
export const conversationStatusSchema = z.enum(['ACTIVE', 'CLOSED', 'ARCHIVED']);

/**
 * Message Attachment Schema
 */
export const messageAttachmentSchema = z.object({
  id: commonFields.cuid.optional(),
  fileName: z.string().min(1),
  originalName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive(),
  storagePath: z.string().min(1),
  mimeType: z.string().optional(),
});

/**
 * Message Create Schema
 */
export const messageCreateSchema = z.object({
  conversationId: commonFields.cuid,
  messageText: z.string().min(1, "Message text is required").max(10000),
  attachments: z.array(messageAttachmentSchema).optional().default([]),
});

/**
 * Conversation Create Schema
 */
export const conversationCreateSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  conversationType: conversationTypeSchema,
  propertyId: commonFields.cuid.optional(),
  landlordId: commonFields.cuid.optional(),
  tenantId: commonFields.cuid.optional(),
  pmcId: commonFields.cuid.optional(),
  initialMessage: z.string().min(1).max(10000).optional(),
});

/**
 * Conversation Update Schema
 */
export const conversationUpdateSchema = z.object({
  status: conversationStatusSchema.optional(),
  subject: z.string().min(1).max(200).optional(),
});

/**
 * Conversation Query Schema
 */
export const conversationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  status: conversationStatusSchema.optional(),
  propertyId: commonFields.cuid.optional(),
  conversationType: conversationTypeSchema.optional(),
});

/**
 * Message Response Schema
 */
export const messageResponseSchema = z.object({
  id: commonFields.cuid,
  conversationId: commonFields.cuid,
  senderId: z.string(),
  senderLandlordId: z.string().nullable(),
  senderTenantId: z.string().nullable(),
  senderPMCId: z.string().nullable(),
  senderRole: z.enum(['landlord', 'tenant', 'pmc']),
  messageText: z.string(),
  readByLandlord: z.boolean(),
  readByTenant: z.boolean(),
  readByPMC: z.boolean(),
  readAt: z.date().nullable(),
  createdAt: z.date(),
  attachments: z.array(messageAttachmentSchema).optional(),
});

/**
 * Conversation Response Schema
 */
export const conversationResponseSchema = z.object({
  id: commonFields.cuid,
  subject: z.string(),
  conversationType: conversationTypeSchema,
  status: conversationStatusSchema,
  propertyId: commonFields.cuid.nullable(),
  landlordId: commonFields.cuid.nullable(),
  tenantId: commonFields.cuid.nullable(),
  pmcId: commonFields.cuid.nullable(),
  lastMessageAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  property: z.object({
    id: commonFields.cuid,
    propertyName: z.string().nullable(),
    addressLine1: z.string(),
    city: z.string(),
  }).nullable().optional(),
  landlord: z.object({
    id: commonFields.cuid,
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
  }).nullable().optional(),
  tenant: z.object({
    id: commonFields.cuid,
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
  }).nullable().optional(),
  pmc: z.object({
    id: commonFields.cuid,
    companyName: z.string(),
    email: z.string().email(),
  }).nullable().optional(),
  messages: z.array(messageResponseSchema).optional(),
});

/**
 * Conversation List Response Schema
 */
export const conversationListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(conversationResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Conversation Send Message Schema (supports both 'message' and 'messageText' for compatibility)
 */
export const conversationSendMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').optional(),
  messageText: z.string().min(1, 'Message is required').optional(),
}).refine(data => data.message || data.messageText, {
  message: 'Either message or messageText is required',
});

// Export types
export type ConversationType = z.infer<typeof conversationTypeSchema>;
export type ConversationStatus = z.infer<typeof conversationStatusSchema>;
export type MessageAttachment = z.infer<typeof messageAttachmentSchema>;
export type MessageCreate = z.infer<typeof messageCreateSchema>;
export type ConversationCreate = z.infer<typeof conversationCreateSchema>;
export type ConversationUpdate = z.infer<typeof conversationUpdateSchema>;
export type ConversationQuery = z.infer<typeof conversationQuerySchema>;
export type MessageResponse = z.infer<typeof messageResponseSchema>;
export type ConversationResponse = z.infer<typeof conversationResponseSchema>;
export type ConversationListResponse = z.infer<typeof conversationListResponseSchema>;
export type ConversationSendMessage = z.infer<typeof conversationSendMessageSchema>;

