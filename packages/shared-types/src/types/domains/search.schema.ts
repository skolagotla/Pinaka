/**
 * Search Domain Schemas
 * 
 * Single Source of Truth for Search domain validation and types
 */

import { z } from 'zod';
import { commonFields } from '../base';

/**
 * Search Query Schema
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  type: z.enum(['all', 'properties', 'tenants', 'leases', 'maintenance', 'documents']).optional().default('all'),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

/**
 * Search Result Schema
 */
export const searchResultSchema = z.object({
  properties: z.array(z.object({
    id: commonFields.cuid,
    propertyName: z.string(),
    addressLine1: z.string().nullable(),
    city: z.string().nullable(),
  })).default([]),
  tenants: z.array(z.object({
    id: commonFields.cuid,
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  })).default([]),
  leases: z.array(z.object({
    id: commonFields.cuid,
    leaseNumber: z.string().nullable(),
    unit: z.object({
      unitName: z.string(),
      property: z.object({
        propertyName: z.string(),
      }),
    }).nullable(),
  })).default([]),
  maintenance: z.array(z.object({
    id: commonFields.cuid,
    title: z.string(),
    ticketNumber: z.string().nullable(),
    status: z.string(),
  })).default([]),
  documents: z.array(z.object({
    id: commonFields.cuid,
    fileName: z.string(),
    originalName: z.string(),
    category: z.string(),
  })).default([]),
});

/**
 * Search Response Schema
 */
export const searchResponseSchema = z.object({
  success: z.literal(true),
  data: searchResultSchema,
  query: z.string(),
  type: z.string(),
});

// Export types
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;

