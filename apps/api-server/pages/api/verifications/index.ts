/**
 * Verifications API
 * GET /api/verifications - List verifications
 * 
 * Uses unified verification service
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');
const { listVerifications } = require('@/lib/services/unified-verification-service');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      verificationType,
      status,
      assignedTo,
      requestedBy,
      page = '1',
      limit = '50',
      orderBy = 'requestedAt',
      orderDirection = 'desc',
    } = req.query;

    const options: any = {
      userId: user.userId,
      userRole: user.role,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      orderBy: orderBy as string,
      orderDirection: orderDirection as 'asc' | 'desc',
    };

    if (verificationType) {
      options.verificationType = verificationType as string;
    }
    if (status) {
      options.status = status as string;
    }
    if (assignedTo) {
      options.assignedTo = assignedTo as string;
    }
    if (requestedBy) {
      options.requestedBy = requestedBy as string;
    }

    const result = await listVerifications(prisma, options);

    return res.status(200).json({
      success: true,
      data: result.verifications,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('[Verifications API] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to load verifications',
    });
  }
}, { requireRole: ['landlord', 'pmc', 'admin', 'tenant'], allowedMethods: ['GET'] });

