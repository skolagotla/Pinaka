"use strict";
/**
 * Vendor/ServiceProvider Domain Schemas
 *
 * Single Source of Truth for Vendor/ServiceProvider domain validation and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorListResponseSchema = exports.vendorResponseSchema = exports.vendorQuerySchema = exports.vendorUpdateSchema = exports.vendorCreateSchema = exports.vendorSearchQuerySchema = exports.serviceProviderListResponseSchema = exports.serviceProviderResponseSchema = exports.serviceProviderQuerySchema = exports.serviceProviderUpdateSchema = exports.serviceProviderCreateSchema = exports.serviceProviderTypeSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
/**
 * Service Provider Type Enum
 */
exports.serviceProviderTypeSchema = zod_1.z.enum(['vendor', 'contractor']);
/**
 * Service Provider Create Schema
 */
exports.serviceProviderCreateSchema = zod_1.z.object({
    type: exports.serviceProviderTypeSchema,
    name: zod_1.z.string().min(1, "Name is required"),
    businessName: zod_1.z.string().optional(),
    contactName: zod_1.z.string().optional(),
    email: zod_1.z.string().email("Valid email is required"),
    phone: zod_1.z.string().min(1, "Phone is required"),
    category: zod_1.z.string().optional(), // For vendors (single category)
    specialties: zod_1.z.array(zod_1.z.string()).optional().default([]), // For contractors (multiple specialties)
    licenseNumber: zod_1.z.string().optional(), // For contractors
    addressLine1: zod_1.z.string().optional(),
    addressLine2: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    provinceState: zod_1.z.string().optional(), // Legacy field
    postalZip: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(), // Legacy field
    countryCode: zod_1.z.string().optional(),
    regionCode: zod_1.z.string().optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    isGlobal: zod_1.z.boolean().default(false),
    isActive: zod_1.z.boolean().default(true),
});
/**
 * Service Provider Update Schema
 */
exports.serviceProviderUpdateSchema = exports.serviceProviderCreateSchema.partial().extend({
    type: exports.serviceProviderTypeSchema.optional(), // Can't change type
});
/**
 * Service Provider Query Schema
 */
exports.serviceProviderQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    type: exports.serviceProviderTypeSchema.optional(),
    category: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    isGlobal: zod_1.z.boolean().optional(),
    search: zod_1.z.string().optional(),
});
/**
 * Service Provider Response Schema
 */
exports.serviceProviderResponseSchema = zod_1.z.object({
    id: base_1.commonFields.cuid,
    providerId: zod_1.z.string(),
    type: exports.serviceProviderTypeSchema,
    name: zod_1.z.string(),
    businessName: zod_1.z.string().nullable(),
    contactName: zod_1.z.string().nullable(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string(),
    category: zod_1.z.string().nullable(),
    specialties: zod_1.z.array(zod_1.z.string()),
    licenseNumber: zod_1.z.string().nullable(),
    addressLine1: zod_1.z.string().nullable(),
    addressLine2: zod_1.z.string().nullable(),
    city: zod_1.z.string().nullable(),
    provinceState: zod_1.z.string().nullable(),
    postalZip: zod_1.z.string().nullable(),
    country: zod_1.z.string().nullable(),
    countryCode: zod_1.z.string().nullable(),
    regionCode: zod_1.z.string().nullable(),
    latitude: zod_1.z.number().nullable(),
    longitude: zod_1.z.number().nullable(),
    isGlobal: zod_1.z.boolean(),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
/**
 * Service Provider List Response Schema
 */
exports.serviceProviderListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.array(exports.serviceProviderResponseSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
/**
 * Vendor Search Query Schema
 */
exports.vendorSearchQuerySchema = zod_1.z.object({
    q: zod_1.z.string().min(1, 'Search query is required').optional(),
    type: zod_1.z.enum(['vendor', 'contractor']).optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(20),
});
// Aliases for backward compatibility (vendor naming)
exports.vendorCreateSchema = exports.serviceProviderCreateSchema;
exports.vendorUpdateSchema = exports.serviceProviderUpdateSchema;
exports.vendorQuerySchema = exports.serviceProviderQuerySchema;
exports.vendorResponseSchema = exports.serviceProviderResponseSchema;
exports.vendorListResponseSchema = exports.serviceProviderListResponseSchema;
