import { z } from 'zod';
export declare const generatedFormCreateSchema: z.ZodObject<{
    formType: z.ZodString;
    tenantId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    leaseId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    propertyId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    unitId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    formData: z.ZodRecord<z.ZodString, z.ZodAny>;
    pdfUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        sent: "sent";
        finalized: "finalized";
        filed: "filed";
    }>>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    generatedBy: z.ZodString;
}, z.core.$strip>;
export declare const generatedFormUpdateSchema: z.ZodObject<{
    formType: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    leaseId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    propertyId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    unitId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    formData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    pdfUrl: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        sent: "sent";
        finalized: "finalized";
        filed: "filed";
    }>>>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const generatedFormQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>>>;
    limit: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>>>;
    formType: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tenantId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    propertyId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const generatedFormResponseSchema: z.ZodObject<{
    formType: z.ZodString;
    tenantId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    leaseId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    propertyId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    unitId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    formData: z.ZodRecord<z.ZodString, z.ZodAny>;
    pdfUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        sent: "sent";
        finalized: "finalized";
        filed: "filed";
    }>>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    id: z.ZodString;
    generatedBy: z.ZodString;
    generatedAt: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updatedAt: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    tenantName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tenantEmail: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    propertyAddress: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    propertyName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    propertyCity: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    propertyUnitCount: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    unitName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const generatedFormListResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    forms: z.ZodArray<z.ZodObject<{
        formType: z.ZodString;
        tenantId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        leaseId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        propertyId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        unitId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        formData: z.ZodRecord<z.ZodString, z.ZodAny>;
        pdfUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            draft: "draft";
            sent: "sent";
            finalized: "finalized";
            filed: "filed";
        }>>>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        id: z.ZodString;
        generatedBy: z.ZodString;
        generatedAt: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        updatedAt: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        tenantName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        tenantEmail: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        propertyAddress: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        propertyName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        propertyCity: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        propertyUnitCount: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        unitName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        total: z.ZodNumber;
        limit: z.ZodNumber;
        offset: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
export type GeneratedFormCreate = z.infer<typeof generatedFormCreateSchema>;
export type GeneratedFormUpdate = z.infer<typeof generatedFormUpdateSchema>;
export type GeneratedFormQuery = z.infer<typeof generatedFormQuerySchema>;
export type GeneratedFormResponse = z.infer<typeof generatedFormResponseSchema>;
export type GeneratedFormListResponse = z.infer<typeof generatedFormListResponseSchema>;
