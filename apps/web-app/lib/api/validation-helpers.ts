/**
 * API Validation Helpers
 * 
 * Utilities for runtime validation at API boundaries
 * 
 * Usage:
 *   import { validateRequest, validateResponse } from '@/lib/api/validation-helpers';
 *   
 *   // In API route
 *   const body = await validateRequest(req.body, PropertyCreate);
 *   
 *   // In API client
 *   const response = await validateResponse(data, PropertyResponse);
 */

import { z, ZodError } from 'zod';
import { NextApiRequest } from 'next';

/**
 * Validate request body at server boundary
 */
export function validateRequest<T extends z.ZodTypeAny>(
  data: unknown,
  schema: T,
  context?: string
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Zod v4: use issues() instead of errors
      const issues = 'issues' in error ? (error as any).issues : (error as any).errors || [];
      const message = context 
        ? `Validation error in ${context}: ${issues.map((e: any) => `${e.path?.join('.') || e.path}: ${e.message}`).join(', ')}`
        : `Validation error: ${issues.map((e: any) => `${e.path?.join('.') || e.path}: ${e.message}`).join(', ')}`;
      throw new Error(message);
    }
    throw error;
  }
}

/**
 * Validate response data at client boundary
 */
export function validateResponse<T extends z.ZodTypeAny>(
  data: unknown,
  schema: T,
  context?: string
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = context
        ? `Response validation error in ${context}: ${((error as any).issues || (error as any).errors || []).map((e: any) => `${e.path?.join('.') || e.path}: ${e.message}`).join(', ')}`
        : `Response validation error: ${((error as any).issues || (error as any).errors || []).map((e: any) => `${e.path?.join('.') || e.path}: ${e.message}`).join(', ')}`;
      console.error(message, data);
      throw new Error(message);
    }
    throw error;
  }
}

/**
 * Validate query parameters
 */
export function validateQuery<T extends z.ZodTypeAny>(
  query: NextApiRequest['query'],
  schema: T
): z.infer<T> {
  try {
    return schema.parse(query);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Zod v4: use issues() instead of errors
      const issues = 'issues' in error ? (error as any).issues : (error as any).errors || [];
      const message = `Query validation error: ${issues.map((e: any) => `${e.path?.join('.') || e.path}: ${e.message}`).join(', ')}`;
      throw new Error(message);
    }
    throw error;
  }
}

