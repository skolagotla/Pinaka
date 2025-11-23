/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN SECURITY - FAILED LOGIN ATTEMPTS
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');

async function getFailedLogins(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { email, ipAddress, attemptType, page = 1, limit = 100, startDate, endDate } = req.query;

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

    if (email) where.email = { contains: email as string, mode: 'insensitive' };
    if (ipAddress) where.ipAddress = ipAddress as string;
    if (attemptType) where.attemptType = attemptType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [attempts, total] = await Promise.all([
      prisma.failedLoginAttempt.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.failedLoginAttempt.count({ where }),
    ]);

    // Get statistics
    const stats = await Promise.all([
      prisma.failedLoginAttempt.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.failedLoginAttempt.groupBy({
        by: ['ipAddress'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        _count: {
          ipAddress: true,
        },
        orderBy: {
          _count: {
            ipAddress: 'desc',
          },
        },
        take: 10,
      }),
      prisma.failedLoginAttempt.groupBy({
        by: ['email'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        _count: {
          email: true,
        },
        orderBy: {
          _count: {
            email: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: attempts,
      stats: {
        last24Hours: stats[0],
        topIPs: stats[1].map((s: any) => ({ ip: s.ipAddress, count: s._count.ipAddress })),
        topEmails: stats[2].map((s: any) => ({ email: s.email, count: s._count.email })),
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[Admin Security] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch failed login attempts',
      message: error.message,
    });
  }
}

export default withAdminAuth(getFailedLogins, { requireRole: 'super_admin' });

