/**
 * Add Vendor to Landlord API v1
 * POST /api/v1/vendors/:id/add-to-landlord
 * 
 * Domain-Driven, API-First implementation
 * Uses domain service instead of direct Prisma access
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { LandlordService, LandlordRepository } from '@/lib/domains/landlord';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid vendor ID' });
    }

    // Only landlords can add vendors to their list
    if (user.role !== 'landlord') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Use domain service to add vendor
    const repository = new LandlordRepository(prisma);
    const service = new LandlordService(repository);
    
    try {
      const relationship = await service.addVendor(user.userId, id);
      
      return res.status(200).json({
        success: true,
        data: relationship,
        message: 'Vendor added to your list successfully',
      });
    } catch (error: any) {
      // Handle case where vendor already exists
      if (error.message === 'Vendor already in your list' || error.message?.includes('already')) {
        // Try to get existing relationship
        const existing = await repository.addVendor(user.userId, id);
        return res.status(200).json({
          success: true,
          message: 'Vendor already in your list',
          data: existing,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('[Add Vendor to Landlord v1] Error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Vendor not found') {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      if (error.message === 'Landlord not found') {
        return res.status(404).json({ error: 'Landlord not found' });
      }
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to add vendor to landlord',
    });
  }
}, { requireRole: ['landlord'], allowedMethods: ['POST'] });

