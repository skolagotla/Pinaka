/**
 * Lease Renewal API v1
 * POST /api/v1/leases/:id/renew
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { leaseService } from '@/lib/domains/lease';
import { leaseRenewalSchema } from '@/lib/schemas';
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

    // Check permissions - landlord or tenant can renew
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
    const data = leaseRenewalSchema.parse(req.body);

    // Update lease renewal decision
    const updateData: any = {
      renewalDecision: data.decision,
    };

    if (data.decision === 'renew') {
      if (data.newLeaseEnd) {
        updateData.endDate = new Date(data.newLeaseEnd);
      }
      if (data.newRentAmount !== undefined) {
        updateData.monthlyRent = data.newRentAmount;
      }
    } else if (data.decision === 'month-to-month') {
      // Convert to month-to-month (no end date)
      updateData.endDate = null;
      updateData.isMonthToMonth = true;
    } else if (data.decision === 'terminate') {
      // Mark for termination
      updateData.renewalDecision = 'terminate';
    }

    const updated = await leaseService.update(id, updateData as any);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Lease renewal decision saved successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Lease Renewal v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to renew lease',
    });
  }
}, { requireRole: ['landlord', 'tenant'], allowedMethods: ['POST'] });

