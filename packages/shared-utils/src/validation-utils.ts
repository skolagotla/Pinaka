/**
 * Shared Validation Utilities
 * 
 * Consolidated validation utilities
 */

import { z } from 'zod';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailSchema = z.string().email();
  return emailSchema.safeParse(email).success;
}

/**
 * Validate CUID format
 */
export function isValidCUID(id: string): boolean {
  const cuidSchema = z.string().regex(/^c[a-z0-9]{24}$/);
  return cuidSchema.safeParse(id).success;
}

