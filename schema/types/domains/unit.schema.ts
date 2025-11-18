import { z } from 'zod';
import { cuidSchema, optionalString, optionalNumber } from '../base';

// Unit Schema (nested under Property domain)
export const unitCreateSchema = z.object({
  propertyId: cuidSchema,
  unitName: z.string().min(1, "Unit name is required"),
  floorNumber: optionalNumber,
  bedrooms: optionalNumber,
  bathrooms: optionalNumber,
  rentPrice: z.number().min(0, "Rent price must be non-negative").optional(),
  depositAmount: z.number().min(0, "Deposit amount must be non-negative").optional(),
  status: z.string().optional().default("Vacant"),
});

export const unitUpdateSchema = unitCreateSchema.extend({
  id: cuidSchema,
}).partial();

export const unitResponseSchema = unitCreateSchema.extend({
  id: cuidSchema,
  propertyId: cuidSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  property: z.object({
    id: cuidSchema,
    propertyName: optionalString,
    addressLine1: z.string(),
  }).optional(),
});

export const unitQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  propertyId: cuidSchema.optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const unitListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(unitResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export type UnitCreate = z.infer<typeof unitCreateSchema>;
export type UnitUpdate = z.infer<typeof unitUpdateSchema>;
export type UnitResponse = z.infer<typeof unitResponseSchema>;
export type UnitQuery = z.infer<typeof unitQuerySchema>;
export type UnitListResponse = z.infer<typeof unitListResponseSchema>;

