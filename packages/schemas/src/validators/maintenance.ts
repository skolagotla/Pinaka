/**
 * Maintenance Validators
 * 
 * Runtime validators for Maintenance Request domain
 */

import { z } from 'zod';
import { maintenanceRequestCreateSchema, maintenanceRequestUpdateSchema, maintenanceRequestResponseSchema } from '../../../../schema/types/domains/maintenance.schema';
import type { MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse } from '../../../../schema/types/src/generated-types';

// Re-export generated schemas as validators (with schema suffix to avoid conflicts)
export const MaintenanceCreateSchema = maintenanceRequestCreateSchema;
export const MaintenanceUpdateSchema = maintenanceRequestUpdateSchema;
export const MaintenanceResponseSchema = maintenanceRequestResponseSchema;

// Types are exported from generated-types.ts, no need to re-export here

// Convenience validation functions
export function validateMaintenanceCreate(data: unknown): MaintenanceCreate {
  return MaintenanceCreateSchema.parse(data);
}

export function validateMaintenanceUpdate(data: unknown): MaintenanceUpdate {
  return MaintenanceUpdateSchema.parse(data);
}

export function validateMaintenanceResponse(data: unknown): MaintenanceResponse {
  return MaintenanceResponseSchema.parse(data);
}

