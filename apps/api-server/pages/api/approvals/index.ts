/**
 * Approvals API
 * GET /api/approvals - List approval requests
 * 
 * Returns approval requests (ApprovalRequest model) with optional filtering
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    // For non-admin users, filter by requester
    if (user.role !== 'admin' && user.role !== 'pmc') {
      where.requestedBy = user.userId;
    }

    // Get approvals with pagination
    const [approvals, total] = await Promise.all([
      prisma.approvalRequest.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          requestedAt: 'desc',
        },
      }),
      prisma.approvalRequest.count({ where }),
    ]);

    // Get counts by status
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.approvalRequest.count({ where: { ...where, status: 'PENDING' } }),
      prisma.approvalRequest.count({ where: { ...where, status: 'APPROVED' } }),
      prisma.approvalRequest.count({ where: { ...where, status: 'REJECTED' } }),
    ]);

    return res.status(200).json({
      success: true,
      data: approvals,
      approvals: approvals, // Alias for backward compatibility
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[Approvals API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch approvals',
      message: error.message,
    });
  }
}, { allowedMethods: ['GET'] });

