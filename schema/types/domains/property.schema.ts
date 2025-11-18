/**
 * Property Domain Schemas
 * 
 * Single Source of Truth for Property domain validation and types
 * Used by both frontend and backend
 */

import { z } from 'zod';
import { commonFields, patterns } from '../base';

/**
 * Property Type Enum
 */
export const propertyTypeSchema = z.enum([
  'Single Family',
  'Multi-Family',
  'Condo',
  'Townhouse',
  'Apartment',
  'Commercial',
  'Other',
]);

/**
 * Payment Frequency Enum
 */
export const paymentFrequencySchema = z.enum(['biweekly', 'monthly']);

/**
 * Rented Status Enum
 */
export const rentedStatusSchema = z.enum(['Yes', 'No']);

/**
 * Country/Region Codes
 */
export const countryCodeSchema = z.string().length(2).toUpperCase();
export const regionCodeSchema = z.string().min(2).max(10);

/**
 * Address Schema
 */
export const addressSchema = z.object({
  addressLine1: z.string().min(1, 'Address line 1 is required').max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1, 'City is required').max(100),
  postalZip: z.string().min(1, 'Postal/ZIP code is required').max(20),
  // Legacy fields (for backward compatibility)
  provinceState: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  // New FK fields
  countryCode: countryCodeSchema.optional(),
  regionCode: regionCodeSchema.optional(),
});

/**
 * Postal/ZIP validation based on country
 */
// Simplified postal/zip schema - full validation done at object level with superRefine
export const postalZipSchema = z.string().min(1, 'Postal/ZIP code is required');

/**
 * Unit Financial Data Schema
 */
export const unitFinancialSchema = z.object({
  unitName: z.string().min(1).max(100).optional(),
  unitNumber: z.string().max(50).optional(),
  floorNumber: z.number().int().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().nonnegative().optional(),
  rentPrice: commonFields.nonNegativeNumber.optional(),
  depositAmount: commonFields.nonNegativeNumber.optional(),
  status: z.enum(['Vacant', 'Occupied', 'Under Maintenance']).optional(),
});

/**
 * Property Create Schema
 */
export const propertyCreateSchema = z.object({
  landlordId: commonFields.cuid,
  propertyName: z.string().max(255).optional(),
  // Address
  addressLine1: z.string().min(1, 'Address line 1 is required').max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1, 'City is required').max(100),
  postalZip: z.string().min(1, 'Postal/ZIP code is required').max(20),
  // Legacy fields
  provinceState: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  // New FK fields
  countryCode: countryCodeSchema.optional(),
  regionCode: regionCodeSchema.optional(),
  // Property details
  propertyType: propertyTypeSchema.optional(),
  unitCount: z.number().int().positive().default(1),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear() + 1).optional(),
  purchasePrice: commonFields.nonNegativeNumber.optional(),
  // Mortgage details
  mortgageAmount: commonFields.nonNegativeNumber.optional(),
  interestRate: z.number().min(0).max(100).optional(),
  mortgageTermYears: z.number().int().positive().max(50).optional(),
  mortgageStartDate: commonFields.dateString.optional(),
  paymentFrequency: paymentFrequencySchema.default('biweekly'),
  // Financial details
  rent: commonFields.nonNegativeNumber.optional(),
  depositAmount: commonFields.nonNegativeNumber.optional(),
  rented: rentedStatusSchema.default('No'),
  // Additional details
  squareFootage: z.number().int().positive().optional(),
  propertyDescription: z.string().max(5000).optional(),
  propertyTaxes: commonFields.nonNegativeNumber.optional(),
  // Unit financials (for multi-unit properties)
  unitFinancials: z.array(unitFinancialSchema).optional(),
}).refine(
  (data) => {
    // Validate postal code based on country
    const country = data.countryCode || data.country;
    if (country === 'CA') {
      return patterns.canadianPostalCode.test(data.postalZip.replace(/\s/g, ''));
    }
    if (country === 'US') {
      return patterns.usZipCode.test(data.postalZip);
    }
    return true;
  },
  {
    message: 'Invalid postal/ZIP code format for the specified country',
    path: ['postalZip'],
  }
);

/**
 * Property Update Schema (all fields optional)
 */
export const propertyUpdateSchema = propertyCreateSchema.partial().safeExtend({
  landlordId: commonFields.cuid.optional(), // Can't change landlord
});

/**
 * Property Response Schema (what API returns)
 */
export const propertyResponseSchema = z.object({
  id: commonFields.cuid,
  propertyId: z.string(),
  landlordId: commonFields.cuid,
  organizationId: commonFields.cuid.optional(),
  propertyName: z.string().nullable(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string(),
  provinceState: z.string().nullable(),
  postalZip: z.string(),
  country: z.string().nullable(),
  countryCode: z.string().nullable(),
  regionCode: z.string().nullable(),
  propertyType: z.string().nullable(),
  unitCount: z.number().int().default(1),
  yearBuilt: z.number().int().nullable(),
  purchasePrice: z.number().nullable(),
  mortgageAmount: z.number().nullable(),
  interestRate: z.number().nullable(),
  mortgageTermYears: z.number().int().nullable(),
  mortgageStartDate: z.date().nullable(),
  paymentFrequency: paymentFrequencySchema.nullable(),
  rent: z.number().nullable(),
  depositAmount: z.number().nullable(),
  rented: rentedStatusSchema,
  squareFootage: z.number().int().nullable(),
  propertyDescription: z.string().nullable(),
  propertyTaxes: z.number().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Relations
  units: z.array(z.any()).optional(),
  landlord: z.object({
    id: commonFields.cuid,
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
  }).optional(),
});

/**
 * Property List Response Schema
 */
export const propertyListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(propertyResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Property Query Parameters Schema
 */
export const propertyQuerySchema = z.object({
        page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
        limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
  landlordId: commonFields.cuid.optional(),
  propertyType: propertyTypeSchema.optional(),
  countryCode: countryCodeSchema.optional(),
  regionCode: regionCodeSchema.optional(),
});

// Export types
// Note: These types are also available from '@/lib/schemas/generated-types' (auto-generated)
// The generated types are the canonical source for API contracts
export type PropertyType = z.infer<typeof propertyTypeSchema>;
export type PaymentFrequency = z.infer<typeof paymentFrequencySchema>;
export type RentedStatus = z.infer<typeof rentedStatusSchema>;
export type Address = z.infer<typeof addressSchema>;
export type UnitFinancial = z.infer<typeof unitFinancialSchema>;
export type PropertyCreate = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdate = z.infer<typeof propertyUpdateSchema>;
export type PropertyResponse = z.infer<typeof propertyResponseSchema>;
export type PropertyListResponse = z.infer<typeof propertyListResponseSchema>;
export type PropertyQuery = z.infer<typeof propertyQuerySchema>;

