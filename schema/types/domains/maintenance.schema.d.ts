/**
 * Maintenance Request Domain Schemas
 *
 * Single Source of Truth for Maintenance Request domain validation and types
 */
import { z } from 'zod';
/**
 * Maintenance Priority Enum
 */
export declare const maintenancePrioritySchema: z.ZodEnum<{
    Low: "Low";
    Medium: "Medium";
    High: "High";
    Urgent: "Urgent";
}>;
/**
 * Maintenance Status Enum
 */
export declare const maintenanceStatusSchema: z.ZodEnum<{
    Pending: "Pending";
    Cancelled: "Cancelled";
    New: "New";
    "In Progress": "In Progress";
    Completed: "Completed";
    "On Hold": "On Hold";
}>;
/**
 * Maintenance Category Schema
 */
export declare const maintenanceCategorySchema: z.ZodString;
/**
 * Maintenance Request Create Schema
 */
export declare const maintenanceRequestCreateSchema: z.ZodObject<{
    propertyId: z.ZodString;
    tenantId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodString;
    priority: z.ZodDefault<z.ZodEnum<{
        Low: "Low";
        Medium: "Medium";
        High: "High";
        Urgent: "Urgent";
    }>>;
    status: z.ZodDefault<z.ZodEnum<{
        Pending: "Pending";
        Cancelled: "Cancelled";
        New: "New";
        "In Progress": "In Progress";
        Completed: "Completed";
        "On Hold": "On Hold";
    }>>;
    requestedDate: z.ZodOptional<z.ZodString>;
    scheduledDate: z.ZodOptional<z.ZodString>;
    estimatedCost: z.ZodOptional<z.ZodNumber>;
    initiatedBy: z.ZodDefault<z.ZodEnum<{
        landlord: "landlord";
        tenant: "tenant";
        pmc: "pmc";
    }>>;
    photos: z.ZodOptional<z.ZodArray<z.ZodString>>;
    beforePhotos: z.ZodOptional<z.ZodArray<z.ZodString>>;
    afterPhotos: z.ZodOptional<z.ZodArray<z.ZodString>>;
    assignedToProviderId: z.ZodOptional<z.ZodString>;
    assignedToVendorId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Maintenance Request Update Schema
 */
export declare const maintenanceRequestUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        Low: "Low";
        Medium: "Medium";
        High: "High";
        Urgent: "Urgent";
    }>>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        Pending: "Pending";
        Cancelled: "Cancelled";
        New: "New";
        "In Progress": "In Progress";
        Completed: "Completed";
        "On Hold": "On Hold";
    }>>>;
    requestedDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    scheduledDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    estimatedCost: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    initiatedBy: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        landlord: "landlord";
        tenant: "tenant";
        pmc: "pmc";
    }>>>;
    photos: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    beforePhotos: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    afterPhotos: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    assignedToProviderId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    assignedToVendorId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    propertyId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodString>;
    completedDate: z.ZodOptional<z.ZodString>;
    actualCost: z.ZodOptional<z.ZodNumber>;
    tenantApproved: z.ZodOptional<z.ZodBoolean>;
    landlordApproved: z.ZodOptional<z.ZodBoolean>;
    completionNotes: z.ZodOptional<z.ZodString>;
    tenantFeedback: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Maintenance Request Query Schema
 */
export declare const maintenanceRequestQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    propertyId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        Pending: "Pending";
        Cancelled: "Cancelled";
        New: "New";
        "In Progress": "In Progress";
        Completed: "Completed";
        "On Hold": "On Hold";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        Low: "Low";
        Medium: "Medium";
        High: "High";
        Urgent: "Urgent";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    landlordId: z.ZodOptional<z.ZodString>;
    assignedToProviderId: z.ZodOptional<z.ZodString>;
    requestedDateFrom: z.ZodOptional<z.ZodString>;
    requestedDateTo: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Maintenance Comment Schema
 */
