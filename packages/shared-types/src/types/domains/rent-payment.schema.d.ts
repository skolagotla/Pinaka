/**
 * Rent Payment Domain Schemas
 *
 * Single Source of Truth for Rent Payment domain validation and types
 */
import { z } from 'zod';
/**
 * Payment Status Enum
 */
export declare const paymentStatusSchema: z.ZodEnum<{
    Unpaid: "Unpaid";
    Paid: "Paid";
    Partial: "Partial";
    Overdue: "Overdue";
    Cancelled: "Cancelled";
}>;
/**
 * Partial Payment Schema
 */
export declare const partialPaymentSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
    paidDate: z.ZodString;
    paymentMethod: z.ZodOptional<z.ZodEnum<{
        Other: "Other";
        Cash: "Cash";
        Check: "Check";
        "Bank Transfer": "Bank Transfer";
        "Credit Card": "Credit Card";
        "Debit Card": "Debit Card";
        "Online Payment": "Online Payment";
    }>>;
    referenceNumber: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Rent Payment Create Schema
 */
export declare const rentPaymentCreateSchema: z.ZodObject<{
    leaseId: z.ZodString;
    amount: z.ZodNumber;
    dueDate: z.ZodString;
    paidDate: z.ZodOptional<z.ZodString>;
    paymentMethod: z.ZodOptional<z.ZodEnum<{
        Other: "Other";
        Cash: "Cash";
        Check: "Check";
        "Bank Transfer": "Bank Transfer";
        "Credit Card": "Credit Card";
        "Debit Card": "Debit Card";
        "Online Payment": "Online Payment";
    }>>;
    referenceNumber: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        Unpaid: "Unpaid";
        Paid: "Paid";
        Partial: "Partial";
        Overdue: "Overdue";
        Cancelled: "Cancelled";
    }>>;
    notes: z.ZodOptional<z.ZodString>;
    partialAmountPaid: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Rent Payment Update Schema
 */
export declare const rentPaymentUpdateSchema: z.ZodObject<{
    amount: z.ZodOptional<z.ZodNumber>;
    dueDate: z.ZodOptional<z.ZodString>;
    paidDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    paymentMethod: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        Other: "Other";
        Cash: "Cash";
        Check: "Check";
        "Bank Transfer": "Bank Transfer";
        "Credit Card": "Credit Card";
        "Debit Card": "Debit Card";
        "Online Payment": "Online Payment";
    }>>>;
    referenceNumber: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        Unpaid: "Unpaid";
        Paid: "Paid";
        Partial: "Partial";
        Overdue: "Overdue";
        Cancelled: "Cancelled";
    }>>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    partialAmountPaid: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    leaseId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Record Payment Schema (mark as paid)
 */
