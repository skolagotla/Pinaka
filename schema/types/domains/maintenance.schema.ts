/**
 * Maintenance Request Domain Schemas
 * 
 * Single Source of Truth for Maintenance Request domain validation and types
 */

import { z } from 'zod';
import { commonFields } from '../base';

/**
 * Maintenance Priority Enum
 */
export const maintenancePrioritySchema = z.enum(['Low', 'Medium', 'High', 'Urgent']);

/**
 * Maintenance Status Enum
 */
export const maintenanceStatusSchema = z.enum([
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
export const maintenanceCategorySchema = z.string().min(1, "Category is required");

/**
 * Maintenance Request Create Schema
 */
export const maintenanceRequestCreateSchema = z.object({
  propertyId: commonFields.cuid,
  tenantId: commonFields.cuid,
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(5000),
  category: maintenanceCategorySchema,
  priority: maintenancePrioritySchema.default('Medium'),
  status: maintenanceStatusSchema.default('New'),
  requestedDate: commonFields.dateString.optional(),
  scheduledDate: commonFields.dateString.optional(),
  estimatedCost: z.number().min(0).optional(),
  initiatedBy: z.enum(['tenant', 'landlord', 'pmc']).default('tenant'),
  // Photos (JSON array of URLs or base64)
  photos: z.array(z.string()).optional(),
  beforePhotos: z.array(z.string()).optional(),
  afterPhotos: z.array(z.string()).optional(),
  // Vendor assignment
  assignedToProviderId: commonFields.cuid.optional(),
  assignedToVendorId: z.string().optional(), // Legacy field
});

/**
 * Maintenance Request Update Schema
 */
export const maintenanceRequestUpdateSchema = maintenanceRequestCreateSchema.partial().extend({
  propertyId: commonFields.cuid.optional(), // Can't change property
  tenantId: commonFields.cuid.optional(), // Can't change tenant
  completedDate: commonFields.dateString.optional(),
  actualCost: z.number().min(0).optional(),
  tenantApproved: z.boolean().optional(),
  landlordApproved: z.boolean().optional(),
  completionNotes: z.string().max(5000).optional(),
  tenantFeedback: z.string().max(5000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

/**
 * Maintenance Request Query Schema
 */
export const maintenanceRequestQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  propertyId: commonFields.cuid.optional(),
  tenantId: commonFields.cuid.optional(),
  status: maintenanceStatusSchema.optional(),
  priority: maintenancePrioritySchema.optional(),
  category: z.string().optional(),
  landlordId: commonFields.cuid.optional(),
  assignedToProviderId: commonFields.cuid.optional(),
  requestedDateFrom: commonFields.dateString.optional(),
  requestedDateTo: commonFields.dateString.optional(),
});

/**
 * Maintenance Comment Schema
 */
export const maintenanceCommentSchema = z.object({
  id: commonFields.cuid.optional(),
  comment: z.string().min(1).max(5000),
  authorEmail: z.string().email(),
  authorName: z.string().min(1),
  authorRole: z.enum(['tenant', 'landlord', 'pmc', 'vendor']),
  isStatusUpdate: z.boolean().default(false),
  oldStatus: z.string().optional(),
  newStatus: z.string().optional(),
  createdAt: z.date().optional(),
});

/**
 * Maintenance Request Response Schema
 */
export const maintenanceRequestResponseSchema = z.object({
  id: commonFields.cuid,
  propertyId: commonFields.cuid,
  tenantId: commonFields.cuid,
  title: z.string(),
  description: z.string(),
  category: z.string(),
  priority: maintenancePrioritySchema,
  status: maintenanceStatusSchema,
  requestedDate: z.date(),
  completedDate: z.date().nullable(),
  tenantApproved: z.boolean(),
  landlordApproved: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  ticketNumber: z.string().nullable(),
  initiatedBy: z.string(),
  actualCost: z.number().nullable(),
  estimatedCost: z.number().nullable(),
  scheduledDate: z.date().nullable(),
  rating: z.number().int().nullable(),
  tenantFeedback: z.string().nullable(),
  completionNotes: z.string().nullable(),
  assignedToVendorId: z.string().nullable(),
  assignedToProviderId: commonFields.cuid.nullable(),
  photos: z.any().nullable(), // JSON
  beforePhotos: z.any().nullable(), // JSON
  afterPhotos: z.any().nullable(), // JSON
  // Relations
  tenant: z.object({
    id: commonFields.cuid,
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().nullable(),
  }).optional(),
  property: z.object({
    id: commonFields.cuid,
    propertyName: z.string().nullable(),
    addressLine1: z.string(),
    city: z.string(),
    provinceState: z.string().nullable(),
  }).optional(),
  assignedToProvider: z.object({
    id: commonFields.cuid,
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    type: z.string(),
  }).nullable().optional(),
  comments: z.array(maintenanceCommentSchema).optional(),
});

/**
 * Maintenance Request List Response Schema
 */
export const maintenanceRequestListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(maintenanceRequestResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Export types
// Note: These types are also available from '@/lib/schemas/generated-types' (auto-generated)
// The generated types use shorter names (MaintenanceCreate vs MaintenanceRequestCreate)
// Both are available for backward compatibility
export type MaintenancePriority = z.infer<typeof maintenancePrioritySchema>;
export type MaintenanceStatus = z.infer<typeof maintenanceStatusSchema>;
export type MaintenanceRequestCreate = z.infer<typeof maintenanceRequestCreateSchema>;
export type MaintenanceRequestUpdate = z.infer<typeof maintenanceRequestUpdateSchema>;
export type MaintenanceRequestQuery = z.infer<typeof maintenanceRequestQuerySchema>;
export type MaintenanceComment = z.infer<typeof maintenanceCommentSchema>;
export type MaintenanceRequestResponse = z.infer<typeof maintenanceRequestResponseSchema>;
export type MaintenanceRequestListResponse = z.infer<typeof maintenanceRequestListResponseSchema>;
// Re-export shorter names for consistency with generated types
export type MaintenanceCreate = MaintenanceRequestCreate;
export type MaintenanceUpdate = MaintenanceRequestUpdate;
export type MaintenanceQuery = MaintenanceRequestQuery;
export type MaintenanceResponse = MaintenanceRequestResponse;
export type MaintenanceListResponse = MaintenanceRequestListResponse;

