/**
 * Base Schema Definitions
 *
 * Common schemas and utilities used across all domain schemas
 */
import { z } from 'zod';
/**
 * Common validation patterns
 */
export declare const patterns: {
    readonly cuid: RegExp;
    readonly email: RegExp;
    readonly canadianPostalCode: RegExp;
    readonly usZipCode: RegExp;
    readonly phone: RegExp;
};
/**
 * Common field schemas
 */
export declare const commonFields: {
    readonly id: z.ZodString;
    readonly cuid: z.ZodString;
    readonly email: z.ZodString;
    readonly phone: z.ZodOptional<z.ZodString>;
    readonly date: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    readonly dateString: z.ZodString;
    readonly positiveNumber: z.ZodNumber;
    readonly nonNegativeNumber: z.ZodNumber;
    readonly url: z.ZodString;
    readonly json: z.ZodAny;
};
/**
 * Pagination schema
 */
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type PaginationInput = z.infer<typeof paginationSchema>;
/**
 * Standard API response wrapper
 */
export declare const apiResponseSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>>;
    meta: z.ZodOptional<z.ZodObject<{
        timestamp: z.ZodString;
        version: z.ZodDefault<z.ZodString>;
        requestId: z.ZodOptional<z.ZodString>;
        pagination: z.ZodOptional<z.ZodObject<{
            page: z.ZodDefault<z.ZodNumber>;
            limit: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Standard error response
 */
export declare const errorResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>;
    meta: z.ZodOptional<z.ZodObject<{
        timestamp: z.ZodString;
        version: z.ZodDefault<z.ZodString>;
        requestId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
/**
 * Convenience exports for common schemas
 */
export declare const cuidSchema: z.ZodString;
export declare const emailSchema: z.ZodString;
export declare const dateTimeSchema: z.ZodUnion<[z.ZodString, z.ZodDate]>;
export declare const optionalString: z.ZodOptional<z.ZodString>;
export declare const optionalNumber: z.ZodOptional<z.ZodNumber>;
export declare const optionalBoolean: z.ZodOptional<z.ZodBoolean>;
