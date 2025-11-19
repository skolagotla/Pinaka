/**
 * Expense Domain Schemas
 *
 * Single Source of Truth for Expense domain validation and types
 */
import { z } from 'zod';
/**
 * Expense Category Schema
 */
export declare const expenseCategorySchema: z.ZodString;
/**
 * Payment Method Schema
 */
export declare const expensePaymentMethodSchema: z.ZodOptional<z.ZodEnum<{
    Other: "Other";
    Cash: "Cash";
    Check: "Check";
    "Bank Transfer": "Bank Transfer";
    "Credit Card": "Credit Card";
    "Debit Card": "Debit Card";
    "Online Payment": "Online Payment";
}>>;
/**
 * Recurring Frequency Schema
 */
export declare const recurringFrequencySchema: z.ZodOptional<z.ZodEnum<{
    Monthly: "Monthly";
    Quarterly: "Quarterly";
    Yearly: "Yearly";
    Weekly: "Weekly";
    "Bi-weekly": "Bi-weekly";
}>>;
/**
 * Expense Create Schema
 */
export declare const expenseCreateSchema: z.ZodObject<{
    propertyId: z.ZodOptional<z.ZodString>;
    maintenanceRequestId: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    amount: z.ZodNumber;
    date: z.ZodString;
    description: z.ZodString;
    receiptUrl: z.ZodOptional<z.ZodString>;
    paidTo: z.ZodOptional<z.ZodString>;
    paymentMethod: z.ZodOptional<z.ZodEnum<{
        Other: "Other";
        Cash: "Cash";
        Check: "Check";
        "Bank Transfer": "Bank Transfer";
        "Credit Card": "Credit Card";
        "Debit Card": "Debit Card";
        "Online Payment": "Online Payment";
    }>>;
    isRecurring: z.ZodDefault<z.ZodBoolean>;
    recurringFrequency: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        Monthly: "Monthly";
        Quarterly: "Quarterly";
        Yearly: "Yearly";
        Weekly: "Weekly";
        "Bi-weekly": "Bi-weekly";
    }>>>;
    vendorId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Expense Update Schema
 */
export declare const expenseUpdateSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    date: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    receiptUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    paidTo: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    paymentMethod: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        Other: "Other";
        Cash: "Cash";
        Check: "Check";
        "Bank Transfer": "Bank Transfer";
        "Credit Card": "Credit Card";
        "Debit Card": "Debit Card";
        "Online Payment": "Online Payment";
    }>>>;
    isRecurring: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    recurringFrequency: z.ZodOptional<z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        Monthly: "Monthly";
        Quarterly: "Quarterly";
        Yearly: "Yearly";
        Weekly: "Weekly";
        "Bi-weekly": "Bi-weekly";
    }>>>>;
    vendorId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    propertyId: z.ZodOptional<z.ZodString>;
    maintenanceRequestId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Expense Query Schema
 */
export declare const expenseQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    propertyId: z.ZodOptional<z.ZodString>;
    maintenanceRequestId: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    landlordId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Expense Response Schema
 */
export declare const expenseResponseSchema: z.ZodObject<{
    id: z.ZodString;
    propertyId: z.ZodNullable<z.ZodString>;
    maintenanceRequestId: z.ZodNullable<z.ZodString>;
    category: z.ZodString;
    amount: z.ZodNumber;
    date: z.ZodDate;
    description: z.ZodString;
    receiptUrl: z.ZodNullable<z.ZodString>;
    paidTo: z.ZodNullable<z.ZodString>;
    paymentMethod: z.ZodNullable<z.ZodString>;
    isRecurring: z.ZodBoolean;
    recurringFrequency: z.ZodNullable<z.ZodString>;
    createdBy: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    createdByPMC: z.ZodBoolean;
    pmcId: z.ZodNullable<z.ZodString>;
    pmcApprovalRequestId: z.ZodNullable<z.ZodString>;
    property: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        propertyName: z.ZodNullable<z.ZodString>;
        addressLine1: z.ZodString;
        unitCount: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    maintenanceRequest: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        ticketNumber: z.ZodNullable<z.ZodString>;
        title: z.ZodString;
        category: z.ZodString;
        status: z.ZodString;
        property: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            propertyName: z.ZodNullable<z.ZodString>;
            addressLine1: z.ZodString;
            unitCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
    pmcApprovalRequest: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        status: z.ZodString;
        requestedAt: z.ZodDate;
        approvedAt: z.ZodNullable<z.ZodDate>;
        rejectedAt: z.ZodNullable<z.ZodDate>;
        rejectionReason: z.ZodNullable<z.ZodString>;
        approvalNotes: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/**
 * Expense List Response Schema
 */
export declare const expenseListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        propertyId: z.ZodNullable<z.ZodString>;
        maintenanceRequestId: z.ZodNullable<z.ZodString>;
        category: z.ZodString;
        amount: z.ZodNumber;
        date: z.ZodDate;
        description: z.ZodString;
        receiptUrl: z.ZodNullable<z.ZodString>;
        paidTo: z.ZodNullable<z.ZodString>;
        paymentMethod: z.ZodNullable<z.ZodString>;
        isRecurring: z.ZodBoolean;
        recurringFrequency: z.ZodNullable<z.ZodString>;
        createdBy: z.ZodString;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        createdByPMC: z.ZodBoolean;
        pmcId: z.ZodNullable<z.ZodString>;
        pmcApprovalRequestId: z.ZodNullable<z.ZodString>;
        property: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            propertyName: z.ZodNullable<z.ZodString>;
            addressLine1: z.ZodString;
            unitCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>;
        maintenanceRequest: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            ticketNumber: z.ZodNullable<z.ZodString>;
            title: z.ZodString;
            category: z.ZodString;
            status: z.ZodString;
            property: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                propertyName: z.ZodNullable<z.ZodString>;
                addressLine1: z.ZodString;
                unitCount: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
        }, z.core.$strip>>>;
        pmcApprovalRequest: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            status: z.ZodString;
            requestedAt: z.ZodDate;
            approvedAt: z.ZodNullable<z.ZodDate>;
            rejectedAt: z.ZodNullable<z.ZodDate>;
            rejectionReason: z.ZodNullable<z.ZodString>;
            approvalNotes: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type ExpensePaymentMethod = z.infer<typeof expensePaymentMethodSchema>;
export type RecurringFrequency = z.infer<typeof recurringFrequencySchema>;
export type ExpenseCreate = z.infer<typeof expenseCreateSchema>;
export type ExpenseUpdate = z.infer<typeof expenseUpdateSchema>;
export type ExpenseQuery = z.infer<typeof expenseQuerySchema>;
export type ExpenseResponse = z.infer<typeof expenseResponseSchema>;
export type ExpenseListResponse = z.infer<typeof expenseListResponseSchema>;
