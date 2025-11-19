/**
 * Conversation/Message Domain Schemas
 *
 * Single Source of Truth for Conversation and Message domain validation and types
 */
import { z } from 'zod';
/**
 * Conversation Type Enum
 */
export declare const conversationTypeSchema: z.ZodEnum<{
    LANDLORD_PMC: "LANDLORD_PMC";
    PMC_TENANT: "PMC_TENANT";
    LANDLORD_TENANT: "LANDLORD_TENANT";
}>;
/**
 * Conversation Status Enum
 */
export declare const conversationStatusSchema: z.ZodEnum<{
    ACTIVE: "ACTIVE";
    CLOSED: "CLOSED";
    ARCHIVED: "ARCHIVED";
}>;
/**
 * Message Attachment Schema
 */
export declare const messageAttachmentSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    fileName: z.ZodString;
    originalName: z.ZodString;
    fileType: z.ZodString;
    fileSize: z.ZodNumber;
    storagePath: z.ZodString;
    mimeType: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Message Create Schema
 */
export declare const messageCreateSchema: z.ZodObject<{
    conversationId: z.ZodString;
    messageText: z.ZodString;
    attachments: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        fileName: z.ZodString;
        originalName: z.ZodString;
        fileType: z.ZodString;
        fileSize: z.ZodNumber;
        storagePath: z.ZodString;
        mimeType: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>>;
}, z.core.$strip>;
/**
 * Conversation Create Schema
 */
export declare const conversationCreateSchema: z.ZodObject<{
    subject: z.ZodString;
    conversationType: z.ZodEnum<{
        LANDLORD_PMC: "LANDLORD_PMC";
        PMC_TENANT: "PMC_TENANT";
        LANDLORD_TENANT: "LANDLORD_TENANT";
    }>;
    propertyId: z.ZodOptional<z.ZodString>;
    landlordId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodString>;
    pmcId: z.ZodOptional<z.ZodString>;
    initialMessage: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Conversation Update Schema
 */
export declare const conversationUpdateSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        CLOSED: "CLOSED";
        ARCHIVED: "ARCHIVED";
    }>>;
    subject: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Conversation Query Schema
 */
export declare const conversationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        CLOSED: "CLOSED";
        ARCHIVED: "ARCHIVED";
    }>>;
    propertyId: z.ZodOptional<z.ZodString>;
    conversationType: z.ZodOptional<z.ZodEnum<{
        LANDLORD_PMC: "LANDLORD_PMC";
        PMC_TENANT: "PMC_TENANT";
        LANDLORD_TENANT: "LANDLORD_TENANT";
    }>>;
}, z.core.$strip>;
/**
 * Message Response Schema
 */
export declare const messageResponseSchema: z.ZodObject<{
    id: z.ZodString;
    conversationId: z.ZodString;
    senderId: z.ZodString;
    senderLandlordId: z.ZodNullable<z.ZodString>;
    senderTenantId: z.ZodNullable<z.ZodString>;
    senderPMCId: z.ZodNullable<z.ZodString>;
    senderRole: z.ZodEnum<{
        landlord: "landlord";
        tenant: "tenant";
        pmc: "pmc";
    }>;
    messageText: z.ZodString;
    readByLandlord: z.ZodBoolean;
    readByTenant: z.ZodBoolean;
    readByPMC: z.ZodBoolean;
    readAt: z.ZodNullable<z.ZodDate>;
    createdAt: z.ZodDate;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        fileName: z.ZodString;
        originalName: z.ZodString;
        fileType: z.ZodString;
        fileSize: z.ZodNumber;
        storagePath: z.ZodString;
        mimeType: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/**
 * Conversation Response Schema
 */
export declare const conversationResponseSchema: z.ZodObject<{
    id: z.ZodString;
    subject: z.ZodString;
    conversationType: z.ZodEnum<{
        LANDLORD_PMC: "LANDLORD_PMC";
        PMC_TENANT: "PMC_TENANT";
        LANDLORD_TENANT: "LANDLORD_TENANT";
    }>;
    status: z.ZodEnum<{
        ACTIVE: "ACTIVE";
        CLOSED: "CLOSED";
        ARCHIVED: "ARCHIVED";
    }>;
    propertyId: z.ZodNullable<z.ZodString>;
    landlordId: z.ZodNullable<z.ZodString>;
    tenantId: z.ZodNullable<z.ZodString>;
    pmcId: z.ZodNullable<z.ZodString>;
    lastMessageAt: z.ZodNullable<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    property: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        propertyName: z.ZodNullable<z.ZodString>;
        addressLine1: z.ZodString;
        city: z.ZodString;
    }, z.core.$strip>>>;
    landlord: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
    }, z.core.$strip>>>;
    tenant: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
    }, z.core.$strip>>>;
    pmc: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        companyName: z.ZodString;
        email: z.ZodString;
    }, z.core.$strip>>>;
    messages: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        conversationId: z.ZodString;
        senderId: z.ZodString;
        senderLandlordId: z.ZodNullable<z.ZodString>;
        senderTenantId: z.ZodNullable<z.ZodString>;
        senderPMCId: z.ZodNullable<z.ZodString>;
        senderRole: z.ZodEnum<{
            landlord: "landlord";
            tenant: "tenant";
            pmc: "pmc";
        }>;
        messageText: z.ZodString;
        readByLandlord: z.ZodBoolean;
        readByTenant: z.ZodBoolean;
        readByPMC: z.ZodBoolean;
        readAt: z.ZodNullable<z.ZodDate>;
        createdAt: z.ZodDate;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            fileName: z.ZodString;
            originalName: z.ZodString;
            fileType: z.ZodString;
            fileSize: z.ZodNumber;
            storagePath: z.ZodString;
            mimeType: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/**
 * Conversation List Response Schema
 */
