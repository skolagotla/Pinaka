/**
 * Tenant Validators
 * 
 * Runtime validators for Tenant domain
 */

import { z } from 'zod';
import { tenantCreateSchema, tenantUpdateSchema, tenantResponseSchema } from '@/schema/types/domains/tenant.schema';

// Re-export generated schemas as validators
export const TenantCreate = tenantCreateSchema;
export const TenantUpdate = tenantUpdateSchema;
export const TenantResponse = tenantResponseSchema;

// Export types inferred from schemas
export type TenantCreate = z.infer<typeof TenantCreate>;
export type TenantUpdate = z.infer<typeof TenantUpdate>;
export type TenantResponse = z.infer<typeof TenantResponse>;

// Convenience validation functions
export function validateTenantCreate(data: unknown): TenantCreate {
  return TenantCreate.parse(data);
}

export function validateTenantUpdate(data: unknown): TenantUpdate {
  return TenantUpdate.parse(data);
}

export function validateTenantResponse(data: unknown): TenantResponse {
  return TenantResponse.parse(data);
}

