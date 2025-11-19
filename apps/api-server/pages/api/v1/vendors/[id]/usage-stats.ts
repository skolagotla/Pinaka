/**
 * Vendor Usage Statistics API v1
 * GET /api/v1/vendors/:id/usage-stats
 * 
 * Domain-Driven, API-First implementation
 * Uses domain service instead of direct Prisma access
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { vendorService } from '@/lib/domains/vendor';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid vendor ID' });
    }

    // Use domain service singleton for usage statistics (Domain-Driven Design)
    const result = await vendorService.getUsageStats(id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Vendor Usage Stats v1] Error:', error);
    
    if (error instanceof Error && error.message === 'Vendor not found') {
      return res.status(404).json({
        error: 'Vendor not found',
      });
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch vendor usage statistics',
    });
  }
}, { requireRole: ['landlord', 'pmc', 'admin'], allowedMethods: ['GET'] });

