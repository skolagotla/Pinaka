import { z } from 'zod';
import { cuidSchema, optionalString } from '../base';

// Signature Schema
export const signatureResponseSchema = z.object({
  signatureFileName: optionalString,
  signatureUrl: z.string(),
});

export const signatureUploadResponseSchema = z.object({
  success: z.boolean(),
  signatureFileName: z.string(),
  signatureUrl: z.string(),
});

export type SignatureResponse = z.infer<typeof signatureResponseSchema>;
export type SignatureUploadResponse = z.infer<typeof signatureUploadResponseSchema>;

