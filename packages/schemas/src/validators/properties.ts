/**
 * Property Validators
 * 
 * Runtime validators for Property domain
 * These complement the generated validators from the schema registry
 */

import { z } from 'zod';
import { propertyCreateSchema, propertyUpdateSchema, propertyResponseSchema } from '@/schema/types/domains/property.schema';

// Re-export generated schemas as validators
export const PropertyCreate = propertyCreateSchema;
export const PropertyUpdate = propertyUpdateSchema;
export const PropertyResponse = propertyResponseSchema;

// Export types inferred from schemas
export type PropertyCreate = z.infer<typeof PropertyCreate>;
export type PropertyUpdate = z.infer<typeof PropertyUpdate>;
export type PropertyResponse = z.infer<typeof PropertyResponse>;

// Convenience validation functions
export function validatePropertyCreate(data: unknown): PropertyCreate {
  return PropertyCreate.parse(data);
}

export function validatePropertyUpdate(data: unknown): PropertyUpdate {
  return PropertyUpdate.parse(data);
}

export function validatePropertyResponse(data: unknown): PropertyResponse {
  return PropertyResponse.parse(data);
}

