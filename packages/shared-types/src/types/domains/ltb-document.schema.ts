/**
 * LTB Document Domain Schemas
 * 
 * Single Source of Truth for LTB Document domain validation and types
 */

import { z } from 'zod';

/**
 * LTB Document Audience Enum
 */
export const ltbDocumentAudienceSchema = z.enum(['landlord', 'tenant', 'both']);

/**
 * LTB Document Category Enum
 */
export const ltbDocumentCategorySchema = z.enum([
  'Rent',
  'Eviction',
  'Application',
  'Agreement',
  'Notice Response',
  'Tenant Rights',
  'Maintenance',
  'Other',
]);

/**
 * LTB Document Query Schema
 */
export const ltbDocumentQuerySchema = z.object({
  country: z.string().optional(),
  province: z.string().optional(),
  audience: ltbDocumentAudienceSchema.optional(),
  category: ltbDocumentCategorySchema.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

/**
 * LTB Document Response Schema
 */
export const ltbDocumentResponseSchema = z.object({
  id: z.string(),
  formNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: ltbDocumentCategorySchema,
  audience: ltbDocumentAudienceSchema,
  pdfUrl: z.string().url(),
  instructionUrl: z.string().url().optional(),
  country: z.string(),
  province: z.string(),
  tags: z.array(z.string()).optional(),
});

/**
 * LTB Document List Response Schema
 */
export const ltbDocumentListResponseSchema = z.object({
  documents: z.array(ltbDocumentResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * LTB Form Number Schema (for validation)
 * Case-insensitive validation
 */
export const ltbFormNumberSchema = z.string().regex(/^[A-Za-z]\d+$/, 'Invalid form number format');

/**
 * Type exports
 */
export type LTBDocumentAudience = z.infer<typeof ltbDocumentAudienceSchema>;
export type LTBDocumentCategory = z.infer<typeof ltbDocumentCategorySchema>;
export type LTBDocumentQuery = z.infer<typeof ltbDocumentQuerySchema>;
export type LTBDocumentResponse = z.infer<typeof ltbDocumentResponseSchema>;
export type LTBDocumentListResponse = z.infer<typeof ltbDocumentListResponseSchema>;

