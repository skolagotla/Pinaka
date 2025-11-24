import { z } from 'zod';
import { cuidSchema, optionalString } from '../base';

// Form Generation Schema
export const formGenerateSchema = z.object({
  formType: z.enum(['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N10', 'N11', 'N12', 'N13', 'L1', 'L2', 'L3', 'L4', 'L8', 'L9']),
  tenantId: cuidSchema.optional(),
  leaseId: cuidSchema.optional(),
  propertyId: cuidSchema.optional(),
  unitId: cuidSchema.optional(),
  customData: z.record(z.string(), z.any()).optional(),
});

export const formGenerateResponseSchema = z.object({
  success: z.boolean(),
  form: z.object({
    id: cuidSchema,
    formType: z.string(),
    tenantId: cuidSchema.optional().nullable(),
    propertyId: cuidSchema.optional().nullable(),
    unitId: cuidSchema.optional().nullable(),
    formData: z.record(z.string(), z.any()),
    status: z.string(),
  }),
});

export type FormGenerate = z.infer<typeof formGenerateSchema>;
export type FormGenerateResponse = z.infer<typeof formGenerateResponseSchema>;

