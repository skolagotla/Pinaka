/**
 * Tenant Validators
 * 
 * Runtime validators for Tenant domain
 */

import { z } from 'zod';
import { tenantCreateSchema, tenantUpdateSchema, tenantResponseSchema } from '../../../../schema/types/domains/tenant.schema';
import type { TenantCreate, TenantUpdate, TenantResponse } from '../../../../schema/types/src/generated-types';

// Re-export generated schemas as validators (with schema suffix to avoid conflicts)
export const TenantCreateSchema = tenantCreateSchema;
export const TenantUpdateSchema = tenantUpdateSchema;
export const TenantResponseSchema = tenantResponseSchema;

// Types are exported from generated-types.ts, no need to re-export here

// Convenience validation functions
export function validateTenantCreate(data: unknown): TenantCreate {
  return TenantCreateSchema.parse(data);
}

export function validateTenantUpdate(data: unknown): TenantUpdate {
  return TenantUpdateSchema.parse(data);
}

export function validateTenantResponse(data: unknown): TenantResponse {
  return TenantResponseSchema.parse(data);
}

