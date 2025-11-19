/**
 * Property Validators
 * 
 * Runtime validators for Property domain
 * These complement the generated validators from the schema registry
 */

import { z } from 'zod';
import { propertyCreateSchema, propertyUpdateSchema, propertyResponseSchema } from '../../../../schema/types/domains/property.schema';
import type { PropertyCreate, PropertyUpdate, PropertyResponse } from '../../../../schema/types/src/generated-types';

// Re-export generated schemas as validators (with schema suffix to avoid conflicts)
export const PropertyCreateSchema = propertyCreateSchema;
export const PropertyUpdateSchema = propertyUpdateSchema;
export const PropertyResponseSchema = propertyResponseSchema;

// Types are exported from generated-types.ts, no need to re-export here

// Convenience validation functions
export function validatePropertyCreate(data: unknown): PropertyCreate {
  return PropertyCreateSchema.parse(data);
}

export function validatePropertyUpdate(data: unknown): PropertyUpdate {
  return PropertyUpdateSchema.parse(data);
}

export function validatePropertyResponse(data: unknown): PropertyResponse {
  return PropertyResponseSchema.parse(data);
}

