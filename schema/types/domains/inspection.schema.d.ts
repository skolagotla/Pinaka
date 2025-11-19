/**
 * Inspection Domain Schemas
 *
 * Single Source of Truth for Inspection domain validation and types
 */
import { z } from 'zod';
/**
 * Inspection Checklist Type Enum
 */
export declare const inspectionChecklistTypeSchema: z.ZodEnum<{
    "move-in": "move-in";
    "move-out": "move-out";
}>;
/**
 * Inspection Status Enum
 */
export declare const inspectionStatusSchema: z.ZodEnum<{
    pending: "pending";
    submitted: "submitted";
    approved: "approved";
    rejected: "rejected";
}>;
/**
 * Inspection Checklist Item Schema
 */
export declare const inspectionChecklistItemSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    itemId: z.ZodString;
    itemLabel: z.ZodString;
    category: z.ZodString;
    isChecked: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
    photos: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        comment: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    landlordNotes: z.ZodOptional<z.ZodString>;
    landlordApproval: z.ZodOptional<z.ZodEnum<{
        approved: "approved";
        rejected: "rejected";
    }>>;
    landlordApprovedAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
/**
 * Inspection Checklist Create Schema
 */
export declare const inspectionChecklistCreateSchema: z.ZodObject<{
    tenantId: z.ZodString;
    propertyId: z.ZodOptional<z.ZodString>;
    unitId: z.ZodOptional<z.ZodString>;
    leaseId: z.ZodOptional<z.ZodString>;
    checklistType: z.ZodEnum<{
        "move-in": "move-in";
        "move-out": "move-out";
    }>;
    inspectionDate: z.ZodOptional<z.ZodString>;
    isRequest: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Inspection Checklist Update Schema
 */
export declare const inspectionChecklistUpdateSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        submitted: "submitted";
        approved: "approved";
        rejected: "rejected";
    }>>;
    inspectionDate: z.ZodOptional<z.ZodString>;
    submittedAt: z.ZodOptional<z.ZodString>;
    approvedAt: z.ZodOptional<z.ZodString>;
    approvedBy: z.ZodOptional<z.ZodString>;
    approvedByName: z.ZodOptional<z.ZodString>;
    rejectionReason: z.ZodOptional<z.ZodString>;
    rejectedAt: z.ZodOptional<z.ZodString>;
    rejectedBy: z.ZodOptional<z.ZodString>;
    rejectedByName: z.ZodOptional<z.ZodString>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        itemId: z.ZodString;
        itemLabel: z.ZodString;
        category: z.ZodString;
        isChecked: z.ZodDefault<z.ZodBoolean>;
        notes: z.ZodOptional<z.ZodString>;
        photos: z.ZodOptional<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            comment: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        landlordNotes: z.ZodOptional<z.ZodString>;
        landlordApproval: z.ZodOptional<z.ZodEnum<{
            approved: "approved";
            rejected: "rejected";
        }>>;
        landlordApprovedAt: z.ZodOptional<z.ZodDate>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/**
 * Inspection Checklist Query Schema
 */
export declare const inspectionChecklistQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    propertyId: z.ZodOptional<z.ZodString>;
    unitId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodString>;
    leaseId: z.ZodOptional<z.ZodString>;
    checklistType: z.ZodOptional<z.ZodEnum<{
        "move-in": "move-in";
        "move-out": "move-out";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        submitted: "submitted";
        approved: "approved";
        rejected: "rejected";
    }>>;
}, z.core.$strip>;
/**
 * Inspection Checklist Response Schema
 */
export declare const inspectionChecklistResponseSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    propertyId: z.ZodNullable<z.ZodString>;
    unitId: z.ZodNullable<z.ZodString>;
    leaseId: z.ZodNullable<z.ZodString>;
    checklistType: z.ZodEnum<{
        "move-in": "move-in";
        "move-out": "move-out";
    }>;
    inspectionDate: z.ZodNullable<z.ZodDate>;
    status: z.ZodEnum<{
        pending: "pending";
        submitted: "submitted";
        approved: "approved";
        rejected: "rejected";
    }>;
    submittedAt: z.ZodNullable<z.ZodDate>;
    approvedAt: z.ZodNullable<z.ZodDate>;
    approvedBy: z.ZodNullable<z.ZodString>;
    approvedByName: z.ZodNullable<z.ZodString>;
    rejectionReason: z.ZodNullable<z.ZodString>;
    rejectedAt: z.ZodNullable<z.ZodDate>;
    rejectedBy: z.ZodNullable<z.ZodString>;
    rejectedByName: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    tenant: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
    }, z.core.$strip>>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        itemId: z.ZodString;
        itemLabel: z.ZodString;
        category: z.ZodString;
        isChecked: z.ZodDefault<z.ZodBoolean>;
        notes: z.ZodOptional<z.ZodString>;
        photos: z.ZodOptional<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            comment: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        landlordNotes: z.ZodOptional<z.ZodString>;
        landlordApproval: z.ZodOptional<z.ZodEnum<{
            approved: "approved";
            rejected: "rejected";
        }>>;
        landlordApprovedAt: z.ZodOptional<z.ZodDate>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/**
 * Inspection Checklist List Response Schema
 */