export declare const recordPaymentSchema: z.ZodObject<{
    paidDate: z.ZodString;
    paymentMethod: z.ZodEnum<{
        Other: "Other";
        Cash: "Cash";
        Check: "Check";
        "Bank Transfer": "Bank Transfer";
        "Credit Card": "Credit Card";
        "Debit Card": "Debit Card";
        "Online Payment": "Online Payment";
    }>;
    referenceNumber: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Partial Payment Create Schema
 */
export declare const createPartialPaymentSchema: z.ZodObject<{
    amount: z.ZodNumber;
    paidDate: z.ZodString;
    paymentMethod: z.ZodOptional<z.ZodEnum<{
        Other: "Other";
        Cash: "Cash";
        Check: "Check";
        "Bank Transfer": "Bank Transfer";
        "Credit Card": "Credit Card";
        "Debit Card": "Debit Card";
        "Online Payment": "Online Payment";
    }>>;
    referenceNumber: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Rent Payment Response Schema
 */
export declare const rentPaymentResponseSchema: z.ZodObject<{
    id: z.ZodString;
    leaseId: z.ZodString;
    amount: z.ZodNumber;
    dueDate: z.ZodDate;
    paidDate: z.ZodNullable<z.ZodDate>;
    paymentMethod: z.ZodNullable<z.ZodString>;
    referenceNumber: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<{
        Unpaid: "Unpaid";
        Paid: "Paid";
        Partial: "Partial";
        Overdue: "Overdue";
        Cancelled: "Cancelled";
    }>;
    notes: z.ZodNullable<z.ZodString>;
    receiptNumber: z.ZodNullable<z.ZodString>;
    receiptSent: z.ZodBoolean;
    receiptSentAt: z.ZodNullable<z.ZodDate>;
    overdueReminderSent: z.ZodBoolean;
    overdueReminderSentAt: z.ZodNullable<z.ZodDate>;
    reminderSent: z.ZodBoolean;
    reminderSentAt: z.ZodNullable<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    partialPayments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        amount: z.ZodNumber;
        paidDate: z.ZodString;
        paymentMethod: z.ZodOptional<z.ZodEnum<{
            Other: "Other";
            Cash: "Cash";
            Check: "Check";
            "Bank Transfer": "Bank Transfer";
            "Credit Card": "Credit Card";
            "Debit Card": "Debit Card";
            "Online Payment": "Online Payment";
        }>>;
        referenceNumber: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    lease: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        leaseStart: z.ZodDate;
        leaseEnd: z.ZodNullable<z.ZodDate>;
        rentAmount: z.ZodNumber;
        status: z.ZodString;
        unit: z.ZodObject<{
            id: z.ZodString;
            unitName: z.ZodString;
            property: z.ZodObject<{
                id: z.ZodString;
                propertyName: z.ZodNullable<z.ZodString>;
                addressLine1: z.ZodString;
                city: z.ZodString;
                provinceState: z.ZodNullable<z.ZodString>;
            }, z.core.$strip>;
        }, z.core.$strip>;
        leaseTenants: z.ZodOptional<z.ZodArray<z.ZodObject<{
            tenantId: z.ZodString;
            isPrimaryTenant: z.ZodBoolean;
            tenant: z.ZodObject<{
                id: z.ZodString;
                firstName: z.ZodString;
                lastName: z.ZodString;
                email: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    totalPartialPaid: z.ZodOptional<z.ZodNumber>;
    stripePayment: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
/**
 * Rent Payment List Response Schema
 */
export declare const rentPaymentListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        leaseId: z.ZodString;
        amount: z.ZodNumber;
        dueDate: z.ZodDate;
        paidDate: z.ZodNullable<z.ZodDate>;
        paymentMethod: z.ZodNullable<z.ZodString>;
        referenceNumber: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            Unpaid: "Unpaid";
            Paid: "Paid";
            Partial: "Partial";
            Overdue: "Overdue";
            Cancelled: "Cancelled";
        }>;
        notes: z.ZodNullable<z.ZodString>;
        receiptNumber: z.ZodNullable<z.ZodString>;
        receiptSent: z.ZodBoolean;
        receiptSentAt: z.ZodNullable<z.ZodDate>;
        overdueReminderSent: z.ZodBoolean;
        overdueReminderSentAt: z.ZodNullable<z.ZodDate>;
        reminderSent: z.ZodBoolean;
        reminderSentAt: z.ZodNullable<z.ZodDate>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        partialPayments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            amount: z.ZodNumber;
            paidDate: z.ZodString;
            paymentMethod: z.ZodOptional<z.ZodEnum<{
                Other: "Other";
                Cash: "Cash";
                Check: "Check";
                "Bank Transfer": "Bank Transfer";
                "Credit Card": "Credit Card";
                "Debit Card": "Debit Card";
                "Online Payment": "Online Payment";
            }>>;
            referenceNumber: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        lease: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            leaseStart: z.ZodDate;
            leaseEnd: z.ZodNullable<z.ZodDate>;
            rentAmount: z.ZodNumber;
            status: z.ZodString;
            unit: z.ZodObject<{
                id: z.ZodString;
                unitName: z.ZodString;
                property: z.ZodObject<{
                    id: z.ZodString;
                    propertyName: z.ZodNullable<z.ZodString>;
                    addressLine1: z.ZodString;
                    city: z.ZodString;
                    provinceState: z.ZodNullable<z.ZodString>;
                }, z.core.$strip>;
            }, z.core.$strip>;
            leaseTenants: z.ZodOptional<z.ZodArray<z.ZodObject<{
                tenantId: z.ZodString;
                isPrimaryTenant: z.ZodBoolean;
                tenant: z.ZodObject<{
                    id: z.ZodString;
                    firstName: z.ZodString;
                    lastName: z.ZodString;
                    email: z.ZodString;
                }, z.core.$strip>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        totalPartialPaid: z.ZodOptional<z.ZodNumber>;
        stripePayment: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Rent Payment Query Parameters Schema
 */
export declare const rentPaymentQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    leaseId: z.ZodOptional<z.ZodString>;
    propertyId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        Unpaid: "Unpaid";
        Paid: "Paid";
        Partial: "Partial";
        Overdue: "Overdue";
        Cancelled: "Cancelled";
    }>>;
    landlordId: z.ZodOptional<z.ZodString>;
    dueDateFrom: z.ZodOptional<z.ZodString>;
    dueDateTo: z.ZodOptional<z.ZodString>;
    paidDateFrom: z.ZodOptional<z.ZodString>;
    paidDateTo: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PartialPayment = z.infer<typeof partialPaymentSchema>;
export type RentPaymentCreate = z.infer<typeof rentPaymentCreateSchema>;
export type RentPaymentUpdate = z.infer<typeof rentPaymentUpdateSchema>;
export type RecordPayment = z.infer<typeof recordPaymentSchema>;
export type CreatePartialPayment = z.infer<typeof createPartialPaymentSchema>;
export type RentPaymentResponse = z.infer<typeof rentPaymentResponseSchema>;
export type RentPaymentListResponse = z.infer<typeof rentPaymentListResponseSchema>;
export type RentPaymentQuery = z.infer<typeof rentPaymentQuerySchema>;
