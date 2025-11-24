/**
 * Property Domain Schemas
 *
 * Single Source of Truth for Property domain validation and types
 * Used by both frontend and backend
 */
import { z } from 'zod';
/**
 * Property Type Enum
 */
export declare const propertyTypeSchema: z.ZodEnum<{
    "Single Family": "Single Family";
    "Multi-Family": "Multi-Family";
    Condo: "Condo";
    Townhouse: "Townhouse";
    Apartment: "Apartment";
    Commercial: "Commercial";
    Other: "Other";
}>;
/**
 * Payment Frequency Enum
 */
export declare const paymentFrequencySchema: z.ZodEnum<{
    biweekly: "biweekly";
    monthly: "monthly";
}>;
/**
 * Rented Status Enum
 */
export declare const rentedStatusSchema: z.ZodEnum<{
    Yes: "Yes";
    No: "No";
}>;
/**
 * Country/Region Codes
 */
export declare const countryCodeSchema: z.ZodString;
export declare const regionCodeSchema: z.ZodString;
/**
 * Address Schema
 */
export declare const addressSchema: z.ZodObject<{
    addressLine1: z.ZodString;
    addressLine2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    postalZip: z.ZodString;
    provinceState: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    countryCode: z.ZodOptional<z.ZodString>;
    regionCode: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Postal/ZIP validation based on country
 */
export declare const postalZipSchema: z.ZodString;
/**
 * Unit Financial Data Schema
 */
export declare const unitFinancialSchema: z.ZodObject<{
    unitName: z.ZodOptional<z.ZodString>;
    unitNumber: z.ZodOptional<z.ZodString>;
    floorNumber: z.ZodOptional<z.ZodNumber>;
    bedrooms: z.ZodOptional<z.ZodNumber>;
    bathrooms: z.ZodOptional<z.ZodNumber>;
    rentPrice: z.ZodOptional<z.ZodNumber>;
    depositAmount: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<{
        Vacant: "Vacant";
        Occupied: "Occupied";
        "Under Maintenance": "Under Maintenance";
    }>>;
}, z.core.$strip>;
/**
 * Property Create Schema
 */
export declare const propertyCreateSchema: z.ZodObject<{
    landlordId: z.ZodString;
    propertyName: z.ZodOptional<z.ZodString>;
    addressLine1: z.ZodString;
    addressLine2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    postalZip: z.ZodString;
    provinceState: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    countryCode: z.ZodOptional<z.ZodString>;
    regionCode: z.ZodOptional<z.ZodString>;
    propertyType: z.ZodOptional<z.ZodEnum<{
        "Single Family": "Single Family";
        "Multi-Family": "Multi-Family";
        Condo: "Condo";
        Townhouse: "Townhouse";
        Apartment: "Apartment";
        Commercial: "Commercial";
        Other: "Other";
    }>>;
    unitCount: z.ZodDefault<z.ZodNumber>;
    yearBuilt: z.ZodOptional<z.ZodNumber>;
    purchasePrice: z.ZodOptional<z.ZodNumber>;
    mortgageAmount: z.ZodOptional<z.ZodNumber>;
    interestRate: z.ZodOptional<z.ZodNumber>;
    mortgageTermYears: z.ZodOptional<z.ZodNumber>;
    mortgageStartDate: z.ZodOptional<z.ZodString>;
    paymentFrequency: z.ZodDefault<z.ZodEnum<{
        biweekly: "biweekly";
        monthly: "monthly";
    }>>;
    rent: z.ZodOptional<z.ZodNumber>;
    depositAmount: z.ZodOptional<z.ZodNumber>;
    rented: z.ZodDefault<z.ZodEnum<{
        Yes: "Yes";
        No: "No";
    }>>;
    squareFootage: z.ZodOptional<z.ZodNumber>;
    propertyDescription: z.ZodOptional<z.ZodString>;
    propertyTaxes: z.ZodOptional<z.ZodNumber>;
    unitFinancials: z.ZodOptional<z.ZodArray<z.ZodObject<{
        unitName: z.ZodOptional<z.ZodString>;
        unitNumber: z.ZodOptional<z.ZodString>;
        floorNumber: z.ZodOptional<z.ZodNumber>;
        bedrooms: z.ZodOptional<z.ZodNumber>;
        bathrooms: z.ZodOptional<z.ZodNumber>;
        rentPrice: z.ZodOptional<z.ZodNumber>;
        depositAmount: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<{
            Vacant: "Vacant";
            Occupied: "Occupied";
            "Under Maintenance": "Under Maintenance";
        }>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/**
 * Property Update Schema (all fields optional)
 */
export declare const propertyUpdateSchema: z.ZodObject<{
    propertyName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    addressLine1: z.ZodOptional<z.ZodString>;
    addressLine2: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodString>;
    postalZip: z.ZodOptional<z.ZodString>;
    provinceState: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    country: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    countryCode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    regionCode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    propertyType: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        "Single Family": "Single Family";
        "Multi-Family": "Multi-Family";
        Condo: "Condo";
        Townhouse: "Townhouse";
        Apartment: "Apartment";
        Commercial: "Commercial";
        Other: "Other";
    }>>>;
    unitCount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    yearBuilt: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    purchasePrice: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    mortgageAmount: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    interestRate: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    mortgageTermYears: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    mortgageStartDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    paymentFrequency: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        biweekly: "biweekly";
        monthly: "monthly";
    }>>>;
    rent: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    depositAmount: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    rented: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        Yes: "Yes";
        No: "No";
    }>>>;
    squareFootage: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    propertyDescription: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    propertyTaxes: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    unitFinancials: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        unitName: z.ZodOptional<z.ZodString>;
        unitNumber: z.ZodOptional<z.ZodString>;
        floorNumber: z.ZodOptional<z.ZodNumber>;
        bedrooms: z.ZodOptional<z.ZodNumber>;
        bathrooms: z.ZodOptional<z.ZodNumber>;
        rentPrice: z.ZodOptional<z.ZodNumber>;
        depositAmount: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<{
            Vacant: "Vacant";
            Occupied: "Occupied";
            "Under Maintenance": "Under Maintenance";
        }>>;
    }, z.core.$strip>>>>;
    landlordId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Property Response Schema (what API returns)
 */
