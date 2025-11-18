/**
 * Maintenance Validators
 * 
 * Runtime validators for Maintenance Request domain
 */

import { z } from 'zod';
import { maintenanceRequestCreateSchema, maintenanceRequestUpdateSchema, maintenanceRequestResponseSchema } from '@/schema/types/domains/maintenance.schema';

// Re-export generated schemas as validators
export const MaintenanceCreate = maintenanceRequestCreateSchema;
export const MaintenanceUpdate = maintenanceRequestUpdateSchema;
export const MaintenanceResponse = maintenanceRequestResponseSchema;

// Export types inferred from schemas
export type MaintenanceCreate = z.infer<typeof MaintenanceCreate>;
export type MaintenanceUpdate = z.infer<typeof MaintenanceUpdate>;
export type MaintenanceResponse = z.infer<typeof MaintenanceResponse>;

// Convenience validation functions
export function validateMaintenanceCreate(data: unknown): MaintenanceCreate {
  return MaintenanceCreate.parse(data);
}

export function validateMaintenanceUpdate(data: unknown): MaintenanceUpdate {
  return MaintenanceUpdate.parse(data);
}

export function validateMaintenanceResponse(data: unknown): MaintenanceResponse {
  return MaintenanceResponse.parse(data);
}

