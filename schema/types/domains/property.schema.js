"use strict";
/**
 * Property Domain Schemas
 *
 * Single Source of Truth for Property domain validation and types
 * Used by both frontend and backend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyQuerySchema = exports.propertyListResponseSchema = exports.propertyResponseSchema = exports.propertyUpdateSchema = exports.propertyCreateSchema = exports.unitFinancialSchema = exports.postalZipSchema = exports.addressSchema = exports.regionCodeSchema = exports.countryCodeSchema = exports.rentedStatusSchema = exports.paymentFrequencySchema = exports.propertyTypeSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
/**
 * Property Type Enum
 */
exports.propertyTypeSchema = zod_1.z.enum([
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
exports.paymentFrequencySchema = zod_1.z.enum(['biweekly', 'monthly']);
/**
 * Rented Status Enum
 */
exports.rentedStatusSchema = zod_1.z.enum(['Yes', 'No']);
/**
 * Country/Region Codes
 */
exports.countryCodeSchema = zod_1.z.string().length(2).toUpperCase();
exports.regionCodeSchema = zod_1.z.string().min(2).max(10);
/**
 * Address Schema
 */
exports.addressSchema = zod_1.z.object({
    addressLine1: zod_1.z.string().min(1, 'Address line 1 is required').max(255),
    addressLine2: zod_1.z.string().max(255).optional(),
    city: zod_1.z.string().min(1, 'City is required').max(100),
    postalZip: zod_1.z.string().min(1, 'Postal/ZIP code is required').max(20),
    // Legacy fields (for backward compatibility)
    provinceState: zod_1.z.string().max(100).optional(),
    country: zod_1.z.string().max(100).optional(),
    // New FK fields
    countryCode: exports.countryCodeSchema.optional(),
    regionCode: exports.regionCodeSchema.optional(),
});
/**
 * Postal/ZIP validation based on country
 */
// Simplified postal/zip schema - full validation done at object level with superRefine
exports.postalZipSchema = zod_1.z.string().min(1, 'Postal/ZIP code is required');
/**
 * Unit Financial Data Schema
 */
exports.unitFinancialSchema = zod_1.z.object({
    unitName: zod_1.z.string().min(1).max(100).optional(),
    unitNumber: zod_1.z.string().max(50).optional(),
    floorNumber: zod_1.z.number().int().nonnegative().optional(),
    bedrooms: zod_1.z.number().int().nonnegative().optional(),
    bathrooms: zod_1.z.number().nonnegative().optional(),
    rentPrice: base_1.commonFields.nonNegativeNumber.optional(),
    depositAmount: base_1.commonFields.nonNegativeNumber.optional(),
    status: zod_1.z.enum(['Vacant', 'Occupied', 'Under Maintenance']).optional(),
});
/**
 * Property Create Schema
 */
exports.propertyCreateSchema = zod_1.z.object({
    landlordId: base_1.commonFields.cuid,
    propertyName: zod_1.z.string().max(255).optional(),
    // Address
    addressLine1: zod_1.z.string().min(1, 'Address line 1 is required').max(255),
    addressLine2: zod_1.z.string().max(255).optional(),
    city: zod_1.z.string().min(1, 'City is required').max(100),
    postalZip: zod_1.z.string().min(1, 'Postal/ZIP code is required').max(20),
    // Legacy fields
    provinceState: zod_1.z.string().max(100).optional(),
    country: zod_1.z.string().max(100).optional(),
    // New FK fields
    countryCode: exports.countryCodeSchema.optional(),
    regionCode: exports.regionCodeSchema.optional(),
    // Property details
    propertyType: exports.propertyTypeSchema.optional(),
    unitCount: zod_1.z.number().int().positive().default(1),
    yearBuilt: zod_1.z.number().int().min(1800).max(new Date().getFullYear() + 1).optional(),
    purchasePrice: base_1.commonFields.nonNegativeNumber.optional(),
    // Mortgage details
    mortgageAmount: base_1.commonFields.nonNegativeNumber.optional(),
    interestRate: zod_1.z.number().min(0).max(100).optional(),
    mortgageTermYears: zod_1.z.number().int().positive().max(50).optional(),
    mortgageStartDate: base_1.commonFields.dateString.optional(),
    paymentFrequency: exports.paymentFrequencySchema.default('biweekly'),
    // Financial details
    rent: base_1.commonFields.nonNegativeNumber.optional(),
    depositAmount: base_1.commonFields.nonNegativeNumber.optional(),
    rented: exports.rentedStatusSchema.default('No'),
    // Additional details
    squareFootage: zod_1.z.number().int().positive().optional(),
    propertyDescription: zod_1.z.string().max(5000).optional(),
    propertyTaxes: base_1.commonFields.nonNegativeNumber.optional(),
    // Unit financials (for multi-unit properties)
    unitFinancials: zod_1.z.array(exports.unitFinancialSchema).optional(),
}).refine((data) => {
    // Validate postal code based on country
    const country = data.countryCode || data.country;
    if (country === 'CA') {
        return base_1.patterns.canadianPostalCode.test(data.postalZip.replace(/\s/g, ''));
    }
    if (country === 'US') {
        return base_1.patterns.usZipCode.test(data.postalZip);
    }
    return true;
}, {
    message: 'Invalid postal/ZIP code format for the specified country',
    path: ['postalZip'],
});
/**
 * Property Update Schema (all fields optional)
 */
exports.propertyUpdateSchema = exports.propertyCreateSchema.partial().safeExtend({
    landlordId: base_1.commonFields.cuid.optional(), // Can't change landlord
});
/**
 * Property Response Schema (what API returns)
 */
exports.propertyResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    propertyId: zod_1.z.string(),
    landlordId: base_1.commonFields.cuid,
    organizationId: base_1.commonFields.cuid.optional(),
    propertyName: zod_1.z.string().nullable(),
    addressLine1: zod_1.z.string(),
    addressLine2: zod_1.z.string().nullable(),
    city: zod_1.z.string(),
    provinceState: zod_1.z.string().nullable(),
    postalZip: zod_1.z.string(),
    country: zod_1.z.string().nullable(),
    countryCode: zod_1.z.string().nullable(),
    regionCode: zod_1.z.string().nullable(),
    propertyType: zod_1.z.string().nullable(),
    unitCount: zod_1.z.number().int().default(1),
    yearBuilt: zod_1.z.number().int().nullable(),
    purchasePrice: zod_1.z.number().nullable(),
    mortgageAmount: zod_1.z.number().nullable(),
    interestRate: zod_1.z.number().nullable(),
    mortgageTermYears: zod_1.z.number().int().nullable(),
    mortgageStartDate: zod_1.z.date().nullable(),
    paymentFrequency: exports.paymentFrequencySchema.nullable(),
    rent: zod_1.z.number().nullable(),
    depositAmount: zod_1.z.number().nullable(),
    rented: exports.rentedStatusSchema,
    squareFootage: zod_1.z.number().int().nullable(),
    propertyDescription: zod_1.z.string().nullable(),
    propertyTaxes: zod_1.z.number().nullable(),
    latitude: zod_1.z.number().nullable(),
    longitude: zod_1.z.number().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    // Relations
    units: zod_1.z.array(zod_1.z.any()).optional(),
    landlord: zod_1.z.object({
        id: base_1.commonFields.cuid,
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        email: zod_1.z.string().email(),
    }).optional(),
});
/**
 * Property List Response Schema
 */
exports.propertyListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.array(exports.propertyResponseSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
/**
 * Property Query Parameters Schema
 */
exports.propertyQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    landlordId: base_1.commonFields.cuid.optional(),
    propertyType: exports.propertyTypeSchema.optional(),
    countryCode: exports.countryCodeSchema.optional(),
    regionCode: exports.regionCodeSchema.optional(),
});