export declare const propertyResponseSchema: z.ZodObject<{
    id: z.ZodString;
    propertyId: z.ZodString;
    landlordId: z.ZodString;
    organizationId: z.ZodOptional<z.ZodString>;
    propertyName: z.ZodNullable<z.ZodString>;
    addressLine1: z.ZodString;
    addressLine2: z.ZodNullable<z.ZodString>;
    city: z.ZodString;
    provinceState: z.ZodNullable<z.ZodString>;
    postalZip: z.ZodString;
    country: z.ZodNullable<z.ZodString>;
    countryCode: z.ZodNullable<z.ZodString>;
    regionCode: z.ZodNullable<z.ZodString>;
    propertyType: z.ZodNullable<z.ZodString>;
    unitCount: z.ZodDefault<z.ZodNumber>;
    yearBuilt: z.ZodNullable<z.ZodNumber>;
    purchasePrice: z.ZodNullable<z.ZodNumber>;
    mortgageAmount: z.ZodNullable<z.ZodNumber>;
    interestRate: z.ZodNullable<z.ZodNumber>;
    mortgageTermYears: z.ZodNullable<z.ZodNumber>;
    mortgageStartDate: z.ZodNullable<z.ZodDate>;
    paymentFrequency: z.ZodNullable<z.ZodEnum<{
        biweekly: "biweekly";
        monthly: "monthly";
    }>>;
    rent: z.ZodNullable<z.ZodNumber>;
    depositAmount: z.ZodNullable<z.ZodNumber>;
    rented: z.ZodEnum<{
        Yes: "Yes";
        No: "No";
    }>;
    squareFootage: z.ZodNullable<z.ZodNumber>;
    propertyDescription: z.ZodNullable<z.ZodString>;
    propertyTaxes: z.ZodNullable<z.ZodNumber>;
    latitude: z.ZodNullable<z.ZodNumber>;
    longitude: z.ZodNullable<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    units: z.ZodOptional<z.ZodArray<z.ZodAny>>;
    landlord: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Property List Response Schema
 */
export declare const propertyListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        propertyId: z.ZodString;
        landlordId: z.ZodString;
        organizationId: z.ZodOptional<z.ZodString>;
        propertyName: z.ZodNullable<z.ZodString>;
        addressLine1: z.ZodString;
        addressLine2: z.ZodNullable<z.ZodString>;
        city: z.ZodString;
        provinceState: z.ZodNullable<z.ZodString>;
        postalZip: z.ZodString;
        country: z.ZodNullable<z.ZodString>;
        countryCode: z.ZodNullable<z.ZodString>;
        regionCode: z.ZodNullable<z.ZodString>;
        propertyType: z.ZodNullable<z.ZodString>;
        unitCount: z.ZodDefault<z.ZodNumber>;
        yearBuilt: z.ZodNullable<z.ZodNumber>;
        purchasePrice: z.ZodNullable<z.ZodNumber>;
        mortgageAmount: z.ZodNullable<z.ZodNumber>;
        interestRate: z.ZodNullable<z.ZodNumber>;
        mortgageTermYears: z.ZodNullable<z.ZodNumber>;
        mortgageStartDate: z.ZodNullable<z.ZodDate>;
        paymentFrequency: z.ZodNullable<z.ZodEnum<{
            biweekly: "biweekly";
            monthly: "monthly";
        }>>;
        rent: z.ZodNullable<z.ZodNumber>;
        depositAmount: z.ZodNullable<z.ZodNumber>;
        rented: z.ZodEnum<{
            Yes: "Yes";
            No: "No";
        }>;
        squareFootage: z.ZodNullable<z.ZodNumber>;
        propertyDescription: z.ZodNullable<z.ZodString>;
        propertyTaxes: z.ZodNullable<z.ZodNumber>;
        latitude: z.ZodNullable<z.ZodNumber>;
        longitude: z.ZodNullable<z.ZodNumber>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        units: z.ZodOptional<z.ZodArray<z.ZodAny>>;
        landlord: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
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
 * Property Query Parameters Schema
 */
export declare const propertyQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    landlordId: z.ZodOptional<z.ZodString>;
    propertyType: z.ZodOptional<z.ZodEnum<{
        "Single Family": "Single Family";
        "Multi-Family": "Multi-Family";
        Condo: "Condo";
        Townhouse: "Townhouse";
        Apartment: "Apartment";
        Commercial: "Commercial";
        Other: "Other";
    }>>;
    countryCode: z.ZodOptional<z.ZodString>;
    regionCode: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PropertyType = z.infer<typeof propertyTypeSchema>;
export type PaymentFrequency = z.infer<typeof paymentFrequencySchema>;
export type RentedStatus = z.infer<typeof rentedStatusSchema>;
export type Address = z.infer<typeof addressSchema>;
export type UnitFinancial = z.infer<typeof unitFinancialSchema>;
export type PropertyCreate = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdate = z.infer<typeof propertyUpdateSchema>;
export type PropertyResponse = z.infer<typeof propertyResponseSchema>;
export type PropertyListResponse = z.infer<typeof propertyListResponseSchema>;
export type PropertyQuery = z.infer<typeof propertyQuerySchema>;
