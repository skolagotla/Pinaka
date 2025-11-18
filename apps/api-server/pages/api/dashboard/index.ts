/**
 * ═══════════════════════════════════════════════════════════════
 * UNIFIED DASHBOARD API
 * ═══════════════════════════════════════════════════════════════
 * GET /api/dashboard - Get dashboard statistics (role-based)
 * - Landlords: Get property, lease, and financial statistics
 * - PMCs: Get managed properties, landlords, and approval statistics
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');
const { getCachedDashboard, setCachedDashboard } = require('@/lib/cache/dashboard-cache');

async function getLandlordDashboard(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  // Check cache first
  const cached = await getCachedDashboard(user.userId, user.role);
  if (cached) {
    return res.status(200).json(cached);
  }
  try {
    // Get basic property statistics
    const [totalProperties, activeLeases, totalUnits] = await Promise.all([
      prisma.property.count({
        where: { landlordId: user.userId }
      }),
      prisma.lease.count({
        where: {
          status: 'Active',
          unit: {
            property: {
              landlordId: user.userId
            }
          }
        }
      }),
      prisma.unit.count({
        where: {
          property: {
            landlordId: user.userId
          }
        }
      }),
    ]);

    // Get pending maintenance requests
    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: {
        property: {
          landlordId: user.userId,
        },
        status: {
          in: ["New", "Pending", "In Progress"],
        },
      },
    });

    // Get pending approval requests
    const pendingApprovals = await prisma.pMCLandlordApproval.count({
      where: {
        pmcLandlord: {
          landlordId: user.userId,
        },
        status: 'PENDING',
      },
    });

    // Get properties with basic info
    const properties = await prisma.property.findMany({
      where: { landlordId: user.userId },
      select: {
        id: true,
        propertyName: true,
        addressLine1: true,
        units: {
          select: {
            id: true,
            leases: {
              where: { status: 'Active' },
              select: { id: true },
            },
          },
        },
      },
      take: 10, // Limit for dashboard
    });

    const response = {
      success: true,
      data: {
        totalProperties,
        totalUnits,
        activeLeases,
        pendingMaintenance,
        pendingApprovals,
        properties: properties.map(prop => ({
          id: prop.id,
          propertyName: prop.propertyName,
          addressLine1: prop.addressLine1,
          unitCount: prop.units?.length || 0,
          activeLeaseCount: prop.units?.reduce((sum, unit) => sum + (unit.leases?.length || 0), 0) || 0,
        })),
      },
    };
    
    // Cache the response (1 minute TTL)
    await setCachedDashboard(user.userId, user.role, response, 60);
    
    return res.status(200).json(response);
  } catch (error: any) {
    console.error('[Dashboard] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error.message,
    });
  }
}

async function getPMCDashboard(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  // Check cache first
  const cached = await getCachedDashboard(user.userId, user.role);
  if (cached) {
    return res.status(200).json(cached);
  }
  try {
    // Get PMC relationships (landlords managed by this PMC)
    const pmcRelationships = await prisma.pMCLandlord.findMany({
      where: {
        pmcId: user.userId,
        status: 'active',
      },
      include: {
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Get properties managed by this PMC
    const landlordIds = pmcRelationships.map(rel => rel.landlordId);
    const managedProperties = await prisma.property.findMany({
      where: {
        landlordId: {
          in: landlordIds,
        },
      },
      include: {
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        units: {
          include: {
            leases: {
              where: {
                status: 'Active',
              },
            },
          },
        },
      },
    });

    // Calculate statistics
    const totalLandlords = pmcRelationships.length;
    const totalProperties = managedProperties.length;
    const totalUnits = managedProperties.reduce((sum, prop) => sum + (prop.units?.length || 0), 0);
    const activeLeases = managedProperties.reduce((sum, prop) => {
      return sum + prop.units.reduce((unitSum, unit) => {
        return unitSum + (unit.leases?.length || 0);
      }, 0);
    }, 0);

    // Get pending maintenance requests
    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: {
        propertyId: {
          in: managedProperties.map(p => p.id),
        },
        status: {
          in: ["New", "Pending", "In Progress"],
        },
      },
    });

    // Get pending approval requests
    const pendingApprovals = await prisma.pMCLandlordApproval.count({
      where: {
        pmcLandlord: {
          pmcId: user.userId,
        },
        status: 'PENDING',
      },
    });

    const response = {
      success: true,
      data: {
        totalLandlords,
        totalProperties,
        totalUnits,
        activeLeases,
        pendingMaintenance,
        pendingApprovals,
        pmcRelationships: pmcRelationships.map(rel => ({
          id: rel.id,
          landlord: rel.landlord,
          status: rel.status,
          startedAt: rel.startedAt,
        })),
        managedProperties: managedProperties.map(prop => ({
          id: prop.id,
          addressLine1: prop.addressLine1,
          propertyName: prop.propertyName,
          landlord: prop.landlord,
          unitCount: prop.units?.length || 0,
          activeLeaseCount: prop.units?.reduce((sum, unit) => sum + (unit.leases?.length || 0), 0) || 0,
        })),
      },
    };
    
    // Cache the response (1 minute TTL)
    await setCachedDashboard(user.userId, user.role, response, 60);
    
    return res.status(200).json(response);
  } catch (error: any) {
    console.error('[Dashboard] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error.message,
    });
  }
}

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (user.role === 'landlord') {
    return getLandlordDashboard(req, res, user);
  } else if (user.role === 'pmc') {
    return getPMCDashboard(req, res, user);
  } else {
    return res.status(403).json({ success: false, error: 'Unauthorized' });
  }
}, { requireRole: ['landlord', 'pmc'] });