export declare const maintenanceCommentSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    comment: z.ZodString;
    authorEmail: z.ZodString;
    authorName: z.ZodString;
    authorRole: z.ZodEnum<{
        landlord: "landlord";
        tenant: "tenant";
        pmc: "pmc";
        vendor: "vendor";
    }>;
    isStatusUpdate: z.ZodDefault<z.ZodBoolean>;
    oldStatus: z.ZodOptional<z.ZodString>;
    newStatus: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
/**
 * Maintenance Request Response Schema
 */
export declare const maintenanceRequestResponseSchema: z.ZodObject<{
    id: z.ZodString;
    propertyId: z.ZodString;
    tenantId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodString;
    priority: z.ZodEnum<{
        Low: "Low";
        Medium: "Medium";
        High: "High";
        Urgent: "Urgent";
    }>;
    status: z.ZodEnum<{
        Pending: "Pending";
        Cancelled: "Cancelled";
        New: "New";
        "In Progress": "In Progress";
        Completed: "Completed";
        "On Hold": "On Hold";
    }>;
    requestedDate: z.ZodDate;
    completedDate: z.ZodNullable<z.ZodDate>;
    tenantApproved: z.ZodBoolean;
    landlordApproved: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    ticketNumber: z.ZodNullable<z.ZodString>;
    initiatedBy: z.ZodString;
    actualCost: z.ZodNullable<z.ZodNumber>;
    estimatedCost: z.ZodNullable<z.ZodNumber>;
    scheduledDate: z.ZodNullable<z.ZodDate>;
    rating: z.ZodNullable<z.ZodNumber>;
    tenantFeedback: z.ZodNullable<z.ZodString>;
    completionNotes: z.ZodNullable<z.ZodString>;
    assignedToVendorId: z.ZodNullable<z.ZodString>;
    assignedToProviderId: z.ZodNullable<z.ZodString>;
    photos: z.ZodNullable<z.ZodAny>;
    beforePhotos: z.ZodNullable<z.ZodAny>;
    afterPhotos: z.ZodNullable<z.ZodAny>;
    tenant: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    property: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        propertyName: z.ZodNullable<z.ZodString>;
        addressLine1: z.ZodString;
        city: z.ZodString;
        provinceState: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    assignedToProvider: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodNullable<z.ZodString>;
        phone: z.ZodNullable<z.ZodString>;
        type: z.ZodString;
    }, z.core.$strip>>>;
    comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        comment: z.ZodString;
        authorEmail: z.ZodString;
        authorName: z.ZodString;
        authorRole: z.ZodEnum<{
            landlord: "landlord";
            tenant: "tenant";
            pmc: "pmc";
            vendor: "vendor";
        }>;
        isStatusUpdate: z.ZodDefault<z.ZodBoolean>;
        oldStatus: z.ZodOptional<z.ZodString>;
        newStatus: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodDate>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/**
 * Maintenance Request List Response Schema
 */
