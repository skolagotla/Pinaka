/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN ANALYTICS API
 * ═══════════════════════════════════════════════════════════════
 * GET /api/admin/analytics - Get platform analytics and metrics
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');

async function getAnalytics(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    else if (period === '1y') days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user growth data
    const userGrowth = await Promise.all(
      Array.from({ length: days }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        return Promise.all([
          prisma.landlord.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDate,
              },
            },
          }),
          prisma.tenant.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDate,
              },
            },
          }),
        ]).then(([landlords, tenants]) => ({
          date: date.toISOString().split('T')[0],
          landlords,
          tenants,
          total: landlords + tenants,
        }));
      })
    );

    // Get overall statistics
    const [
      totalLandlords,
      totalTenants,
      totalProperties,
      totalLeases,
      activeLeases,
      totalMaintenance,
      openMaintenance,
      totalDocuments,
    ] = await Promise.all([
      prisma.landlord.count(),
      prisma.tenant.count(),
      prisma.property.count(),
      prisma.lease.count(),
      prisma.lease.count({ where: { leaseEnd: null } }),
      prisma.maintenanceRequest.count(),
      prisma.maintenanceRequest.count({
        where: { status: { in: ['open', 'in_progress'] } },
      }),
      prisma.document.count(),
    ]);

    // Get recent activity
    const recentActivity = await prisma.adminAuditLog.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        admin: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get top actions
    const topActions = await prisma.adminAuditLog.groupBy({
      by: ['action'],
      where: {
        createdAt: { gte: startDate },
        success: true,
      },
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
      take: 10,
    });

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          users: {
            landlords: totalLandlords,
            tenants: totalTenants,
            total: totalLandlords + totalTenants,
          },
          properties: {
            total: totalProperties,
            withLeases: activeLeases,
          },
          leases: {
            total: totalLeases,
            active: activeLeases,
          },
          maintenance: {
            total: totalMaintenance,
            open: openMaintenance,
          },
          documents: {
            total: totalDocuments,
          },
        },
        growth: {
          userGrowth,
          period,
        },
        activity: {
          recent: recentActivity,
          topActions: topActions.map(a => ({
            action: a.action,
            count: a._count.action,
          })),
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Admin Analytics] Error getting analytics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message,
    });
  }
}

export default withAdminAuth(getAnalytics, { requireRole: 'super_admin' });

