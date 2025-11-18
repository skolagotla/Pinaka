/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN SYSTEM MONITORING API
 * ═══════════════════════════════════════════════════════════════
 * GET /api/admin/system/health - Get system health metrics
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');

async function getSystemHealth(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    // Database health check
    let dbHealthy = true;
    let dbResponseTime = 0;
    try {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - startTime;
    } catch (error) {
      dbHealthy = false;
    }

    // Get counts
    const [
      landlordCount,
      tenantCount,
      propertyCount,
      leaseCount,
      activeSessions,
      recentErrors,
    ] = await Promise.all([
      prisma.landlord.count(),
      prisma.tenant.count(),
      prisma.property.count(),
      prisma.lease.count({ where: { leaseEnd: null } }),
      prisma.adminSession.count({
        where: {
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      }),
      prisma.adminAuditLog.count({
        where: {
          success: false,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    // Get recent activity (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [
      recentLogins,
      recentLandlords,
      recentTenants,
      recentProperties,
    ] = await Promise.all([
      prisma.adminAuditLog.count({
        where: {
          action: 'login_success',
          createdAt: { gte: last24Hours },
        },
      }),
      prisma.landlord.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      prisma.tenant.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      prisma.property.count({
        where: { createdAt: { gte: last24Hours } },
      }),
    ]);
    
    // Calculate new users (landlords + tenants)
    const recentUserCreations = recentLandlords + recentTenants;

    return res.status(200).json({
      success: true,
      data: {
        database: {
          healthy: dbHealthy,
          responseTime: dbResponseTime,
          status: dbHealthy ? 'operational' : 'degraded',
        },
        metrics: {
          users: {
            landlords: landlordCount,
            tenants: tenantCount,
            total: landlordCount + tenantCount,
          },
          properties: {
            total: propertyCount,
            withActiveLeases: leaseCount,
          },
          system: {
            activeSessions,
            recentErrors,
          },
        },
        activity: {
          last24Hours: {
            logins: recentLogins,
            newUsers: recentUserCreations,
            newProperties: recentProperties,
          },
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Admin System] Error getting health:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch system health',
      message: error.message,
    });
  }
}

export default withAdminAuth(getSystemHealth, { requireRole: 'SUPER_ADMIN' });