export declare const maintenanceRequestListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        propertyId: z.ZodString;
        tenantId: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        category: z.ZodString;
        priority: z.ZodEnum<{
            Low: "Low";
            Medium: "Medium";
            High: "High";
            Urgent: "Urgent";
        }>;
        status: z.ZodEnum<{
            Pending: "Pending";
            Cancelled: "Cancelled";
            New: "New";
            "In Progress": "In Progress";
            Completed: "Completed";
            "On Hold": "On Hold";
        }>;
        requestedDate: z.ZodDate;
        completedDate: z.ZodNullable<z.ZodDate>;
        tenantApproved: z.ZodBoolean;
        landlordApproved: z.ZodBoolean;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        ticketNumber: z.ZodNullable<z.ZodString>;
        initiatedBy: z.ZodString;
        actualCost: z.ZodNullable<z.ZodNumber>;
        estimatedCost: z.ZodNullable<z.ZodNumber>;
        scheduledDate: z.ZodNullable<z.ZodDate>;
        rating: z.ZodNullable<z.ZodNumber>;
        tenantFeedback: z.ZodNullable<z.ZodString>;
        completionNotes: z.ZodNullable<z.ZodString>;
        assignedToVendorId: z.ZodNullable<z.ZodString>;
        assignedToProviderId: z.ZodNullable<z.ZodString>;
        photos: z.ZodNullable<z.ZodAny>;
        beforePhotos: z.ZodNullable<z.ZodAny>;
        afterPhotos: z.ZodNullable<z.ZodAny>;
        tenant: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
            phone: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        property: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            propertyName: z.ZodNullable<z.ZodString>;
            addressLine1: z.ZodString;
            city: z.ZodString;
            provinceState: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        assignedToProvider: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            email: z.ZodNullable<z.ZodString>;
            phone: z.ZodNullable<z.ZodString>;
            type: z.ZodString;
        }, z.core.$strip>>>;
        comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            comment: z.ZodString;
            authorEmail: z.ZodString;
            authorName: z.ZodString;
            authorRole: z.ZodEnum<{
                landlord: "landlord";
                tenant: "tenant";
                pmc: "pmc";
                vendor: "vendor";
            }>;
            isStatusUpdate: z.ZodDefault<z.ZodBoolean>;
            oldStatus: z.ZodOptional<z.ZodString>;
            newStatus: z.ZodOptional<z.ZodString>;
            createdAt: z.ZodOptional<z.ZodDate>;
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
 * Maintenance Comment Add Schema
 */
export declare const maintenanceCommentAddSchema: z.ZodObject<{
    comment: z.ZodString;
    authorInfo: z.ZodOptional<z.ZodObject<{
        authorEmail: z.ZodOptional<z.ZodString>;
        authorName: z.ZodOptional<z.ZodString>;
        authorRole: z.ZodOptional<z.ZodEnum<{
            landlord: "landlord";
            tenant: "tenant";
            pmc: "pmc";
            vendor: "vendor";
        }>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Maintenance Mark Viewed Schema
 */
export declare const maintenanceMarkViewedSchema: z.ZodObject<{
    role: z.ZodEnum<{
        landlord: "landlord";
        tenant: "tenant";
        pmc: "pmc";
    }>;
}, z.core.$strip>;
/**
 * Maintenance Approval Schema
 */
export declare const maintenanceApprovalSchema: z.ZodOptional<z.ZodObject<{
    approvedAmount: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>>;
export type MaintenancePriority = z.infer<typeof maintenancePrioritySchema>;
export type MaintenanceStatus = z.infer<typeof maintenanceStatusSchema>;
export type MaintenanceRequestCreate = z.infer<typeof maintenanceRequestCreateSchema>;
export type MaintenanceRequestUpdate = z.infer<typeof maintenanceRequestUpdateSchema>;
export type MaintenanceRequestQuery = z.infer<typeof maintenanceRequestQuerySchema>;
export type MaintenanceComment = z.infer<typeof maintenanceCommentSchema>;
export type MaintenanceRequestResponse = z.infer<typeof maintenanceRequestResponseSchema>;
export type MaintenanceRequestListResponse = z.infer<typeof maintenanceRequestListResponseSchema>;
export type MaintenanceCommentAdd = z.infer<typeof maintenanceCommentAddSchema>;
export type MaintenanceMarkViewed = z.infer<typeof maintenanceMarkViewedSchema>;
export type MaintenanceApproval = z.infer<typeof maintenanceApprovalSchema>;
export type MaintenanceCreate = MaintenanceRequestCreate;
export type MaintenanceUpdate = MaintenanceRequestUpdate;
export type MaintenanceQuery = MaintenanceRequestQuery;
export type MaintenanceResponse = MaintenanceRequestResponse;
export type MaintenanceListResponse = MaintenanceRequestListResponse;
