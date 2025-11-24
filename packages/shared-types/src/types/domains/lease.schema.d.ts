/**
 * Lease Domain Schemas
 *
 * Single Source of Truth for Lease domain validation and types
 */
import { z } from 'zod';
/**
 * Lease Status Enum
 */
export declare const leaseStatusSchema: z.ZodEnum<{
    Active: "Active";
    Expired: "Expired";
    Terminated: "Terminated";
    Pending: "Pending";
    Draft: "Draft";
}>;
/**
 * Payment Method Enum
 */
export declare const paymentMethodSchema: z.ZodEnum<{
    Other: "Other";
    Cash: "Cash";
    Check: "Check";
    "Bank Transfer": "Bank Transfer";
    "Credit Card": "Credit Card";
    "Debit Card": "Debit Card";
    "Online Payment": "Online Payment";
}>;
/**
 * Renewal Decision Enum
 */
export declare const renewalDecisionSchema: z.ZodEnum<{
    renew: "renew";
    terminate: "terminate";
    month_to_month: "month_to_month";
}>;
/**
 * Lease Tenant Schema (for lease-tenant relationships)
 */
export declare const leaseTenantSchema: z.ZodObject<{
    tenantId: z.ZodString;
    isPrimaryTenant: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Lease Create Schema
 */
export declare const leaseCreateSchema: z.ZodObject<{
    unitId: z.ZodString;
    leaseStart: z.ZodString;
    leaseEnd: z.ZodOptional<z.ZodString>;
    rentAmount: z.ZodNumber;
    rentDueDay: z.ZodDefault<z.ZodNumber>;
    securityDeposit: z.ZodOptional<z.ZodNumber>;
    paymentMethod: z.ZodOptional<z.ZodEnum<{
        Other: "Other";
        Cash: "Cash";
        Check: "Check";
        "Bank Transfer": "Bank Transfer";
        "Credit Card": "Credit Card";
        "Debit Card": "Debit Card";
        "Online Payment": "Online Payment";
    }>>;
    status: z.ZodDefault<z.ZodEnum<{
        Active: "Active";
        Expired: "Expired";
        Terminated: "Terminated";
        Pending: "Pending";
        Draft: "Draft";
    }>>;
    tenantIds: z.ZodArray<z.ZodString>;
    primaryTenantId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Lease Update Schema (all fields optional)
 */
export declare const leaseUpdateSchema: z.ZodObject<{
    leaseStart: z.ZodOptional<z.ZodString>;
    leaseEnd: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    rentAmount: z.ZodOptional<z.ZodNumber>;
    rentDueDay: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    securityDeposit: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    paymentMethod: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        Other: "Other";
        Cash: "Cash";
        Check: "Check";
        "Bank Transfer": "Bank Transfer";
        "Credit Card": "Credit Card";
        "Debit Card": "Debit Card";
        "Online Payment": "Online Payment";
    }>>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        Active: "Active";
        Expired: "Expired";
        Terminated: "Terminated";
        Pending: "Pending";
        Draft: "Draft";
    }>>>;
    tenantIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    primaryTenantId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    unitId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Lease Response Schema
 */
export declare const leaseResponseSchema: z.ZodObject<{
    id: z.ZodString;
    unitId: z.ZodString;
    leaseStart: z.ZodDate;
    leaseEnd: z.ZodNullable<z.ZodDate>;
    rentAmount: z.ZodNumber;
    rentDueDay: z.ZodNumber;
    securityDeposit: z.ZodNullable<z.ZodNumber>;
    paymentMethod: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<{
        Active: "Active";
        Expired: "Expired";
        Terminated: "Terminated";
        Pending: "Pending";
        Draft: "Draft";
    }>;
    renewalReminderSent: z.ZodBoolean;
    renewalReminderSentAt: z.ZodNullable<z.ZodDate>;
    renewalDecision: z.ZodNullable<z.ZodEnum<{
        renew: "renew";
        terminate: "terminate";
        month_to_month: "month_to_month";
    }>>;
    renewalDecisionAt: z.ZodNullable<z.ZodDate>;
    renewalDecisionBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    leaseTenants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        leaseId: z.ZodString;
        tenantId: z.ZodString;
        isPrimaryTenant: z.ZodBoolean;
        addedAt: z.ZodDate;
        tenant: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
            phone: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
    unit: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        unitName: z.ZodString;
        floorNumber: z.ZodNullable<z.ZodNumber>;
        bedrooms: z.ZodNullable<z.ZodNumber>;
        bathrooms: z.ZodNullable<z.ZodNumber>;
        rentPrice: z.ZodNullable<z.ZodNumber>;
        status: z.ZodString;
        property: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            propertyName: z.ZodNullable<z.ZodString>;
            addressLine1: z.ZodString;
            city: z.ZodString;
            provinceState: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Lease List Response Schema
 */
export declare const leaseListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        unitId: z.ZodString;
        leaseStart: z.ZodDate;
        leaseEnd: z.ZodNullable<z.ZodDate>;
        rentAmount: z.ZodNumber;
        rentDueDay: z.ZodNumber;
        securityDeposit: z.ZodNullable<z.ZodNumber>;
        paymentMethod: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            Active: "Active";
            Expired: "Expired";
            Terminated: "Terminated";
            Pending: "Pending";
            Draft: "Draft";
        }>;
        renewalReminderSent: z.ZodBoolean;
        renewalReminderSentAt: z.ZodNullable<z.ZodDate>;
        renewalDecision: z.ZodNullable<z.ZodEnum<{
            renew: "renew";
            terminate: "terminate";
            month_to_month: "month_to_month";
        }>>;
        renewalDecisionAt: z.ZodNullable<z.ZodDate>;
        renewalDecisionBy: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        leaseTenants: z.ZodOptional<z.ZodArray<z.ZodObject<{
            leaseId: z.ZodString;
            tenantId: z.ZodString;
            isPrimaryTenant: z.ZodBoolean;
            addedAt: z.ZodDate;
            tenant: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                firstName: z.ZodString;
                lastName: z.ZodString;
                email: z.ZodString;
                phone: z.ZodNullable<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>>>;
        unit: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            unitName: z.ZodString;
            floorNumber: z.ZodNullable<z.ZodNumber>;
            bedrooms: z.ZodNullable<z.ZodNumber>;
            bathrooms: z.ZodNullable<z.ZodNumber>;
            rentPrice: z.ZodNullable<z.ZodNumber>;
            status: z.ZodString;
            property: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                propertyName: z.ZodNullable<z.ZodString>;
                addressLine1: z.ZodString;
                city: z.ZodString;
                provinceState: z.ZodNullable<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Lease Query Parameters Schema
 */
export declare const leaseQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    unitId: z.ZodOptional<z.ZodString>;
    propertyId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        Active: "Active";
        Expired: "Expired";
        Terminated: "Terminated";
        Pending: "Pending";
        Draft: "Draft";
    }>>;
    landlordId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Lease Renewal Schema
 */
export declare const leaseRenewalSchema: z.ZodObject<{
    decision: z.ZodEnum<{
        renew: "renew";
        terminate: "terminate";
        "month-to-month": "month-to-month";
    }>;
    newLeaseEnd: z.ZodOptional<z.ZodString>;
    newRentAmount: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Lease Termination Schema
 */
export declare const leaseTerminationSchema: z.ZodObject<{
    reason: z.ZodString;
    terminationDate: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    actualLoss: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type LeaseStatus = z.infer<typeof leaseStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type RenewalDecision = z.infer<typeof renewalDecisionSchema>;
export type LeaseTenant = z.infer<typeof leaseTenantSchema>;
export type LeaseCreate = z.infer<typeof leaseCreateSchema>;
export type LeaseUpdate = z.infer<typeof leaseUpdateSchema>;
export type LeaseResponse = z.infer<typeof leaseResponseSchema>;
export type LeaseListResponse = z.infer<typeof leaseListResponseSchema>;
export type LeaseQuery = z.infer<typeof leaseQuerySchema>;
export type LeaseRenewal = z.infer<typeof leaseRenewalSchema>;
export type LeaseTermination = z.infer<typeof leaseTerminationSchema>;
