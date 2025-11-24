/**
 * Base Schema Definitions
 * 
 * Common schemas and utilities used across all domain schemas
 */

import { z } from 'zod';

/**
 * Common validation patterns
 */
export const patterns = {
  cuid: /^c[a-z0-9]{24}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  canadianPostalCode: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/,
  usZipCode: /^\d{5}(-\d{4})?$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
} as const;

/**
 * Common field schemas
 */
export const commonFields = {
  id: z.string().cuid(),
  cuid: z.string().regex(patterns.cuid, 'Invalid CUID format'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(patterns.phone, 'Invalid phone format').optional(),
  date: z.string().datetime().or(z.date()),
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  positiveNumber: z.number().positive(),
  nonNegativeNumber: z.number().nonnegative(),
  url: z.string().url(),
  json: z.any(),
} as const;

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(1000).default(50),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Standard API response wrapper
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.any().optional(),
    }).optional(),
    meta: z.object({
      timestamp: z.string(),
      version: z.string().default('v1'),
      requestId: z.string().optional(),
      pagination: paginationSchema.optional(),
    }).optional(),
  });

/**
 * Standard error response
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
  meta: z.object({
    timestamp: z.string(),
    version: z.string().default('v1'),
    requestId: z.string().optional(),
  }).optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Convenience exports for common schemas
 */
export const cuidSchema = commonFields.cuid;
export const emailSchema = commonFields.email;
export const dateTimeSchema = z.string().datetime().or(z.date());
export const optionalString = z.string().optional();
export const optionalNumber = z.number().optional();
export const optionalBoolean = z.boolean().optional();

