/**
 * Document Validators
 * 
 * Runtime validators for Document domain
 */

import { z } from 'zod';
import { documentCreateSchema, documentUpdateSchema, documentResponseSchema } from '../../../../schema/types/domains/document.schema';
import type { DocumentCreate, DocumentUpdate, DocumentResponse } from '../../../../schema/types/src/generated-types';

// Re-export generated schemas as validators (with schema suffix to avoid conflicts)
export const DocumentCreateSchema = documentCreateSchema;
export const DocumentUpdateSchema = documentUpdateSchema;
export const DocumentResponseSchema = documentResponseSchema;

// Types are exported from generated-types.ts, no need to re-export here

// Convenience validation functions
export function validateDocumentCreate(data: unknown): DocumentCreate {
  return DocumentCreateSchema.parse(data);
}

export function validateDocumentUpdate(data: unknown): DocumentUpdate {
  return DocumentUpdateSchema.parse(data);
}

export function validateDocumentResponse(data: unknown): DocumentResponse {
  return DocumentResponseSchema.parse(data);
}

