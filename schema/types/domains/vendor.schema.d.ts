/**
 * Vendor/ServiceProvider Domain Schemas
 *
 * Single Source of Truth for Vendor/ServiceProvider domain validation and types
 */
import { z } from 'zod';
/**
 * Service Provider Type Enum
 */
export declare const serviceProviderTypeSchema: z.ZodEnum<{
    vendor: "vendor";
    contractor: "contractor";
}>;
/**
 * Service Provider Create Schema
 */
export declare const serviceProviderCreateSchema: z.ZodObject<{
    type: z.ZodEnum<{
        vendor: "vendor";
        contractor: "contractor";
    }>;
    name: z.ZodString;
    businessName: z.ZodOptional<z.ZodString>;
    contactName: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    phone: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    specialties: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    addressLine1: z.ZodOptional<z.ZodString>;
    addressLine2: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    provinceState: z.ZodOptional<z.ZodString>;
    postalZip: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    countryCode: z.ZodOptional<z.ZodString>;
    regionCode: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    isGlobal: z.ZodDefault<z.ZodBoolean>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Service Provider Update Schema
 */
export declare const serviceProviderUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    businessName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    contactName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    specialties: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>>;
    licenseNumber: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    addressLine1: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    addressLine2: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    provinceState: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    postalZip: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    country: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    countryCode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    regionCode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    latitude: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    longitude: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    isGlobal: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    type: z.ZodOptional<z.ZodEnum<{
        vendor: "vendor";
        contractor: "contractor";
    }>>;
}, z.core.$strip>;
/**
 * Service Provider Query Schema
 */
