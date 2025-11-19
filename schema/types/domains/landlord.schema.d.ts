/**
 * Landlord Domain Schemas
 *
 * Single Source of Truth for Landlord domain validation and types
 */
import { z } from 'zod';
/**
 * Approval Status Enum (shared with tenants)
 */
export declare const approvalStatusSchema: z.ZodEnum<{
    PENDING: "PENDING";
    APPROVED: "APPROVED";
    REJECTED: "REJECTED";
}>;
/**
 * Landlord Create Schema
 */
export declare const landlordCreateSchema: z.ZodObject<{
    firstName: z.ZodString;
    middleName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    addressLine1: z.ZodOptional<z.ZodString>;
    addressLine2: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    postalZip: z.ZodOptional<z.ZodString>;
    provinceState: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    countryCode: z.ZodOptional<z.ZodString>;
    regionCode: z.ZodOptional<z.ZodString>;
    timezone: z.ZodDefault<z.ZodString>;
    theme: z.ZodDefault<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Landlord Update Schema (all fields optional)
 */
export declare const landlordUpdateSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    middleName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    addressLine1: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    addressLine2: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    postalZip: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    provinceState: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    country: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    countryCode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    regionCode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    timezone: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    theme: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    organizationId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    email: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Landlord Response Schema
 */
export declare const landlordResponseSchema: z.ZodObject<{
    id: z.ZodString;
    landlordId: z.ZodString;
    firstName: z.ZodString;
    middleName: z.ZodNullable<z.ZodString>;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodString>;
    addressLine1: z.ZodNullable<z.ZodString>;
    addressLine2: z.ZodNullable<z.ZodString>;
    city: z.ZodNullable<z.ZodString>;
    postalZip: z.ZodNullable<z.ZodString>;
    provinceState: z.ZodNullable<z.ZodString>;
    country: z.ZodNullable<z.ZodString>;
    countryCode: z.ZodNullable<z.ZodString>;
    regionCode: z.ZodNullable<z.ZodString>;
    timezone: z.ZodNullable<z.ZodString>;
    theme: z.ZodNullable<z.ZodString>;
    signatureFileName: z.ZodNullable<z.ZodString>;
    organizationId: z.ZodNullable<z.ZodString>;
    approvalStatus: z.ZodEnum<{
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>;
    approvedBy: z.ZodNullable<z.ZodString>;
    approvedAt: z.ZodNullable<z.ZodDate>;
    rejectedBy: z.ZodNullable<z.ZodString>;
    rejectedAt: z.ZodNullable<z.ZodDate>;
    rejectionReason: z.ZodNullable<z.ZodString>;
    invitedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, z.core.$strip>;
/**
 * Landlord List Response Schema
 */
export declare const landlordListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        landlordId: z.ZodString;
        firstName: z.ZodString;
        middleName: z.ZodNullable<z.ZodString>;
        lastName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
        addressLine1: z.ZodNullable<z.ZodString>;
        addressLine2: z.ZodNullable<z.ZodString>;
        city: z.ZodNullable<z.ZodString>;
        postalZip: z.ZodNullable<z.ZodString>;
        provinceState: z.ZodNullable<z.ZodString>;
        country: z.ZodNullable<z.ZodString>;
        countryCode: z.ZodNullable<z.ZodString>;
        regionCode: z.ZodNullable<z.ZodString>;
        timezone: z.ZodNullable<z.ZodString>;
        theme: z.ZodNullable<z.ZodString>;
        signatureFileName: z.ZodNullable<z.ZodString>;
        organizationId: z.ZodNullable<z.ZodString>;
        approvalStatus: z.ZodEnum<{
            PENDING: "PENDING";
            APPROVED: "APPROVED";
            REJECTED: "REJECTED";
        }>;
        approvedBy: z.ZodNullable<z.ZodString>;
        approvedAt: z.ZodNullable<z.ZodDate>;
        rejectedBy: z.ZodNullable<z.ZodString>;
        rejectedAt: z.ZodNullable<z.ZodDate>;
        rejectionReason: z.ZodNullable<z.ZodString>;
        invitedBy: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Landlord Query Parameters Schema
 */
export declare const landlordQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    approvalStatus: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
export type LandlordCreate = z.infer<typeof landlordCreateSchema>;
export type LandlordUpdate = z.infer<typeof landlordUpdateSchema>;
export type LandlordResponse = z.infer<typeof landlordResponseSchema>;
export type LandlordListResponse = z.infer<typeof landlordListResponseSchema>;
export type LandlordQuery = z.infer<typeof landlordQuerySchema>;
