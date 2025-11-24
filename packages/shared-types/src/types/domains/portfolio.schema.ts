/**
 * Portfolio Domain Schemas
 * 
 * Single Source of Truth for Portfolio aggregation domain validation and types
 * Used for aggregating properties, tenants, leases, and vendors
 */

import { z } from 'zod';
import { propertyListResponseSchema } from './property.schema';
import { tenantListResponseSchema } from './tenant.schema';
import { leaseListResponseSchema } from './lease.schema';
import { serviceProviderListResponseSchema } from './vendor.schema';
import { landlordListResponseSchema } from './landlord.schema';

/**
 * Portfolio Summary Query Schema
 */
export const portfolioSummaryQuerySchema = z.object({
  landlordId: z.string().optional(),
  pmcId: z.string().optional(),
  propertyId: z.string().optional(),
  includeStats: z.union([
    z.string().transform((val) => val === 'true'),
    z.boolean(),
  ]).optional().default(true),
  page: z.union([
    z.string().transform(Number).pipe(z.number().min(1)),
    z.number().min(1),
  ]).optional().default(1),
  limit: z.union([
    z.string().transform(Number).pipe(z.number().min(1).max(100)),
    z.number().min(1).max(100),
  ]).optional().default(25),
});

/**
 * Portfolio Statistics Schema
 */
export const portfolioStatsSchema = z.object({
  totalProperties: z.number(),
  totalTenants: z.number(),
  activeLeases: z.number(),
  totalVendors: z.number(),
  totalLandlords: z.number().optional(),
  occupiedUnits: z.number().optional(),
  vacantUnits: z.number().optional(),
  totalMonthlyRent: z.number().optional(),
  totalAnnualRent: z.number().optional(),
});

/**
 * Portfolio Summary Response Schema
 */
export const portfolioSummaryResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    properties: propertyListResponseSchema,
    tenants: tenantListResponseSchema,
    leases: leaseListResponseSchema,
    vendors: serviceProviderListResponseSchema,
    landlords: landlordListResponseSchema.optional(),
    stats: portfolioStatsSchema.optional(),
  }),
});

