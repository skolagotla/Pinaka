/**
 * Application Domain Schemas
 *
 * Single Source of Truth for Application domain validation and types
 */
import { z } from 'zod';
/**
 * Application Status Enum
 */
export declare const applicationStatusSchema: z.ZodEnum<{
    submitted: "submitted";
    approved: "approved";
    rejected: "rejected";
    draft: "draft";
    under_review: "under_review";
    withdrawn: "withdrawn";
}>;
/**
 * Application Create Schema
 */
export declare const applicationCreateSchema: z.ZodObject<{
    unitId: z.ZodString;
    applicantEmail: z.ZodString;
    applicantName: z.ZodString;
    applicantPhone: z.ZodOptional<z.ZodString>;
    coApplicantIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
/**
 * Application Update Schema
 */
export declare const applicationUpdateSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        submitted: "submitted";
        approved: "approved";
        rejected: "rejected";
        draft: "draft";
        under_review: "under_review";
        withdrawn: "withdrawn";
    }>>;
    screeningRequested: z.ZodOptional<z.ZodBoolean>;
    screeningProvider: z.ZodOptional<z.ZodString>;
    screeningStatus: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        completed: "completed";
        failed: "failed";
    }>>;
    approvedAt: z.ZodOptional<z.ZodString>;
    approvedBy: z.ZodOptional<z.ZodString>;
    approvedByType: z.ZodOptional<z.ZodString>;
    approvedByEmail: z.ZodOptional<z.ZodString>;
    approvedByName: z.ZodOptional<z.ZodString>;
    rejectedAt: z.ZodOptional<z.ZodString>;
    rejectedBy: z.ZodOptional<z.ZodString>;
    rejectedByType: z.ZodOptional<z.ZodString>;
    rejectedByEmail: z.ZodOptional<z.ZodString>;
    rejectedByName: z.ZodOptional<z.ZodString>;
    rejectionReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Application Query Schema
 */
export declare const applicationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    unitId: z.ZodOptional<z.ZodString>;
    propertyId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        submitted: "submitted";
        approved: "approved";
        rejected: "rejected";
        draft: "draft";
        under_review: "under_review";
        withdrawn: "withdrawn";
    }>>;
    applicantEmail: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Application Response Schema
 */
export declare const applicationResponseSchema: z.ZodObject<{
    id: z.ZodString;
    unitId: z.ZodString;
    propertyId: z.ZodString;
    applicantId: z.ZodNullable<z.ZodString>;
    applicantEmail: z.ZodString;
    applicantName: z.ZodString;
    applicantPhone: z.ZodNullable<z.ZodString>;
    coApplicantIds: z.ZodArray<z.ZodString>;
    status: z.ZodEnum<{
        submitted: "submitted";
        approved: "approved";
        rejected: "rejected";
        draft: "draft";
        under_review: "under_review";
        withdrawn: "withdrawn";
    }>;
    deadline: z.ZodDate;
    screeningRequested: z.ZodBoolean;
    screeningRequestedAt: z.ZodNullable<z.ZodDate>;
    screeningProvider: z.ZodNullable<z.ZodString>;
    screeningStatus: z.ZodNullable<z.ZodString>;
    screeningData: z.ZodNullable<z.ZodAny>;
    approvedAt: z.ZodNullable<z.ZodDate>;
    approvedBy: z.ZodNullable<z.ZodString>;
    approvedByType: z.ZodNullable<z.ZodString>;
    approvedByEmail: z.ZodNullable<z.ZodString>;
    approvedByName: z.ZodNullable<z.ZodString>;
    rejectedAt: z.ZodNullable<z.ZodDate>;
    rejectedBy: z.ZodNullable<z.ZodString>;
    rejectedByType: z.ZodNullable<z.ZodString>;
    rejectedByEmail: z.ZodNullable<z.ZodString>;
    rejectedByName: z.ZodNullable<z.ZodString>;
    rejectionReason: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    unit: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        unitName: z.ZodString;
    }, z.core.$strip>>;
    property: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        propertyName: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    lease: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        status: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/**
 * Application List Response Schema
 */
export declare const applicationListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        unitId: z.ZodString;
        propertyId: z.ZodString;
        applicantId: z.ZodNullable<z.ZodString>;
        applicantEmail: z.ZodString;
        applicantName: z.ZodString;
        applicantPhone: z.ZodNullable<z.ZodString>;
        coApplicantIds: z.ZodArray<z.ZodString>;
        status: z.ZodEnum<{
            submitted: "submitted";
            approved: "approved";
            rejected: "rejected";
            draft: "draft";
            under_review: "under_review";
            withdrawn: "withdrawn";
        }>;
        deadline: z.ZodDate;
        screeningRequested: z.ZodBoolean;
        screeningRequestedAt: z.ZodNullable<z.ZodDate>;
        screeningProvider: z.ZodNullable<z.ZodString>;
        screeningStatus: z.ZodNullable<z.ZodString>;
        screeningData: z.ZodNullable<z.ZodAny>;
        approvedAt: z.ZodNullable<z.ZodDate>;
        approvedBy: z.ZodNullable<z.ZodString>;
        approvedByType: z.ZodNullable<z.ZodString>;
        approvedByEmail: z.ZodNullable<z.ZodString>;
        approvedByName: z.ZodNullable<z.ZodString>;
        rejectedAt: z.ZodNullable<z.ZodDate>;
        rejectedBy: z.ZodNullable<z.ZodString>;
        rejectedByType: z.ZodNullable<z.ZodString>;
        rejectedByEmail: z.ZodNullable<z.ZodString>;
        rejectedByName: z.ZodNullable<z.ZodString>;
        rejectionReason: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        unit: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            unitName: z.ZodString;
        }, z.core.$strip>>;
        property: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            propertyName: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        lease: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            status: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Application Approval Schema
 */
export declare const applicationApprovalSchema: z.ZodOptional<z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
    approvedBy: z.ZodOptional<z.ZodString>;
}, z.core.$strip>>;
/**
 * Application Rejection Schema
 */
export declare const applicationRejectionSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
export type ApplicationCreate = z.infer<typeof applicationCreateSchema>;
export type ApplicationUpdate = z.infer<typeof applicationUpdateSchema>;
export type ApplicationQuery = z.infer<typeof applicationQuerySchema>;
export type ApplicationResponse = z.infer<typeof applicationResponseSchema>;
export type ApplicationListResponse = z.infer<typeof applicationListResponseSchema>;
export type ApplicationApproval = z.infer<typeof applicationApprovalSchema>;
export type ApplicationRejection = z.infer<typeof applicationRejectionSchema>;
