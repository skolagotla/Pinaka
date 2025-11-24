import { z } from 'zod';
import { cuidSchema, dateTimeSchema } from '../base';

// Tenant Rent Data Schema
export const tenantRentDataResponseSchema = z.object({
  rentPayments: z.array(z.object({
    id: cuidSchema,
    amount: z.number(),
    dueDate: dateTimeSchema,
    paidDate: dateTimeSchema.nullable(),
    status: z.string(),
    paymentMethod: z.string().optional(),
  })),
  lease: z.object({
    id: cuidSchema,
    rentAmount: z.number(),
    leaseStart: dateTimeSchema,
    leaseEnd: dateTimeSchema.nullable(),
  }),
  property: z.object({
    id: cuidSchema,
    propertyName: z.string().optional().nullable(),
    addressLine1: z.string(),
  }).optional(),
  unit: z.object({
    id: cuidSchema,
    unitName: z.string(),
  }).optional(),
});

export type TenantRentDataResponse = z.infer<typeof tenantRentDataResponseSchema>;

