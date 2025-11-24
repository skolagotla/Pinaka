import { z } from 'zod';
export declare const unitCreateSchema: z.ZodObject<{
    propertyId: z.ZodString;
    unitName: z.ZodString;
    floorNumber: z.ZodOptional<z.ZodNumber>;
    bedrooms: z.ZodOptional<z.ZodNumber>;
    bathrooms: z.ZodOptional<z.ZodNumber>;
    rentPrice: z.ZodOptional<z.ZodNumber>;
    depositAmount: z.ZodOptional<z.ZodNumber>;
    status: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const unitUpdateSchema: z.ZodObject<{
    propertyId: z.ZodOptional<z.ZodString>;
    unitName: z.ZodOptional<z.ZodString>;
    floorNumber: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    bedrooms: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    bathrooms: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    rentPrice: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    depositAmount: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodString>>>;
    id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const unitResponseSchema: z.ZodObject<{
    unitName: z.ZodString;
    floorNumber: z.ZodOptional<z.ZodNumber>;
    bedrooms: z.ZodOptional<z.ZodNumber>;
    bathrooms: z.ZodOptional<z.ZodNumber>;
    rentPrice: z.ZodOptional<z.ZodNumber>;
    depositAmount: z.ZodOptional<z.ZodNumber>;
    status: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    id: z.ZodString;
    propertyId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    property: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        propertyName: z.ZodOptional<z.ZodString>;
        addressLine1: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const unitQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    propertyId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const unitListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        unitName: z.ZodString;
        floorNumber: z.ZodOptional<z.ZodNumber>;
        bedrooms: z.ZodOptional<z.ZodNumber>;
        bathrooms: z.ZodOptional<z.ZodNumber>;
        rentPrice: z.ZodOptional<z.ZodNumber>;
        depositAmount: z.ZodOptional<z.ZodNumber>;
        status: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        id: z.ZodString;
        propertyId: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        property: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            propertyName: z.ZodOptional<z.ZodString>;
            addressLine1: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type UnitCreate = z.infer<typeof unitCreateSchema>;
export type UnitUpdate = z.infer<typeof unitUpdateSchema>;
export type UnitResponse = z.infer<typeof unitResponseSchema>;
export type UnitQuery = z.infer<typeof unitQuerySchema>;
export type UnitListResponse = z.infer<typeof unitListResponseSchema>;
