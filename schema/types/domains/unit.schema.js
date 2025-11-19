"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitListResponseSchema = exports.unitQuerySchema = exports.unitResponseSchema = exports.unitUpdateSchema = exports.unitCreateSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
// Unit Schema (nested under Property domain)
exports.unitCreateSchema = zod_1.z.object({
    propertyId: base_1.cuidSchema,
    unitName: zod_1.z.string().min(1, "Unit name is required"),
    floorNumber: base_1.optionalNumber,
    bedrooms: base_1.optionalNumber,
    bathrooms: base_1.optionalNumber,
    rentPrice: zod_1.z.number().min(0, "Rent price must be non-negative").optional(),
    depositAmount: zod_1.z.number().min(0, "Deposit amount must be non-negative").optional(),
    status: zod_1.z.string().optional().default("Vacant"),
});
exports.unitUpdateSchema = exports.unitCreateSchema.extend({
    id: base_1.cuidSchema,
}).partial();
exports.unitResponseSchema = exports.unitCreateSchema.extend({
    id: base_1.cuidSchema,
    propertyId: base_1.cuidSchema,
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    property: zod_1.z.object({
        id: base_1.cuidSchema,
        propertyName: base_1.optionalString,
        addressLine1: zod_1.z.string(),
    }).optional(),
});
exports.unitQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive()).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().int().positive().max(1000)).default(50),
    propertyId: base_1.cuidSchema.optional(),
    status: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
});
exports.unitListResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.array(exports.unitResponseSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
