/**
 * Verification Stats API
 * GET /api/v1/verifications/stats
 * 
 * Returns verification statistics for the authenticated user
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');

async function handleGet(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    // Dynamically import the service to avoid bundling issues
    const { getVerificationStats } = await import('@/lib/services/unified-verification-service');
    
    const stats = await getVerificationStats(prisma, {
      userId: user.userId,
      userRole: user.userRole || 'landlord',
    });
    
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('[Verification Stats API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load verification stats',
      message: error?.message || 'Unknown error',
    });
  }
}

export default (req: NextApiRequest, res: NextApiResponse) => 
  withAuth(handleGet)(req, res);

