/**
 * Lease Validators
 * 
 * Runtime validators for Lease domain
 */

import { z } from 'zod';
import { leaseCreateSchema, leaseUpdateSchema, leaseResponseSchema } from '@/schema/types/domains/lease.schema';

// Re-export generated schemas as validators
export const LeaseCreate = leaseCreateSchema;
export const LeaseUpdate = leaseUpdateSchema;
export const LeaseResponse = leaseResponseSchema;

// Export types inferred from schemas
export type LeaseCreate = z.infer<typeof LeaseCreate>;
export type LeaseUpdate = z.infer<typeof LeaseUpdate>;
export type LeaseResponse = z.infer<typeof LeaseResponse>;

// Convenience validation functions
export function validateLeaseCreate(data: unknown): LeaseCreate {
  return LeaseCreate.parse(data);
}

export function validateLeaseUpdate(data: unknown): LeaseUpdate {
  return LeaseUpdate.parse(data);
}

export function validateLeaseResponse(data: unknown): LeaseResponse {
  return LeaseResponse.parse(data);
}

