/**
 * Document Domain Schemas
 * 
 * Single Source of Truth for Document domain validation and types
 */

import { z } from 'zod';
import { commonFields } from '../base';

/**
 * Document Visibility Enum
 */
export const documentVisibilitySchema = z.enum(['shared', 'tenant-only', 'landlord-only']);

/**
 * Document Create Schema (for API)
 */
export const documentCreateSchema = z.object({
  tenantId: commonFields.cuid,
  propertyId: commonFields.cuid.optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  description: z.string().max(1000).default(""),
  expirationDate: commonFields.dateString.optional(),
  isRequired: z.boolean().default(false),
  visibility: documentVisibilitySchema.default('shared'),
  tags: z.array(z.string()).optional().default([]),
  // File metadata (set by server after upload)
  fileName: z.string().optional(),
  originalName: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  storagePath: z.string().optional(),
});

/**
 * Document Update Schema
 */
export const documentUpdateSchema = z.object({
  category: z.string().min(1).optional(),
  subcategory: z.string().optional(),
  description: z.string().max(1000).optional(),
  expirationDate: commonFields.dateString.optional().nullable(),
  isRequired: z.boolean().optional(),
  visibility: documentVisibilitySchema.optional(),
  tags: z.array(z.string()).optional(),
  isVerified: z.boolean().optional(),
  verificationComment: z.string().max(1000).optional(),
  isRejected: z.boolean().optional(),
  rejectionReason: z.string().max(1000).optional(),
});

/**
 * Document Query Schema
 */
export const documentQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  tenantId: commonFields.cuid.optional(),
  propertyId: commonFields.cuid.optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  isRequired: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  isDeleted: z.boolean().optional().default(false),
  expirationDateFrom: commonFields.dateString.optional(),
  expirationDateTo: commonFields.dateString.optional(),
});

/**
 * Document Response Schema
 */
export const documentResponseSchema = z.object({
  id: commonFields.cuid,
  tenantId: commonFields.cuid,
  propertyId: commonFields.cuid.nullable(),
  fileName: z.string(),
  originalName: z.string(),
  fileType: z.string(),
  fileSize: z.number().int(),
  category: z.string(),
  subcategory: z.string().nullable(),
  description: z.string(),
  storagePath: z.string(),
  uploadedAt: z.date(),
  updatedAt: z.date(),
  canLandlordDelete: z.boolean(),
  canTenantDelete: z.boolean(),
  expirationDate: z.date().nullable(),
  isRequired: z.boolean(),
  isVerified: z.boolean(),
  reminderSent: z.boolean(),
  reminderSentAt: z.date().nullable(),
  visibility: z.string(),
  tags: z.array(z.string()),
  uploadedBy: z.string(),
  uploadedByEmail: z.string(),
  uploadedByName: z.string(),
  verifiedAt: z.date().nullable(),
  verifiedBy: z.string().nullable(),
  verifiedByName: z.string().nullable(),
  verifiedByRole: z.string().nullable(),
  isRejected: z.boolean(),
  rejectedAt: z.date().nullable(),
  rejectedBy: z.string().nullable(),
  rejectedByName: z.string().nullable(),
  rejectedByRole: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  verificationComment: z.string().nullable(),
  documentHash: z.string().nullable(),
  metadata: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.date().nullable(),
  deletedBy: z.string().nullable(),
  deletedByEmail: z.string().nullable(),
  deletedByName: z.string().nullable(),
  deletionReason: z.string().nullable(),
});

/**
 * Document List Response Schema
 */
export const documentListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(documentResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Document Message Schema
 */
export const documentMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

/**
 * Document Approve Deletion Schema
 */
export const documentApproveDeletionSchema = z.object({
  reason: z.string().max(1000).optional().nullable(),
});

/**
 * Document Mutual Approve Schema
 */
export const documentMutualApproveSchema = z.object({
  comment: z.string().max(1000).optional().nullable(),
});

/**
 * Document Promote Version Schema
 */
export const documentPromoteVersionSchema = z.object({
  versionIndex: z.number().int().min(0),
});

// Export types
export type DocumentVisibility = z.infer<typeof documentVisibilitySchema>;
export type DocumentCreate = z.infer<typeof documentCreateSchema>;
export type DocumentUpdate = z.infer<typeof documentUpdateSchema>;
export type DocumentQuery = z.infer<typeof documentQuerySchema>;
export type DocumentResponse = z.infer<typeof documentResponseSchema>;
export type DocumentListResponse = z.infer<typeof documentListResponseSchema>;
export type DocumentMessage = z.infer<typeof documentMessageSchema>;
export type DocumentApproveDeletion = z.infer<typeof documentApproveDeletionSchema>;
export type DocumentMutualApprove = z.infer<typeof documentMutualApproveSchema>;
export type DocumentPromoteVersion = z.infer<typeof documentPromoteVersionSchema>;

