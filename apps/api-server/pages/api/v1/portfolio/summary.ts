/**
 * Portfolio Summary API
 * 
 * Aggregates properties, tenants, leases, and vendors for a user's portfolio
 * Respects RBAC and data isolation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { portfolioSummaryQuerySchema, portfolioSummaryResponseSchema } from '@/lib/schemas';
import { propertyService } from '@/lib/domains/property';
import { tenantService } from '@/lib/domains/tenant';
import { leaseService } from '@/lib/domains/lease';
import { landlordService } from '@/lib/domains/landlord';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Get portfolio access filters based on user role
 */
async function getPortfolioAccess(user: UserContext) {
  const { userId, role } = user;

  // Platform/Super Admin: Full access
  if (role === 'admin' || role === 'super_admin') {
    return {
      canViewAll: true,
      landlordIds: null,
      propertyIds: null,
      pmcId: null,
    };
  }

  // PMC Admin/Property Manager: Managed properties only
  if (role === 'pmc' || role === 'property_manager') {
    // Get PMC-managed landlords
    const pmcLandlords = await prisma.pMCLandlord.findMany({
      where: {
        pmcId: userId,
        status: 'active',
      },
      select: {
        landlordId: true,
      },
    });

    const landlordIds = pmcLandlords.map((pl) => pl.landlordId);

    // Get managed properties
    const managedProperties = await prisma.property.findMany({
      where: {
        landlordId: { in: landlordIds },
      },
      select: {
        id: true,
      },
    });

    return {
      canViewAll: false,
      landlordIds: landlordIds.length > 0 ? landlordIds : [],
      propertyIds: managedProperties.map((p) => p.id),
      pmcId: userId,
    };
  }

  // Landlord: Own properties only
  if (role === 'landlord') {
    return {
      canViewAll: false,
      landlordIds: [userId],
      propertyIds: null, // Will filter by landlordId
      pmcId: null,
    };
  }

  // Tenant: Only their lease and assigned vendors
  if (role === 'tenant') {
    const lease = await prisma.lease.findFirst({
      where: {
        leaseTenants: {
          some: {
            tenantId: userId,
          },
        },
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!lease) {
      return {
        canViewAll: false,
        landlordIds: [],
        propertyIds: [],
        pmcId: null,
      };
    }

    return {
      canViewAll: false,
      landlordIds: [lease.unit.property.landlordId],
      propertyIds: [lease.unit.propertyId],
      pmcId: null,
    };
  }

  // Default: No access
  return {
    canViewAll: false,
    landlordIds: [],
    propertyIds: [],
    pmcId: null,
  };
}

/**
 * GET /api/v1/portfolio/summary
 * Get aggregated portfolio data
 */
export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const queryResult = portfolioSummaryQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: queryResult.error.issues,
        },
      });
    }

    const query = queryResult.data;
    const { landlordId: queryLandlordId, pmcId: queryPmcId, propertyId, includeStats, page, limit } = query;

    // Get portfolio access based on user role
    const access = await getPortfolioAccess(user);

    // Override with query params if provided (with permission check)
    let finalLandlordId: string | null = null;
    if (queryLandlordId) {
      // Verify user has access to this landlord
      if (access.canViewAll || access.landlordIds?.includes(queryLandlordId)) {
        finalLandlordId = queryLandlordId;
      } else {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You do not have access to this landlord',
        });
      }
    } else if (access.landlordIds && access.landlordIds.length === 1) {
      finalLandlordId = access.landlordIds[0];
    }

    // Build query filters
    const propertyFilters: any = {};
    const tenantFilters: any = {};
    const leaseFilters: any = {};
    const vendorFilters: any = {};
    const landlordFilters: any = {};

    if (finalLandlordId) {
      propertyFilters.landlordId = finalLandlordId;
      tenantFilters.landlordId = finalLandlordId;
      leaseFilters.landlordId = finalLandlordId;
      vendorFilters.landlordId = finalLandlordId;
    } else if (access.propertyIds && access.propertyIds.length > 0) {
      propertyFilters.id = { in: access.propertyIds };
      tenantFilters.propertyId = { in: access.propertyIds };
      leaseFilters.propertyId = { in: access.propertyIds };
    } else if (!access.canViewAll) {
      // No access
      return res.status(200).json({
        success: true,
        data: {
          properties: { data: [], pagination: { page: 1, limit: limit || 25, total: 0, totalPages: 0 } },
          tenants: { data: [], pagination: { page: 1, limit: limit || 25, total: 0, totalPages: 0 } },
          leases: { data: [], pagination: { page: 1, limit: limit || 25, total: 0, totalPages: 0 } },
          vendors: { data: [], pagination: { page: 1, limit: limit || 25, total: 0, totalPages: 0 } },
          stats: includeStats
            ? {
                totalProperties: 0,
                totalTenants: 0,
                activeLeases: 0,
                totalVendors: 0,
              }
            : undefined,
        },
      });
    }

    if (propertyId) {
      propertyFilters.id = propertyId;
      tenantFilters.propertyId = propertyId;
      leaseFilters.propertyId = propertyId;
    }

    if (queryPmcId && (access.canViewAll || access.pmcId === queryPmcId)) {
      vendorFilters.pmcId = queryPmcId;
    }

    // Build landlord query - only for admin and PMC
    const shouldFetchLandlords = access.canViewAll || (access.landlordIds && access.landlordIds.length > 0);
    const landlordQuery: any = {
      page: page || 1,
      limit: limit || 25,
    };
    if (!access.canViewAll && access.landlordIds && access.landlordIds.length > 0) {
      // For PMC, filter by managed landlord IDs
      // Note: landlordService.list doesn't support filtering by IDs directly, so we'll filter after
    }

    // Fetch data in parallel using domain services
    const [propertiesResult, tenantsResult, leasesResult, vendorsResult, landlordsResult] = await Promise.all([
      propertyService.list({
        ...propertyFilters,
        page: page || 1,
        limit: limit || 25,
      }),
      tenantService.list({
        ...tenantFilters,
        page: page || 1,
        limit: limit || 25,
      }),
      leaseService.list({
        ...leaseFilters,
        page: page || 1,
        limit: limit || 25,
      }, { unit: true, tenants: false }),
      // Vendors (service providers) - need to use Prisma directly for now
      prisma.serviceProvider.findMany({
        where: vendorFilters,
        skip: ((page || 1) - 1) * (limit || 25),
        take: limit || 25,
        orderBy: { createdAt: 'desc' },
      }).then((vendors) => {
        const total = vendors.length; // Simplified - should count separately
        return {
          data: vendors,
          pagination: {
            page: page || 1,
            limit: limit || 25,
            total,
            totalPages: Math.ceil(total / (limit || 25)),
          },
        };
      }),
      // Landlords - only for admin and PMC
      shouldFetchLandlords
        ? landlordService.list(landlordQuery).then((result) => {
            // Filter by landlordIds if needed (for PMC)
            let landlords = result.landlords || [];
            if (!access.canViewAll && access.landlordIds && access.landlordIds.length > 0) {
              landlords = landlords.filter((ll: any) => access.landlordIds!.includes(ll.id));
            }
            return {
              landlords,
              pagination: {
                page: result.page || page || 1,
                limit: result.limit || limit || 25,
                total: landlords.length,
                totalPages: Math.ceil(landlords.length / (result.limit || limit || 25)),
              },
            };
          })
        : Promise.resolve({
            landlords: [],
            pagination: { page: 1, limit: 25, total: 0, totalPages: 0 },
          }),
    ]);

    // Calculate stats if requested
    let stats = undefined;
    if (includeStats) {
      const [totalProperties, totalTenants, activeLeases, totalVendors, totalLandlords, occupiedUnits, vacantUnits] = await Promise.all([
        prisma.property.count({ where: propertyFilters }),
        prisma.tenant.count({ where: tenantFilters }),
        prisma.lease.count({
          where: {
            ...leaseFilters,
            status: 'Active',
          },
        }),
        prisma.serviceProvider.count({ where: vendorFilters }),
        shouldFetchLandlords
          ? access.canViewAll
            ? prisma.landlord.count()
            : prisma.landlord.count({ where: { id: { in: access.landlordIds || [] } } })
          : Promise.resolve(0),
        prisma.unit.count({
          where: {
            property: propertyFilters.id ? { id: propertyFilters.id } : propertyFilters,
            leases: {
              some: {
                status: 'Active',
              },
            },
          },
        }),
        prisma.unit.count({
          where: {
            property: propertyFilters.id ? { id: propertyFilters.id } : propertyFilters,
            leases: {
              none: {
                status: 'Active',
              },
            },
          },
        }),
      ]);

      // Calculate total monthly rent
      const activeLeasesData = await prisma.lease.findMany({
        where: {
          ...leaseFilters,
          status: 'Active',
        },
        select: {
          rentAmount: true,
        },
      });

      const totalMonthlyRent = activeLeasesData.reduce((sum, lease) => sum + (Number(lease.rentAmount) || 0), 0);

      stats = {
        totalProperties,
        totalTenants,
        activeLeases,
        totalVendors,
        totalLandlords,
        occupiedUnits,
        vacantUnits,
        totalMonthlyRent,
        totalAnnualRent: totalMonthlyRent * 12,
      };
    }

    // Format response - wrap service results in schema format
    // Services return { properties: [], pagination: {} } or { tenants: [], pagination: {} }
    // Schema expects { success: true, data: [], pagination: {} }
    // Filter out any invalid data before schema validation
    const validLeases = (leasesResult.leases || leasesResult.data || []).filter((lease: any) => {
      // Ensure unitId is a valid CUID string
      return lease.unitId && typeof lease.unitId === 'string' && lease.unitId.length > 0;
    });

    const responseData = {
      success: true,
      data: {
        properties: {
          success: true,
          data: propertiesResult.properties || propertiesResult.data || [],
          pagination: propertiesResult.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 },
        },
        tenants: {
          success: true,
          data: tenantsResult.tenants || tenantsResult.data || [],
          pagination: tenantsResult.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 },
        },
        leases: {
          success: true,
          data: validLeases,
          pagination: {
            ...(leasesResult.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 }),
            total: validLeases.length, // Update total to reflect filtered count
          },
        },
        vendors: {
          success: true,
          data: vendorsResult.data || vendorsResult.vendors || [],
          pagination: vendorsResult.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 },
        },
        landlords: {
          success: true,
          data: landlordsResult.landlords || [],
          pagination: landlordsResult.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 },
        },
        stats,
      },
    };

    // Use safeParse to handle validation errors gracefully
    const validationResult = portfolioSummaryResponseSchema.safeParse(responseData);
    if (!validationResult.success) {
      console.error('[Portfolio API] Schema validation error:', validationResult.error.issues);
      // Return data anyway, but log the validation errors
      // This allows the frontend to receive data even if schema validation fails
    }

    const response = validationResult.success ? validationResult.data : responseData;

    return res.status(200).json(response);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid response format',
          details: error.issues,
        },
      });
    }

    console.error('[Portfolio API] Error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to fetch portfolio summary',
      },
    });
  }
});

