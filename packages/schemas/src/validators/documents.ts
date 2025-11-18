/**
 * Document Validators
 * 
 * Runtime validators for Document domain
 */

import { z } from 'zod';
import { documentCreateSchema, documentUpdateSchema, documentResponseSchema } from '@/schema/types/domains/document.schema';

// Re-export generated schemas as validators
export const DocumentCreate = documentCreateSchema;
export const DocumentUpdate = documentUpdateSchema;
export const DocumentResponse = documentResponseSchema;

// Export types inferred from schemas
export type DocumentCreate = z.infer<typeof DocumentCreate>;
export type DocumentUpdate = z.infer<typeof DocumentUpdate>;
export type DocumentResponse = z.infer<typeof DocumentResponse>;

// Convenience validation functions
export function validateDocumentCreate(data: unknown): DocumentCreate {
  return DocumentCreate.parse(data);
}

export function validateDocumentUpdate(data: unknown): DocumentUpdate {
  return DocumentUpdate.parse(data);
}

export function validateDocumentResponse(data: unknown): DocumentResponse {
  return DocumentResponse.parse(data);
}