export declare const conversationListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodString;
        conversationType: z.ZodEnum<{
            LANDLORD_PMC: "LANDLORD_PMC";
            PMC_TENANT: "PMC_TENANT";
            LANDLORD_TENANT: "LANDLORD_TENANT";
        }>;
        status: z.ZodEnum<{
            ACTIVE: "ACTIVE";
            CLOSED: "CLOSED";
            ARCHIVED: "ARCHIVED";
        }>;
        propertyId: z.ZodNullable<z.ZodString>;
        landlordId: z.ZodNullable<z.ZodString>;
        tenantId: z.ZodNullable<z.ZodString>;
        pmcId: z.ZodNullable<z.ZodString>;
        lastMessageAt: z.ZodNullable<z.ZodDate>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        property: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            propertyName: z.ZodNullable<z.ZodString>;
            addressLine1: z.ZodString;
            city: z.ZodString;
        }, z.core.$strip>>>;
        landlord: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
        }, z.core.$strip>>>;
        tenant: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
        }, z.core.$strip>>>;
        pmc: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            companyName: z.ZodString;
            email: z.ZodString;
        }, z.core.$strip>>>;
        messages: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            conversationId: z.ZodString;
            senderId: z.ZodString;
            senderLandlordId: z.ZodNullable<z.ZodString>;
            senderTenantId: z.ZodNullable<z.ZodString>;
            senderPMCId: z.ZodNullable<z.ZodString>;
            senderRole: z.ZodEnum<{
                landlord: "landlord";
                tenant: "tenant";
                pmc: "pmc";
            }>;
            messageText: z.ZodString;
            readByLandlord: z.ZodBoolean;
            readByTenant: z.ZodBoolean;
            readByPMC: z.ZodBoolean;
            readAt: z.ZodNullable<z.ZodDate>;
            createdAt: z.ZodDate;
            attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodOptional<z.ZodString>;
                fileName: z.ZodString;
                originalName: z.ZodString;
                fileType: z.ZodString;
                fileSize: z.ZodNumber;
                storagePath: z.ZodString;
                mimeType: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
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
 * Conversation Send Message Schema (supports both 'message' and 'messageText' for compatibility)
 */
export declare const conversationSendMessageSchema: z.ZodObject<{
    message: z.ZodOptional<z.ZodString>;
    messageText: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ConversationType = z.infer<typeof conversationTypeSchema>;
export type ConversationStatus = z.infer<typeof conversationStatusSchema>;
export type MessageAttachment = z.infer<typeof messageAttachmentSchema>;
export type MessageCreate = z.infer<typeof messageCreateSchema>;
export type ConversationCreate = z.infer<typeof conversationCreateSchema>;
export type ConversationUpdate = z.infer<typeof conversationUpdateSchema>;
export type ConversationQuery = z.infer<typeof conversationQuerySchema>;
export type MessageResponse = z.infer<typeof messageResponseSchema>;
export type ConversationResponse = z.infer<typeof conversationResponseSchema>;
export type ConversationListResponse = z.infer<typeof conversationListResponseSchema>;
export type ConversationSendMessage = z.infer<typeof conversationSendMessageSchema>;
