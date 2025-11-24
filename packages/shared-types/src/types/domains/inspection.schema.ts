/**
 * Inspection Domain Schemas
 * 
 * Single Source of Truth for Inspection domain validation and types
 */

import { z } from 'zod';
import { commonFields } from '../base';

/**
 * Inspection Checklist Type Enum
 */
export const inspectionChecklistTypeSchema = z.enum(['move-in', 'move-out']);

/**
 * Inspection Status Enum
 */
export const inspectionStatusSchema = z.enum(['pending', 'submitted', 'approved', 'rejected']);

/**
 * Inspection Checklist Item Schema
 */
export const inspectionChecklistItemSchema = z.object({
  id: commonFields.cuid.optional(),
  itemId: z.string().min(1),
  itemLabel: z.string().min(1),
  category: z.string().min(1),
  isChecked: z.boolean().default(false),
  notes: z.string().max(1000).optional(),
  photos: z.array(z.object({
    url: z.string().url(),
    comment: z.string().optional(),
  })).optional(),
  landlordNotes: z.string().max(1000).optional(),
  landlordApproval: z.enum(['approved', 'rejected']).optional(),
  landlordApprovedAt: z.date().optional(),
});

/**
 * Inspection Checklist Create Schema
 */
export const inspectionChecklistCreateSchema = z.object({
  tenantId: commonFields.cuid,
  propertyId: commonFields.cuid.optional(),
  unitId: commonFields.cuid.optional(),
  leaseId: commonFields.cuid.optional(),
  checklistType: inspectionChecklistTypeSchema,
  inspectionDate: commonFields.dateString.optional(),
  isRequest: z.boolean().default(false), // For tenant requests
});

/**
 * Inspection Checklist Update Schema
 */
export const inspectionChecklistUpdateSchema = z.object({
  status: inspectionStatusSchema.optional(),
  inspectionDate: commonFields.dateString.optional(),
  submittedAt: commonFields.dateString.optional(),
  approvedAt: commonFields.dateString.optional(),
  approvedBy: commonFields.cuid.optional(),
  approvedByName: z.string().optional(),
  rejectionReason: z.string().max(1000).optional(),
  rejectedAt: commonFields.dateString.optional(),
  rejectedBy: commonFields.cuid.optional(),
  rejectedByName: z.string().optional(),
  items: z.array(inspectionChecklistItemSchema).optional(),
});

/**
 * Inspection Checklist Query Schema
 */
export const inspectionChecklistQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  propertyId: commonFields.cuid.optional(),
  unitId: commonFields.cuid.optional(),
  tenantId: commonFields.cuid.optional(),
  leaseId: commonFields.cuid.optional(),
  checklistType: inspectionChecklistTypeSchema.optional(),
  status: inspectionStatusSchema.optional(),
});

/**
 * Inspection Checklist Response Schema
 */
export const inspectionChecklistResponseSchema = z.object({
  id: commonFields.cuid,
  tenantId: commonFields.cuid,
  propertyId: commonFields.cuid.nullable(),
  unitId: commonFields.cuid.nullable(),
  leaseId: commonFields.cuid.nullable(),
  checklistType: inspectionChecklistTypeSchema,
  inspectionDate: z.date().nullable(),
  status: inspectionStatusSchema,
  submittedAt: z.date().nullable(),
  approvedAt: z.date().nullable(),
  approvedBy: z.string().nullable(),
  approvedByName: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  rejectedAt: z.date().nullable(),
  rejectedBy: z.string().nullable(),
  rejectedByName: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenant: z.object({
    id: commonFields.cuid,
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
  }).optional(),
  items: z.array(inspectionChecklistItemSchema).optional(),
});

/**
 * Inspection Checklist List Response Schema
 */
export const inspectionChecklistListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(inspectionChecklistResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Export types
export type InspectionChecklistType = z.infer<typeof inspectionChecklistTypeSchema>;
export type InspectionStatus = z.infer<typeof inspectionStatusSchema>;
export type InspectionChecklistItem = z.infer<typeof inspectionChecklistItemSchema>;
export type InspectionChecklistCreate = z.infer<typeof inspectionChecklistCreateSchema>;
export type InspectionChecklistUpdate = z.infer<typeof inspectionChecklistUpdateSchema>;
export type InspectionChecklistQuery = z.infer<typeof inspectionChecklistQuerySchema>;
export type InspectionChecklistResponse = z.infer<typeof inspectionChecklistResponseSchema>;
export type InspectionChecklistListResponse = z.infer<typeof inspectionChecklistListResponseSchema>;

// Aliases for backward compatibility
export const inspectionCreateSchema = inspectionChecklistCreateSchema;
export const inspectionUpdateSchema = inspectionChecklistUpdateSchema;
export const inspectionQuerySchema = inspectionChecklistQuerySchema;
export const inspectionResponseSchema = inspectionChecklistResponseSchema;
export const inspectionListResponseSchema = inspectionChecklistListResponseSchema;
export type InspectionCreate = InspectionChecklistCreate;
export type InspectionUpdate = InspectionChecklistUpdate;
export type InspectionQuery = InspectionChecklistQuery;
export type InspectionResponse = InspectionChecklistResponse;
export type InspectionListResponse = InspectionChecklistListResponse;

