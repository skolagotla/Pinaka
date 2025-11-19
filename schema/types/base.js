"use strict";
/**
 * Base Schema Definitions
 *
 * Common schemas and utilities used across all domain schemas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalBoolean = exports.optionalNumber = exports.optionalString = exports.dateTimeSchema = exports.emailSchema = exports.cuidSchema = exports.errorResponseSchema = exports.apiResponseSchema = exports.paginationSchema = exports.commonFields = exports.patterns = void 0;
const zod_1 = require("zod");
/**
 * Common validation patterns
 */
exports.patterns = {
    cuid: /^c[a-z0-9]{24}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    canadianPostalCode: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/,
    usZipCode: /^\d{5}(-\d{4})?$/,
    phone: /^\+?[\d\s\-\(\)]+$/,
};
/**
 * Common field schemas
 */
exports.commonFields = {
    id: zod_1.z.string().cuid(),
    cuid: zod_1.z.string().regex(exports.patterns.cuid, 'Invalid CUID format'),
    email: zod_1.z.string().email('Invalid email format'),
    phone: zod_1.z.string().regex(exports.patterns.phone, 'Invalid phone format').optional(),
    date: zod_1.z.string().datetime().or(zod_1.z.date()),
    dateString: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    positiveNumber: zod_1.z.number().positive(),
    nonNegativeNumber: zod_1.z.number().nonnegative(),
    url: zod_1.z.string().url(),
    json: zod_1.z.any(),
};
/**
 * Pagination schema
 */
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().positive().max(1000).default(50),
});
/**
 * Standard API response wrapper
 */
const apiResponseSchema = (dataSchema) => zod_1.z.object({
    success: zod_1.z.boolean(),
    data: dataSchema.optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        details: zod_1.z.any().optional(),
    }).optional(),
    meta: zod_1.z.object({
        timestamp: zod_1.z.string(),
        version: zod_1.z.string().default('v1'),
        requestId: zod_1.z.string().optional(),
        pagination: exports.paginationSchema.optional(),
    }).optional(),
});
exports.apiResponseSchema = apiResponseSchema;
/**
 * Standard error response
 */
exports.errorResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(false),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        details: zod_1.z.any().optional(),
    }),
    meta: zod_1.z.object({
        timestamp: zod_1.z.string(),
        version: zod_1.z.string().default('v1'),
        requestId: zod_1.z.string().optional(),
    }).optional(),
});
/**
 * Convenience exports for common schemas
 */
exports.cuidSchema = exports.commonFields.cuid;
exports.emailSchema = exports.commonFields.email;
exports.dateTimeSchema = zod_1.z.string().datetime().or(zod_1.z.date());
exports.optionalString = zod_1.z.string().optional();
exports.optionalNumber = zod_1.z.number().optional();
exports.optionalBoolean = zod_1.z.boolean().optional();
