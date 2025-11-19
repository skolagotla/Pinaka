/**
 * Document Domain Schemas
 *
 * Single Source of Truth for Document domain validation and types
 */
import { z } from 'zod';
/**
 * Document Visibility Enum
 */
export declare const documentVisibilitySchema: z.ZodEnum<{
    shared: "shared";
    "tenant-only": "tenant-only";
    "landlord-only": "landlord-only";
}>;
/**
 * Document Create Schema (for API)
 */
export declare const documentCreateSchema: z.ZodObject<{
    tenantId: z.ZodString;
    propertyId: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    subcategory: z.ZodOptional<z.ZodString>;
    description: z.ZodDefault<z.ZodString>;
    expirationDate: z.ZodOptional<z.ZodString>;
    isRequired: z.ZodDefault<z.ZodBoolean>;
    visibility: z.ZodDefault<z.ZodEnum<{
        shared: "shared";
        "tenant-only": "tenant-only";
        "landlord-only": "landlord-only";
    }>>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    fileName: z.ZodOptional<z.ZodString>;
    originalName: z.ZodOptional<z.ZodString>;
    fileType: z.ZodOptional<z.ZodString>;
    fileSize: z.ZodOptional<z.ZodNumber>;
    storagePath: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Document Update Schema
 */
export declare const documentUpdateSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    subcategory: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    expirationDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isRequired: z.ZodOptional<z.ZodBoolean>;
    visibility: z.ZodOptional<z.ZodEnum<{
        shared: "shared";
        "tenant-only": "tenant-only";
        "landlord-only": "landlord-only";
    }>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    isVerified: z.ZodOptional<z.ZodBoolean>;
    verificationComment: z.ZodOptional<z.ZodString>;
    isRejected: z.ZodOptional<z.ZodBoolean>;
    rejectionReason: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
/**
 * Document Query Schema
 */
export declare const documentQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    tenantId: z.ZodOptional<z.ZodString>;
    propertyId: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    subcategory: z.ZodOptional<z.ZodString>;
    isRequired: z.ZodOptional<z.ZodBoolean>;
    isVerified: z.ZodOptional<z.ZodBoolean>;
    isDeleted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    expirationDateFrom: z.ZodOptional<z.ZodString>;
    expirationDateTo: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Document Response Schema
 */
export declare const documentResponseSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    propertyId: z.ZodNullable<z.ZodString>;
    fileName: z.ZodString;
    originalName: z.ZodString;
    fileType: z.ZodString;
    fileSize: z.ZodNumber;
    category: z.ZodString;
    subcategory: z.ZodNullable<z.ZodString>;
    description: z.ZodString;
    storagePath: z.ZodString;
    uploadedAt: z.ZodDate;
    updatedAt: z.ZodDate;
    canLandlordDelete: z.ZodBoolean;
    canTenantDelete: z.ZodBoolean;
    expirationDate: z.ZodNullable<z.ZodDate>;
    isRequired: z.ZodBoolean;
    isVerified: z.ZodBoolean;
    reminderSent: z.ZodBoolean;
    reminderSentAt: z.ZodNullable<z.ZodDate>;
    visibility: z.ZodString;
    tags: z.ZodArray<z.ZodString>;
    uploadedBy: z.ZodString;
    uploadedByEmail: z.ZodString;
    uploadedByName: z.ZodString;
    verifiedAt: z.ZodNullable<z.ZodDate>;
    verifiedBy: z.ZodNullable<z.ZodString>;
    verifiedByName: z.ZodNullable<z.ZodString>;
    verifiedByRole: z.ZodNullable<z.ZodString>;
    isRejected: z.ZodBoolean;
    rejectedAt: z.ZodNullable<z.ZodDate>;
    rejectedBy: z.ZodNullable<z.ZodString>;
    rejectedByName: z.ZodNullable<z.ZodString>;
    rejectedByRole: z.ZodNullable<z.ZodString>;
    rejectionReason: z.ZodNullable<z.ZodString>;
    verificationComment: z.ZodNullable<z.ZodString>;
    documentHash: z.ZodNullable<z.ZodString>;
    metadata: z.ZodNullable<z.ZodString>;
    isDeleted: z.ZodBoolean;
    deletedAt: z.ZodNullable<z.ZodDate>;
    deletedBy: z.ZodNullable<z.ZodString>;
    deletedByEmail: z.ZodNullable<z.ZodString>;
    deletedByName: z.ZodNullable<z.ZodString>;
    deletionReason: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
/**
 * Document List Response Schema
 */
export declare const documentListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tenantId: z.ZodString;
        propertyId: z.ZodNullable<z.ZodString>;
        fileName: z.ZodString;
        originalName: z.ZodString;
        fileType: z.ZodString;
        fileSize: z.ZodNumber;
        category: z.ZodString;
        subcategory: z.ZodNullable<z.ZodString>;
        description: z.ZodString;
        storagePath: z.ZodString;
        uploadedAt: z.ZodDate;
        updatedAt: z.ZodDate;
        canLandlordDelete: z.ZodBoolean;
        canTenantDelete: z.ZodBoolean;
        expirationDate: z.ZodNullable<z.ZodDate>;
        isRequired: z.ZodBoolean;
        isVerified: z.ZodBoolean;
        reminderSent: z.ZodBoolean;
        reminderSentAt: z.ZodNullable<z.ZodDate>;
        visibility: z.ZodString;
        tags: z.ZodArray<z.ZodString>;
        uploadedBy: z.ZodString;
        uploadedByEmail: z.ZodString;
        uploadedByName: z.ZodString;
        verifiedAt: z.ZodNullable<z.ZodDate>;
        verifiedBy: z.ZodNullable<z.ZodString>;
        verifiedByName: z.ZodNullable<z.ZodString>;
        verifiedByRole: z.ZodNullable<z.ZodString>;
        isRejected: z.ZodBoolean;
        rejectedAt: z.ZodNullable<z.ZodDate>;
        rejectedBy: z.ZodNullable<z.ZodString>;
        rejectedByName: z.ZodNullable<z.ZodString>;
        rejectedByRole: z.ZodNullable<z.ZodString>;
        rejectionReason: z.ZodNullable<z.ZodString>;
        verificationComment: z.ZodNullable<z.ZodString>;
        documentHash: z.ZodNullable<z.ZodString>;
        metadata: z.ZodNullable<z.ZodString>;
        isDeleted: z.ZodBoolean;
        deletedAt: z.ZodNullable<z.ZodDate>;
        deletedBy: z.ZodNullable<z.ZodString>;
        deletedByEmail: z.ZodNullable<z.ZodString>;
        deletedByName: z.ZodNullable<z.ZodString>;
        deletionReason: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Document Message Schema
 */
export declare const documentMessageSchema: z.ZodObject<{
    message: z.ZodString;
}, z.core.$strip>;
/**
 * Document Approve Deletion Schema
 */
export declare const documentApproveDeletionSchema: z.ZodObject<{
    reason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Document Mutual Approve Schema
 */
export declare const documentMutualApproveSchema: z.ZodObject<{
    comment: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Document Promote Version Schema
 */
export declare const documentPromoteVersionSchema: z.ZodObject<{
    versionIndex: z.ZodNumber;
}, z.core.$strip>;
export type DocumentVisibility = z.infer<typeof documentVisibilitySchema>;
export type DocumentCreate = z.infer<typeof documentCreateSchema>;
export type DocumentUpdate = z.infer<typeof documentUpdateSchema>;
export type DocumentQuery = z.infer<typeof documentQuerySchema>;
export type DocumentResponse = z.infer<typeof documentResponseSchema>;
export type DocumentListResponse = z.infer<typeof documentListResponseSchema>;
export type DocumentMessage = z.infer<typeof documentMessageSchema>;
export type DocumentApproveDeletion = z.infer<typeof documentApproveDeletionSchema>;
export type DocumentMutualApprove = z.infer<typeof documentMutualApproveSchema>;
export type DocumentPromoteVersion = z.infer<typeof documentPromoteVersionSchema>;
