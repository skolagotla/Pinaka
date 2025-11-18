/**
 * Lease Termination API v1
 * POST /api/v1/leases/:id/terminate
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { leaseService } from '@/lib/domains/lease';
import { leaseTerminationSchema } from '@/lib/schemas';
import { z } from 'zod';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid lease ID' });
    }

    // Get lease via domain service
    const lease = await leaseService.getById(id);
    if (!lease) {
      return res.status(404).json({ error: 'Lease not found' });
    }

    // Check permissions - landlord or tenant can terminate
    if (user.role === 'landlord') {
      const belongsToLandlord = await leaseService.belongsToLandlord(id, user.userId);
      if (!belongsToLandlord) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } else if (user.role === 'tenant') {
      const hasTenant = await leaseService.hasTenant(id, user.userId);
      if (!hasTenant) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Parse request body
    const data = leaseTerminationSchema.parse(req.body);
    const terminationDate = typeof data.terminationDate === 'string' 
      ? new Date(data.terminationDate) 
      : data.terminationDate;

    // Update lease status to terminated via domain service
    const updated = await leaseService.update(id, {
      status: 'Terminated',
      terminationDate: terminationDate,
      terminationReason: data.reason,
      actualLoss: data.actualLoss,
    } as any);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Lease terminated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Lease Termination v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to terminate lease',
    });
  }
}, { requireRole: ['landlord', 'tenant'], allowedMethods: ['POST'] });

