/**
 * Application Domain Schemas
 * 
 * Single Source of Truth for Application domain validation and types
 */

import { z } from 'zod';
import { commonFields } from '../base';

/**
 * Application Status Enum
 */
export const applicationStatusSchema = z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn']);

/**
 * Application Create Schema
 */
export const applicationCreateSchema = z.object({
  unitId: commonFields.cuid,
  applicantEmail: z.string().email("Valid email is required"),
  applicantName: z.string().min(1, "Applicant name is required"),
  applicantPhone: z.string().optional(),
  coApplicantIds: z.array(commonFields.cuid).optional().default([]),
});

/**
 * Application Update Schema
 */
export const applicationUpdateSchema = z.object({
  status: applicationStatusSchema.optional(),
  screeningRequested: z.boolean().optional(),
  screeningProvider: z.string().optional(),
  screeningStatus: z.enum(['pending', 'completed', 'failed']).optional(),
  approvedAt: commonFields.dateString.optional(),
  approvedBy: commonFields.cuid.optional(),
  approvedByType: z.string().optional(),
  approvedByEmail: z.string().email().optional(),
  approvedByName: z.string().optional(),
  rejectedAt: commonFields.dateString.optional(),
  rejectedBy: commonFields.cuid.optional(),
  rejectedByType: z.string().optional(),
  rejectedByEmail: z.string().email().optional(),
  rejectedByName: z.string().optional(),
  rejectionReason: z.string().max(1000).optional(),
});

/**
 * Application Query Schema
 */
export const applicationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  unitId: commonFields.cuid.optional(),
  propertyId: commonFields.cuid.optional(),
  status: applicationStatusSchema.optional(),
  applicantEmail: z.string().email().optional(),
});

/**
 * Application Response Schema
 */
export const applicationResponseSchema = z.object({
  id: commonFields.cuid,
  unitId: commonFields.cuid,
  propertyId: commonFields.cuid,
  applicantId: z.string().nullable(),
  applicantEmail: z.string().email(),
  applicantName: z.string(),
  applicantPhone: z.string().nullable(),
  coApplicantIds: z.array(z.string()),
  status: applicationStatusSchema,
  deadline: z.date(),
  screeningRequested: z.boolean(),
  screeningRequestedAt: z.date().nullable(),
  screeningProvider: z.string().nullable(),
  screeningStatus: z.string().nullable(),
  screeningData: z.any().nullable(),
  approvedAt: z.date().nullable(),
  approvedBy: z.string().nullable(),
  approvedByType: z.string().nullable(),
  approvedByEmail: z.string().nullable(),
  approvedByName: z.string().nullable(),
  rejectedAt: z.date().nullable(),
  rejectedBy: z.string().nullable(),
  rejectedByType: z.string().nullable(),
  rejectedByEmail: z.string().nullable(),
  rejectedByName: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  unit: z.object({
    id: commonFields.cuid,
    unitName: z.string(),
  }).optional(),
  property: z.object({
    id: commonFields.cuid,
    propertyName: z.string().nullable(),
  }).optional(),
  lease: z.object({
    id: commonFields.cuid,
    status: z.string(),
  }).nullable().optional(),
});

/**
 * Application List Response Schema
 */
export const applicationListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(applicationResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Application Approval Schema
 */
export const applicationApprovalSchema = z.object({
  notes: z.string().optional(),
  approvedBy: z.string().optional(),
}).optional();

/**
 * Application Rejection Schema
 */
export const applicationRejectionSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

// Export types
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
export type ApplicationCreate = z.infer<typeof applicationCreateSchema>;
export type ApplicationUpdate = z.infer<typeof applicationUpdateSchema>;
export type ApplicationQuery = z.infer<typeof applicationQuerySchema>;
export type ApplicationResponse = z.infer<typeof applicationResponseSchema>;
export type ApplicationListResponse = z.infer<typeof applicationListResponseSchema>;
export type ApplicationApproval = z.infer<typeof applicationApprovalSchema>;
export type ApplicationRejection = z.infer<typeof applicationRejectionSchema>;