export declare const inspectionChecklistListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tenantId: z.ZodString;
        propertyId: z.ZodNullable<z.ZodString>;
        unitId: z.ZodNullable<z.ZodString>;
        leaseId: z.ZodNullable<z.ZodString>;
        checklistType: z.ZodEnum<{
            "move-in": "move-in";
            "move-out": "move-out";
        }>;
        inspectionDate: z.ZodNullable<z.ZodDate>;
        status: z.ZodEnum<{
            pending: "pending";
            submitted: "submitted";
            approved: "approved";
            rejected: "rejected";
        }>;
        submittedAt: z.ZodNullable<z.ZodDate>;
        approvedAt: z.ZodNullable<z.ZodDate>;
        approvedBy: z.ZodNullable<z.ZodString>;
        approvedByName: z.ZodNullable<z.ZodString>;
        rejectionReason: z.ZodNullable<z.ZodString>;
        rejectedAt: z.ZodNullable<z.ZodDate>;
        rejectedBy: z.ZodNullable<z.ZodString>;
        rejectedByName: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        tenant: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
        }, z.core.$strip>>;
        items: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            itemId: z.ZodString;
            itemLabel: z.ZodString;
            category: z.ZodString;
            isChecked: z.ZodDefault<z.ZodBoolean>;
            notes: z.ZodOptional<z.ZodString>;
            photos: z.ZodOptional<z.ZodArray<z.ZodObject<{
                url: z.ZodString;
                comment: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
            landlordNotes: z.ZodOptional<z.ZodString>;
            landlordApproval: z.ZodOptional<z.ZodEnum<{
                approved: "approved";
                rejected: "rejected";
            }>>;
            landlordApprovedAt: z.ZodOptional<z.ZodDate>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type InspectionChecklistType = z.infer<typeof inspectionChecklistTypeSchema>;
export type InspectionStatus = z.infer<typeof inspectionStatusSchema>;
export type InspectionChecklistItem = z.infer<typeof inspectionChecklistItemSchema>;
export type InspectionChecklistCreate = z.infer<typeof inspectionChecklistCreateSchema>;
export type InspectionChecklistUpdate = z.infer<typeof inspectionChecklistUpdateSchema>;
export type InspectionChecklistQuery = z.infer<typeof inspectionChecklistQuerySchema>;
export type InspectionChecklistResponse = z.infer<typeof inspectionChecklistResponseSchema>;
export type InspectionChecklistListResponse = z.infer<typeof inspectionChecklistListResponseSchema>;
export declare const inspectionCreateSchema: z.ZodObject<{
    tenantId: z.ZodString;
    propertyId: z.ZodOptional<z.ZodString>;
    unitId: z.ZodOptional<z.ZodString>;
    leaseId: z.ZodOptional<z.ZodString>;
    checklistType: z.ZodEnum<{
        "move-in": "move-in";
        "move-out": "move-out";
    }>;
    inspectionDate: z.ZodOptional<z.ZodString>;
    isRequest: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const inspectionUpdateSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        submitted: "submitted";
        approved: "approved";
        rejected: "rejected";
    }>>;
    inspectionDate: z.ZodOptional<z.ZodString>;
    submittedAt: z.ZodOptional<z.ZodString>;
    approvedAt: z.ZodOptional<z.ZodString>;
    approvedBy: z.ZodOptional<z.ZodString>;
    approvedByName: z.ZodOptional<z.ZodString>;
    rejectionReason: z.ZodOptional<z.ZodString>;
    rejectedAt: z.ZodOptional<z.ZodString>;
    rejectedBy: z.ZodOptional<z.ZodString>;
    rejectedByName: z.ZodOptional<z.ZodString>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        itemId: z.ZodString;
        itemLabel: z.ZodString;
        category: z.ZodString;
        isChecked: z.ZodDefault<z.ZodBoolean>;
        notes: z.ZodOptional<z.ZodString>;
        photos: z.ZodOptional<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            comment: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        landlordNotes: z.ZodOptional<z.ZodString>;
        landlordApproval: z.ZodOptional<z.ZodEnum<{
            approved: "approved";
            rejected: "rejected";
        }>>;
        landlordApprovedAt: z.ZodOptional<z.ZodDate>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const inspectionQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    propertyId: z.ZodOptional<z.ZodString>;
    unitId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodString>;
    leaseId: z.ZodOptional<z.ZodString>;
    checklistType: z.ZodOptional<z.ZodEnum<{
        "move-in": "move-in";
        "move-out": "move-out";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        submitted: "submitted";
        approved: "approved";
        rejected: "rejected";
    }>>;
}, z.core.$strip>;
export declare const inspectionResponseSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    propertyId: z.ZodNullable<z.ZodString>;
    unitId: z.ZodNullable<z.ZodString>;
    leaseId: z.ZodNullable<z.ZodString>;
    checklistType: z.ZodEnum<{
        "move-in": "move-in";
        "move-out": "move-out";
    }>;
    inspectionDate: z.ZodNullable<z.ZodDate>;
    status: z.ZodEnum<{
        pending: "pending";
        submitted: "submitted";
        approved: "approved";
        rejected: "rejected";
    }>;
    submittedAt: z.ZodNullable<z.ZodDate>;
    approvedAt: z.ZodNullable<z.ZodDate>;
    approvedBy: z.ZodNullable<z.ZodString>;
    approvedByName: z.ZodNullable<z.ZodString>;
    rejectionReason: z.ZodNullable<z.ZodString>;
    rejectedAt: z.ZodNullable<z.ZodDate>;
    rejectedBy: z.ZodNullable<z.ZodString>;
    rejectedByName: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    tenant: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
    }, z.core.$strip>>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        itemId: z.ZodString;
        itemLabel: z.ZodString;
        category: z.ZodString;
        isChecked: z.ZodDefault<z.ZodBoolean>;
        notes: z.ZodOptional<z.ZodString>;
        photos: z.ZodOptional<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            comment: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        landlordNotes: z.ZodOptional<z.ZodString>;
        landlordApproval: z.ZodOptional<z.ZodEnum<{
            approved: "approved";
            rejected: "rejected";
        }>>;
        landlordApprovedAt: z.ZodOptional<z.ZodDate>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const inspectionListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tenantId: z.ZodString;
        propertyId: z.ZodNullable<z.ZodString>;
        unitId: z.ZodNullable<z.ZodString>;
        leaseId: z.ZodNullable<z.ZodString>;
        checklistType: z.ZodEnum<{
            "move-in": "move-in";
            "move-out": "move-out";
        }>;
        inspectionDate: z.ZodNullable<z.ZodDate>;
        status: z.ZodEnum<{
            pending: "pending";
            submitted: "submitted";
            approved: "approved";
            rejected: "rejected";
        }>;
        submittedAt: z.ZodNullable<z.ZodDate>;
        approvedAt: z.ZodNullable<z.ZodDate>;
        approvedBy: z.ZodNullable<z.ZodString>;
        approvedByName: z.ZodNullable<z.ZodString>;
        rejectionReason: z.ZodNullable<z.ZodString>;
        rejectedAt: z.ZodNullable<z.ZodDate>;
        rejectedBy: z.ZodNullable<z.ZodString>;
        rejectedByName: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        tenant: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
        }, z.core.$strip>>;
        items: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            itemId: z.ZodString;
            itemLabel: z.ZodString;
            category: z.ZodString;
            isChecked: z.ZodDefault<z.ZodBoolean>;
            notes: z.ZodOptional<z.ZodString>;
            photos: z.ZodOptional<z.ZodArray<z.ZodObject<{
                url: z.ZodString;
                comment: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
            landlordNotes: z.ZodOptional<z.ZodString>;
            landlordApproval: z.ZodOptional<z.ZodEnum<{
                approved: "approved";
                rejected: "rejected";
            }>>;
            landlordApprovedAt: z.ZodOptional<z.ZodDate>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type InspectionCreate = InspectionChecklistCreate;
export type InspectionUpdate = InspectionChecklistUpdate;
export type InspectionQuery = InspectionChecklistQuery;
export type InspectionResponse = InspectionChecklistResponse;
export type InspectionListResponse = InspectionChecklistListResponse;
