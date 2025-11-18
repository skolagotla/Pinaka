/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN USER ACTIVITY MONITORING
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');

async function getUserActivity(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { userId, userRole, action, page = 1, limit = 100, startDate, endDate } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    // Validate pagination parameters
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: 'Invalid page parameter. Must be a positive number.' });
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({ error: 'Invalid limit parameter. Must be a number between 1 and 1000.' });
    }
    
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (userId) where.userId = userId;
    if (userRole) where.userRole = userRole;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userActivity.count({ where }),
    ]);

    // Get statistics
    const stats = await Promise.all([
      prisma.userActivity.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.userActivity.groupBy({
        by: ['action'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
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
      }),
      prisma.userActivity.groupBy({
        by: ['userRole'],
        _count: {
          userRole: true,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: activities,
      stats: {
        last24Hours: stats[0],
        topActions: stats[1].map((s: any) => ({ action: s.action, count: s._count.action })),
        byRole: stats[2].map((s: any) => ({ role: s.userRole, count: s._count.userRole })),
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[Admin User Activity] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user activity',
      message: error.message,
    });
  }
}

export default withAdminAuth(getUserActivity, { requireRole: 'SUPER_ADMIN' });

