/**
 * Remove Vendor from Landlord API v1
 * DELETE /api/v1/vendors/:id/remove-from-landlord
 * 
 * Domain-Driven, API-First implementation
 * Uses domain service instead of direct Prisma access
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { LandlordService, LandlordRepository } from '@/lib/domains/landlord';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid vendor ID' });
    }

    // Only landlords can remove vendors from their list
    if (user.role !== 'landlord') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Use domain service to remove vendor
    const repository = new LandlordRepository(prisma);
    const service = new LandlordService(repository);
    
    await service.removeVendor(user.userId, id);

    return res.status(200).json({
      success: true,
      message: 'Vendor removed from your list successfully',
    });
  } catch (error) {
    console.error('[Remove Vendor from Landlord v1] Error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Vendor not found in landlord\'s list') {
        return res.status(404).json({ error: 'Vendor not found in your list' });
      }
      if (error.message === 'Landlord not found') {
        return res.status(404).json({ error: 'Landlord not found' });
      }
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to remove vendor from landlord',
    });
  }
}, { requireRole: ['landlord'], allowedMethods: ['DELETE'] });

