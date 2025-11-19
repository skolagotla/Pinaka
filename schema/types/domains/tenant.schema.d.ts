/**
 * Tenant Domain Schemas
 *
 * Single Source of Truth for Tenant domain validation and types
 */
import { z } from 'zod';
/**
 * Approval Status Enum
 */
export declare const approvalStatusSchema: z.ZodEnum<{
    PENDING: "PENDING";
    APPROVED: "APPROVED";
    REJECTED: "REJECTED";
}>;
/**
 * Employment Status Enum
 */
export declare const employmentStatusSchema: z.ZodEnum<{
    Other: "Other";
    "Full-time": "Full-time";
    "Part-time": "Part-time";
    "Self-employed": "Self-employed";
    Unemployed: "Unemployed";
    Student: "Student";
    Retired: "Retired";
}>;
/**
 * Emergency Contact Schema
 */
export declare const emergencyContactSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    relationship: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Employer Schema
 */
export declare const employerSchema: z.ZodObject<{
    companyName: z.ZodString;
    position: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    monthlyIncome: z.ZodOptional<z.ZodNumber>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Tenant Create Schema
 */
export declare const tenantCreateSchema: z.ZodObject<{
    firstName: z.ZodString;
    middleName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    currentAddress: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    postalZip: z.ZodOptional<z.ZodString>;
    provinceState: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    countryCode: z.ZodOptional<z.ZodString>;
    regionCode: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    numberOfAdults: z.ZodOptional<z.ZodNumber>;
    numberOfChildren: z.ZodOptional<z.ZodNumber>;
    moveInDate: z.ZodOptional<z.ZodString>;
    leaseTerm: z.ZodOptional<z.ZodString>;
    emergencyContactName: z.ZodOptional<z.ZodString>;
    emergencyContactPhone: z.ZodOptional<z.ZodString>;
    employmentStatus: z.ZodOptional<z.ZodEnum<{
        Other: "Other";
        "Full-time": "Full-time";
        "Part-time": "Part-time";
        "Self-employed": "Self-employed";
        Unemployed: "Unemployed";
        Student: "Student";
        Retired: "Retired";
    }>>;
    monthlyIncome: z.ZodOptional<z.ZodNumber>;
    timezone: z.ZodDefault<z.ZodString>;
    emergencyContacts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodString;
        relationship: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    employers: z.ZodOptional<z.ZodArray<z.ZodObject<{
        companyName: z.ZodString;
        position: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        monthlyIncome: z.ZodOptional<z.ZodNumber>;
        phone: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/**
 * Tenant Update Schema (all fields optional)
 */
export declare const tenantUpdateSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    middleName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    currentAddress: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    postalZip: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    provinceState: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    country: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    countryCode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    regionCode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    dateOfBirth: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    numberOfAdults: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    numberOfChildren: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    moveInDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    leaseTerm: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    emergencyContactName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    emergencyContactPhone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    employmentStatus: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        Other: "Other";
        "Full-time": "Full-time";
        "Part-time": "Part-time";
        "Self-employed": "Self-employed";
        Unemployed: "Unemployed";
        Student: "Student";
        Retired: "Retired";
    }>>>;
    monthlyIncome: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    timezone: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    emergencyContacts: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodString;
        relationship: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>>;
    employers: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        companyName: z.ZodString;
        position: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        monthlyIncome: z.ZodOptional<z.ZodNumber>;
        phone: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>>;
    email: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Tenant Response Schema
 */
export declare const tenantResponseSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    firstName: z.ZodString;
    middleName: z.ZodNullable<z.ZodString>;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodString>;
    currentAddress: z.ZodNullable<z.ZodString>;
    city: z.ZodNullable<z.ZodString>;
    postalZip: z.ZodNullable<z.ZodString>;
    provinceState: z.ZodNullable<z.ZodString>;
    country: z.ZodNullable<z.ZodString>;
    countryCode: z.ZodNullable<z.ZodString>;
    regionCode: z.ZodNullable<z.ZodString>;
    dateOfBirth: z.ZodNullable<z.ZodDate>;
    numberOfAdults: z.ZodNullable<z.ZodNumber>;
    numberOfChildren: z.ZodNullable<z.ZodNumber>;
    moveInDate: z.ZodNullable<z.ZodDate>;
    leaseTerm: z.ZodNullable<z.ZodString>;
    emergencyContactName: z.ZodNullable<z.ZodString>;
    emergencyContactPhone: z.ZodNullable<z.ZodString>;
    employmentStatus: z.ZodNullable<z.ZodString>;
    monthlyIncome: z.ZodNullable<z.ZodNumber>;
    invitationToken: z.ZodNullable<z.ZodString>;
    invitationSentAt: z.ZodNullable<z.ZodDate>;
    invitedBy: z.ZodNullable<z.ZodString>;
    hasAccess: z.ZodBoolean;
    lastLoginAt: z.ZodNullable<z.ZodDate>;
    timezone: z.ZodNullable<z.ZodString>;
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
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    leaseTenants: z.ZodOptional<z.ZodArray<z.ZodAny>>;
    emergencyContacts: z.ZodOptional<z.ZodArray<z.ZodAny>>;
    employers: z.ZodOptional<z.ZodArray<z.ZodAny>>;
}, z.core.$strip>;
/**
 * Tenant List Response Schema
 */
export declare const tenantListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tenantId: z.ZodString;
        firstName: z.ZodString;
        middleName: z.ZodNullable<z.ZodString>;
        lastName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
        currentAddress: z.ZodNullable<z.ZodString>;
        city: z.ZodNullable<z.ZodString>;
        postalZip: z.ZodNullable<z.ZodString>;
        provinceState: z.ZodNullable<z.ZodString>;
        country: z.ZodNullable<z.ZodString>;
        countryCode: z.ZodNullable<z.ZodString>;
        regionCode: z.ZodNullable<z.ZodString>;
        dateOfBirth: z.ZodNullable<z.ZodDate>;
        numberOfAdults: z.ZodNullable<z.ZodNumber>;
        numberOfChildren: z.ZodNullable<z.ZodNumber>;
        moveInDate: z.ZodNullable<z.ZodDate>;
        leaseTerm: z.ZodNullable<z.ZodString>;
        emergencyContactName: z.ZodNullable<z.ZodString>;
        emergencyContactPhone: z.ZodNullable<z.ZodString>;
        employmentStatus: z.ZodNullable<z.ZodString>;
        monthlyIncome: z.ZodNullable<z.ZodNumber>;
        invitationToken: z.ZodNullable<z.ZodString>;
        invitationSentAt: z.ZodNullable<z.ZodDate>;
        invitedBy: z.ZodNullable<z.ZodString>;
        hasAccess: z.ZodBoolean;
        lastLoginAt: z.ZodNullable<z.ZodDate>;
        timezone: z.ZodNullable<z.ZodString>;
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
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        leaseTenants: z.ZodOptional<z.ZodArray<z.ZodAny>>;
        emergencyContacts: z.ZodOptional<z.ZodArray<z.ZodAny>>;
        employers: z.ZodOptional<z.ZodArray<z.ZodAny>>;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Tenant Query Parameters Schema
 */
export declare const tenantQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    landlordId: z.ZodOptional<z.ZodString>;
    propertyId: z.ZodOptional<z.ZodString>;
    approvalStatus: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>>;
    hasAccess: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>, z.ZodBoolean>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Tenant Approval Schema
 */
export declare const tenantApprovalSchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
    approvedBy: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Tenant Rejection Schema
 */
export declare const tenantRejectionSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
export type EmploymentStatus = z.infer<typeof employmentStatusSchema>;
export type EmergencyContact = z.infer<typeof emergencyContactSchema>;
export type Employer = z.infer<typeof employerSchema>;
export type TenantCreate = z.infer<typeof tenantCreateSchema>;
export type TenantUpdate = z.infer<typeof tenantUpdateSchema>;
export type TenantResponse = z.infer<typeof tenantResponseSchema>;
export type TenantListResponse = z.infer<typeof tenantListResponseSchema>;
export type TenantQuery = z.infer<typeof tenantQuerySchema>;
export type TenantApproval = z.infer<typeof tenantApprovalSchema>;
export type TenantRejection = z.infer<typeof tenantRejectionSchema>;
