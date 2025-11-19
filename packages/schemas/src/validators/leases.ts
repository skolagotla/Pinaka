/**
 * Lease Validators
 * 
 * Runtime validators for Lease domain
 */

import { z } from 'zod';
import { leaseCreateSchema, leaseUpdateSchema, leaseResponseSchema } from '../../../../schema/types/domains/lease.schema';
import type { LeaseCreate, LeaseUpdate, LeaseResponse } from '../../../../schema/types/src/generated-types';

// Re-export generated schemas as validators (with schema suffix to avoid conflicts)
export const LeaseCreateSchema = leaseCreateSchema;
export const LeaseUpdateSchema = leaseUpdateSchema;
export const LeaseResponseSchema = leaseResponseSchema;

// Types are exported from generated-types.ts, no need to re-export here

// Convenience validation functions
export function validateLeaseCreate(data: unknown): LeaseCreate {
  return LeaseCreateSchema.parse(data);
}

export function validateLeaseUpdate(data: unknown): LeaseUpdate {
  return LeaseUpdateSchema.parse(data);
}

export function validateLeaseResponse(data: unknown): LeaseResponse {
  return LeaseResponseSchema.parse(data);
}

