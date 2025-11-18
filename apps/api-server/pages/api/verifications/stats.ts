/**
 * Verifications Stats API
 * GET /api/verifications/stats - Get verification statistics
 * 
 * Uses unified verification service
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');
const { getVerificationStats } = require('@/lib/services/unified-verification-service');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      verificationType,
      status,
    } = req.query;

    const options: any = {
      userId: user.userId,
      userRole: user.role,
    };

    if (verificationType) {
      options.verificationType = verificationType as string;
    }
    if (status) {
      options.status = status as string;
    }

    const stats = await getVerificationStats(prisma, options);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('[Verifications Stats API] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to load stats',
    });
  }
}, { requireRole: ['landlord', 'pmc', 'admin', 'tenant'], allowedMethods: ['GET'] });

