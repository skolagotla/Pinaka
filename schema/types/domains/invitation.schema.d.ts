import { z } from 'zod';
export declare const invitationMetadataSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
export declare const invitationCreateSchema: z.ZodObject<{
    email: z.ZodString;
    type: z.ZodEnum<{
        landlord: "landlord";
        tenant: "tenant";
        pmc: "pmc";
        vendor: "vendor";
        contractor: "contractor";
    }>;
    propertyId: z.ZodOptional<z.ZodString>;
    unitId: z.ZodOptional<z.ZodString>;
    expiresInDays: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const invitationUpdateSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        completed: "completed";
        sent: "sent";
        opened: "opened";
        expired: "expired";
        cancelled: "cancelled";
    }>>>;
    resend: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const invitationQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>>>;
    limit: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>>>;
    type: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        landlord: "landlord";
        tenant: "tenant";
        pmc: "pmc";
        vendor: "vendor";
        contractor: "contractor";
    }>>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        completed: "completed";
        sent: "sent";
        opened: "opened";
        expired: "expired";
        cancelled: "cancelled";
    }>>>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const invitationResponseSchema: z.ZodObject<{
    email: z.ZodString;
    type: z.ZodEnum<{
        landlord: "landlord";
        tenant: "tenant";
        pmc: "pmc";
        vendor: "vendor";
        contractor: "contractor";
    }>;
    propertyId: z.ZodOptional<z.ZodString>;
    unitId: z.ZodOptional<z.ZodString>;
    expiresInDays: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    id: z.ZodString;
    token: z.ZodString;
    status: z.ZodEnum<{
        pending: "pending";
        completed: "completed";
        sent: "sent";
        opened: "opened";
        expired: "expired";
        cancelled: "cancelled";
    }>;
    expiresAt: z.ZodNullable<z.ZodString>;
    openedAt: z.ZodNullable<z.ZodString>;
    completedAt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    invitedBy: z.ZodString;
    invitedByRole: z.ZodString;
    invitedByName: z.ZodOptional<z.ZodString>;
    invitedByEmail: z.ZodOptional<z.ZodString>;
    invitedByAdminId: z.ZodOptional<z.ZodString>;
    invitedByLandlordId: z.ZodOptional<z.ZodString>;
    invitedByPMCId: z.ZodOptional<z.ZodString>;
    landlordId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodString>;
    pmcId: z.ZodOptional<z.ZodString>;
    approvalStatus: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const invitationListResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodObject<{
        invitations: z.ZodArray<z.ZodObject<{
            email: z.ZodString;
            type: z.ZodEnum<{
                landlord: "landlord";
                tenant: "tenant";
                pmc: "pmc";
                vendor: "vendor";
                contractor: "contractor";
            }>;
            propertyId: z.ZodOptional<z.ZodString>;
            unitId: z.ZodOptional<z.ZodString>;
            expiresInDays: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodString;
            token: z.ZodString;
            status: z.ZodEnum<{
                pending: "pending";
                completed: "completed";
                sent: "sent";
                opened: "opened";
                expired: "expired";
                cancelled: "cancelled";
            }>;
            expiresAt: z.ZodNullable<z.ZodString>;
            openedAt: z.ZodNullable<z.ZodString>;
            completedAt: z.ZodNullable<z.ZodString>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
            invitedBy: z.ZodString;
            invitedByRole: z.ZodString;
            invitedByName: z.ZodOptional<z.ZodString>;
            invitedByEmail: z.ZodOptional<z.ZodString>;
            invitedByAdminId: z.ZodOptional<z.ZodString>;
            invitedByLandlordId: z.ZodOptional<z.ZodString>;
            invitedByPMCId: z.ZodOptional<z.ZodString>;
            landlordId: z.ZodOptional<z.ZodString>;
            tenantId: z.ZodOptional<z.ZodString>;
            pmcId: z.ZodOptional<z.ZodString>;
            approvalStatus: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        pagination: z.ZodObject<{
            page: z.ZodNumber;
            limit: z.ZodNumber;
            total: z.ZodNumber;
            totalPages: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type InvitationCreate = z.infer<typeof invitationCreateSchema>;
export type InvitationUpdate = z.infer<typeof invitationUpdateSchema>;
export type InvitationQuery = z.infer<typeof invitationQuerySchema>;
export type InvitationResponse = z.infer<typeof invitationResponseSchema>;
export type InvitationListResponse = z.infer<typeof invitationListResponseSchema>;
