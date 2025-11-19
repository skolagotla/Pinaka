"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatedFormListResponseSchema = exports.generatedFormResponseSchema = exports.generatedFormQuerySchema = exports.generatedFormUpdateSchema = exports.generatedFormCreateSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
// Base Generated Form Schema
const baseGeneratedFormSchema = zod_1.z.object({
    formType: zod_1.z.string().min(1, "Form type is required"),
    tenantId: base_1.cuidSchema.optional().nullable(),
    leaseId: base_1.cuidSchema.optional().nullable(),
    propertyId: base_1.cuidSchema.optional().nullable(),
    unitId: base_1.cuidSchema.optional().nullable(),
    formData: zod_1.z.record(zod_1.z.string(), zod_1.z.any()), // JSON data
    pdfUrl: base_1.optionalString.nullable(),
    status: zod_1.z.enum(['draft', 'finalized', 'sent', 'filed']).optional().default('draft'),
    notes: base_1.optionalString.nullable(),
});
// Schema for creating a generated form
exports.generatedFormCreateSchema = baseGeneratedFormSchema.extend({
    generatedBy: base_1.cuidSchema, // Set by backend from user context
});
// Schema for updating a generated form
exports.generatedFormUpdateSchema = baseGeneratedFormSchema.extend({
    id: base_1.cuidSchema,
}).partial();
// Schema for querying generated forms
exports.generatedFormQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).optional().default(1),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(1000)).optional().default(50),
    formType: base_1.optionalString,
    status: base_1.optionalString,
    tenantId: base_1.optionalString,
    propertyId: base_1.optionalString,
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
}).partial();
// Schema for a single generated form response
exports.generatedFormResponseSchema = baseGeneratedFormSchema.extend({
    id: base_1.cuidSchema,
    generatedBy: base_1.cuidSchema,
    generatedAt: base_1.dateTimeSchema,
    updatedAt: base_1.dateTimeSchema,
    tenantName: base_1.optionalString.nullable(),
    tenantEmail: base_1.optionalString.nullable(),
    propertyAddress: base_1.optionalString.nullable(),
    propertyName: base_1.optionalString.nullable(),
    propertyCity: base_1.optionalString.nullable(),
    propertyUnitCount: base_1.optionalNumber.nullable(),
    unitName: base_1.optionalString.nullable(),
});
// Schema for a list of generated forms response
exports.generatedFormListResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    forms: zod_1.z.array(exports.generatedFormResponseSchema),
    pagination: zod_1.z.object({
        total: zod_1.z.number().int().min(0),
        limit: zod_1.z.number().int().min(1),
        offset: zod_1.z.number().int().min(0),
        hasMore: zod_1.z.boolean(),
    }),
});
