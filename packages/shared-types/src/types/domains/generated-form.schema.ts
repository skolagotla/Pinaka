import { z } from 'zod';
import { cuidSchema, dateTimeSchema, optionalString, optionalNumber } from '../base';

// Base Generated Form Schema
const baseGeneratedFormSchema = z.object({
  formType: z.string().min(1, "Form type is required"),
  tenantId: cuidSchema.optional().nullable(),
  leaseId: cuidSchema.optional().nullable(),
  propertyId: cuidSchema.optional().nullable(),
  unitId: cuidSchema.optional().nullable(),
  formData: z.record(z.string(), z.any()), // JSON data
  pdfUrl: optionalString.nullable(),
  status: z.enum(['draft', 'finalized', 'sent', 'filed']).optional().default('draft'),
  notes: optionalString.nullable(),
});

// Schema for creating a generated form
export const generatedFormCreateSchema = baseGeneratedFormSchema.extend({
  generatedBy: cuidSchema, // Set by backend from user context
});

// Schema for updating a generated form
export const generatedFormUpdateSchema = baseGeneratedFormSchema.extend({
  id: cuidSchema,
}).partial();

// Schema for querying generated forms
export const generatedFormQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional().default(1),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(1000)).optional().default(50),
  formType: optionalString,
  status: optionalString,
  tenantId: optionalString,
  propertyId: optionalString,
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
}).partial();

// Schema for a single generated form response
export const generatedFormResponseSchema = baseGeneratedFormSchema.extend({
  id: cuidSchema,
  generatedBy: cuidSchema,
  generatedAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
  tenantName: optionalString.nullable(),
  tenantEmail: optionalString.nullable(),
  propertyAddress: optionalString.nullable(),
  propertyName: optionalString.nullable(),
  propertyCity: optionalString.nullable(),
  propertyUnitCount: optionalNumber.nullable(),
  unitName: optionalString.nullable(),
});

// Schema for a list of generated forms response
export const generatedFormListResponseSchema = z.object({
  success: z.boolean(),
  forms: z.array(generatedFormResponseSchema),
  pagination: z.object({
    total: z.number().int().min(0),
    limit: z.number().int().min(1),
    offset: z.number().int().min(0),
    hasMore: z.boolean(),
  }),
});

// Type exports
export type GeneratedFormCreate = z.infer<typeof generatedFormCreateSchema>;
export type GeneratedFormUpdate = z.infer<typeof generatedFormUpdateSchema>;
export type GeneratedFormQuery = z.infer<typeof generatedFormQuerySchema>;
export type GeneratedFormResponse = z.infer<typeof generatedFormResponseSchema>;
export type GeneratedFormListResponse = z.infer<typeof generatedFormListResponseSchema>;

