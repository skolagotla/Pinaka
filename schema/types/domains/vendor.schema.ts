/**
 * Vendor/ServiceProvider Domain Schemas
 * 
 * Single Source of Truth for Vendor/ServiceProvider domain validation and types
 */

import { z } from 'zod';
import { commonFields } from '../base';

/**
 * Service Provider Type Enum
 */
export const serviceProviderTypeSchema = z.enum(['vendor', 'contractor']);

/**
 * Service Provider Create Schema
 */
export const serviceProviderCreateSchema = z.object({
  type: serviceProviderTypeSchema,
  name: z.string().min(1, "Name is required"),
  businessName: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  category: z.string().optional(), // For vendors (single category)
  specialties: z.array(z.string()).optional().default([]), // For contractors (multiple specialties)
  licenseNumber: z.string().optional(), // For contractors
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  provinceState: z.string().optional(), // Legacy field
  postalZip: z.string().optional(),
  country: z.string().optional(), // Legacy field
  countryCode: z.string().optional(),
  regionCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isGlobal: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

/**
 * Service Provider Update Schema
 */
export const serviceProviderUpdateSchema = serviceProviderCreateSchema.partial().extend({
  type: serviceProviderTypeSchema.optional(), // Can't change type
});

/**
 * Service Provider Query Schema
 */
export const serviceProviderQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  type: serviceProviderTypeSchema.optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  isGlobal: z.boolean().optional(),
  search: z.string().optional(),
});

/**
 * Service Provider Response Schema
 */
export const serviceProviderResponseSchema = z.object({
  id: commonFields.cuid,
  providerId: z.string(),
  type: serviceProviderTypeSchema,
  name: z.string(),
  businessName: z.string().nullable(),
  contactName: z.string().nullable(),
  email: z.string().email(),
  phone: z.string(),
  category: z.string().nullable(),
  specialties: z.array(z.string()),
  licenseNumber: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  provinceState: z.string().nullable(),
  postalZip: z.string().nullable(),
  country: z.string().nullable(),
  countryCode: z.string().nullable(),
  regionCode: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  isGlobal: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Service Provider List Response Schema
 */
export const serviceProviderListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(serviceProviderResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Export types
export type ServiceProviderType = z.infer<typeof serviceProviderTypeSchema>;
export type ServiceProviderCreate = z.infer<typeof serviceProviderCreateSchema>;
export type ServiceProviderUpdate = z.infer<typeof serviceProviderUpdateSchema>;
export type ServiceProviderQuery = z.infer<typeof serviceProviderQuerySchema>;
export type ServiceProviderResponse = z.infer<typeof serviceProviderResponseSchema>;
export type ServiceProviderListResponse = z.infer<typeof serviceProviderListResponseSchema>;

// Aliases for backward compatibility (vendor naming)
export const vendorCreateSchema = serviceProviderCreateSchema;
export const vendorUpdateSchema = serviceProviderUpdateSchema;
export const vendorQuerySchema = serviceProviderQuerySchema;
export const vendorResponseSchema = serviceProviderResponseSchema;
export const vendorListResponseSchema = serviceProviderListResponseSchema;
export type VendorCreate = ServiceProviderCreate;
export type VendorUpdate = ServiceProviderUpdate;
export type VendorQuery = ServiceProviderQuery;
export type VendorResponse = ServiceProviderResponse;
export type VendorListResponse = ServiceProviderListResponse;