export declare const serviceProviderQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    type: z.ZodOptional<z.ZodEnum<{
        vendor: "vendor";
        contractor: "contractor";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    isGlobal: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Service Provider Response Schema
 */
export declare const serviceProviderResponseSchema: z.ZodObject<{
    id: z.ZodString;
    providerId: z.ZodString;
    type: z.ZodEnum<{
        vendor: "vendor";
        contractor: "contractor";
    }>;
    name: z.ZodString;
    businessName: z.ZodNullable<z.ZodString>;
    contactName: z.ZodNullable<z.ZodString>;
    email: z.ZodString;
    phone: z.ZodString;
    category: z.ZodNullable<z.ZodString>;
    specialties: z.ZodArray<z.ZodString>;
    licenseNumber: z.ZodNullable<z.ZodString>;
    addressLine1: z.ZodNullable<z.ZodString>;
    addressLine2: z.ZodNullable<z.ZodString>;
    city: z.ZodNullable<z.ZodString>;
    provinceState: z.ZodNullable<z.ZodString>;
    postalZip: z.ZodNullable<z.ZodString>;
    country: z.ZodNullable<z.ZodString>;
    countryCode: z.ZodNullable<z.ZodString>;
    regionCode: z.ZodNullable<z.ZodString>;
    latitude: z.ZodNullable<z.ZodNumber>;
    longitude: z.ZodNullable<z.ZodNumber>;
    isGlobal: z.ZodBoolean;
    isActive: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, z.core.$strip>;
/**
 * Service Provider List Response Schema
 */
export declare const serviceProviderListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        providerId: z.ZodString;
        type: z.ZodEnum<{
            vendor: "vendor";
            contractor: "contractor";
        }>;
        name: z.ZodString;
        businessName: z.ZodNullable<z.ZodString>;
        contactName: z.ZodNullable<z.ZodString>;
        email: z.ZodString;
        phone: z.ZodString;
        category: z.ZodNullable<z.ZodString>;
        specialties: z.ZodArray<z.ZodString>;
        licenseNumber: z.ZodNullable<z.ZodString>;
        addressLine1: z.ZodNullable<z.ZodString>;
        addressLine2: z.ZodNullable<z.ZodString>;
        city: z.ZodNullable<z.ZodString>;
        provinceState: z.ZodNullable<z.ZodString>;
        postalZip: z.ZodNullable<z.ZodString>;
        country: z.ZodNullable<z.ZodString>;
        countryCode: z.ZodNullable<z.ZodString>;
        regionCode: z.ZodNullable<z.ZodString>;
        latitude: z.ZodNullable<z.ZodNumber>;
        longitude: z.ZodNullable<z.ZodNumber>;
        isGlobal: z.ZodBoolean;
        isActive: z.ZodBoolean;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ServiceProviderType = z.infer<typeof serviceProviderTypeSchema>;
export type ServiceProviderCreate = z.infer<typeof serviceProviderCreateSchema>;
export type ServiceProviderUpdate = z.infer<typeof serviceProviderUpdateSchema>;
export type ServiceProviderQuery = z.infer<typeof serviceProviderQuerySchema>;
export type ServiceProviderResponse = z.infer<typeof serviceProviderResponseSchema>;
export type ServiceProviderListResponse = z.infer<typeof serviceProviderListResponseSchema>;
/**
 * Vendor Search Query Schema
 */
export declare const vendorSearchQuerySchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        vendor: "vendor";
        contractor: "contractor";
    }>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export declare const vendorCreateSchema: z.ZodObject<{
    type: z.ZodEnum<{
        vendor: "vendor";
        contractor: "contractor";
    }>;
    name: z.ZodString;
    businessName: z.ZodOptional<z.ZodString>;
    contactName: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    phone: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    specialties: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    addressLine1: z.ZodOptional<z.ZodString>;
    addressLine2: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    provinceState: z.ZodOptional<z.ZodString>;
    postalZip: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    countryCode: z.ZodOptional<z.ZodString>;
    regionCode: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    isGlobal: z.ZodDefault<z.ZodBoolean>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const vendorUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    businessName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    contactName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    specialties: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>>;
    licenseNumber: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    addressLine1: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    addressLine2: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    provinceState: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    postalZip: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    country: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    countryCode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    regionCode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    latitude: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    longitude: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    isGlobal: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    type: z.ZodOptional<z.ZodEnum<{
        vendor: "vendor";
        contractor: "contractor";
    }>>;
}, z.core.$strip>;
export declare const vendorQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    type: z.ZodOptional<z.ZodEnum<{
        vendor: "vendor";
        contractor: "contractor";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    isGlobal: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const vendorResponseSchema: z.ZodObject<{
    id: z.ZodString;
    providerId: z.ZodString;
    type: z.ZodEnum<{
        vendor: "vendor";
        contractor: "contractor";
    }>;
    name: z.ZodString;
    businessName: z.ZodNullable<z.ZodString>;
    contactName: z.ZodNullable<z.ZodString>;
    email: z.ZodString;
    phone: z.ZodString;
    category: z.ZodNullable<z.ZodString>;
    specialties: z.ZodArray<z.ZodString>;
    licenseNumber: z.ZodNullable<z.ZodString>;
    addressLine1: z.ZodNullable<z.ZodString>;
    addressLine2: z.ZodNullable<z.ZodString>;
    city: z.ZodNullable<z.ZodString>;
    provinceState: z.ZodNullable<z.ZodString>;
    postalZip: z.ZodNullable<z.ZodString>;
    country: z.ZodNullable<z.ZodString>;
    countryCode: z.ZodNullable<z.ZodString>;
    regionCode: z.ZodNullable<z.ZodString>;
    latitude: z.ZodNullable<z.ZodNumber>;
    longitude: z.ZodNullable<z.ZodNumber>;
    isGlobal: z.ZodBoolean;
    isActive: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, z.core.$strip>;
export declare const vendorListResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        providerId: z.ZodString;
        type: z.ZodEnum<{
            vendor: "vendor";
            contractor: "contractor";
        }>;
        name: z.ZodString;
        businessName: z.ZodNullable<z.ZodString>;
        contactName: z.ZodNullable<z.ZodString>;
        email: z.ZodString;
        phone: z.ZodString;
        category: z.ZodNullable<z.ZodString>;
        specialties: z.ZodArray<z.ZodString>;
        licenseNumber: z.ZodNullable<z.ZodString>;
        addressLine1: z.ZodNullable<z.ZodString>;
        addressLine2: z.ZodNullable<z.ZodString>;
        city: z.ZodNullable<z.ZodString>;
        provinceState: z.ZodNullable<z.ZodString>;
        postalZip: z.ZodNullable<z.ZodString>;
        country: z.ZodNullable<z.ZodString>;
        countryCode: z.ZodNullable<z.ZodString>;
        regionCode: z.ZodNullable<z.ZodString>;
        latitude: z.ZodNullable<z.ZodNumber>;
        longitude: z.ZodNullable<z.ZodNumber>;
        isGlobal: z.ZodBoolean;
        isActive: z.ZodBoolean;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type VendorCreate = ServiceProviderCreate;
export type VendorUpdate = ServiceProviderUpdate;
export type VendorQuery = ServiceProviderQuery;
export type VendorResponse = ServiceProviderResponse;
export type VendorListResponse = ServiceProviderListResponse;
export type VendorSearchQuery = z.infer<typeof vendorSearchQuerySchema>;
