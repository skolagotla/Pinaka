import { z } from 'zod';
import { cuidSchema, emailSchema, optionalString, optionalNumber, optionalBoolean } from '../base';

// Invitation metadata schema (flexible object for prefill data)
export const invitationMetadataSchema = z.record(z.string(), z.any()).optional();

// Base Invitation Schema
const baseInvitationSchema = z.object({
  email: emailSchema,
  type: z.enum(['landlord', 'tenant', 'vendor', 'contractor', 'pmc']),
  propertyId: optionalString,
  unitId: optionalString,
  expiresInDays: z.number().int().min(1).max(365).optional().default(14),
  metadata: invitationMetadataSchema,
});

// Schema for creating an invitation
export const invitationCreateSchema = baseInvitationSchema;

// Schema for updating an invitation (for resend, cancel, etc.)
export const invitationUpdateSchema = z.object({
  id: cuidSchema,
  status: z.enum(['pending', 'sent', 'opened', 'completed', 'expired', 'cancelled']).optional(),
  resend: z.boolean().optional(), // Flag to resend invitation
}).partial();

// Schema for querying invitations
export const invitationQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional().default(1),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(1000)).optional().default(20),
  type: z.enum(['landlord', 'tenant', 'vendor', 'contractor', 'pmc']).optional(),
  status: z.enum(['pending', 'sent', 'opened', 'completed', 'expired', 'cancelled']).optional(),
  email: optionalString, // Search by email
}).partial();

// Schema for a single invitation response
export const invitationResponseSchema = baseInvitationSchema.extend({
  id: cuidSchema,
  token: z.string(),
  status: z.enum(['pending', 'sent', 'opened', 'completed', 'expired', 'cancelled']),
  expiresAt: z.string().datetime().nullable(),
  openedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  invitedBy: cuidSchema,
  invitedByRole: z.string(),
  invitedByName: optionalString,
  invitedByEmail: optionalString,
  invitedByAdminId: optionalString,
  invitedByLandlordId: optionalString,
  invitedByPMCId: optionalString,
  landlordId: optionalString,
  tenantId: optionalString,
  pmcId: optionalString,
  approvalStatus: optionalString, // For completed invitations
});

// Schema for a list of invitations response
export const invitationListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    invitations: z.array(invitationResponseSchema),
    pagination: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0),
    }),
  }),
});

// Type exports
export type InvitationCreate = z.infer<typeof invitationCreateSchema>;
export type InvitationUpdate = z.infer<typeof invitationUpdateSchema>;
export type InvitationQuery = z.infer<typeof invitationQuerySchema>;
export type InvitationResponse = z.infer<typeof invitationResponseSchema>;
export type InvitationListResponse = z.infer<typeof invitationListResponseSchema>;

