/**
 * Tenant Approval API v1
 * POST /api/v1/tenants/:id/approve
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { tenantService } from '@/lib/domains/tenant';
import { tenantApprovalSchema } from '@/lib/schemas';
import { z } from 'zod';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }

    // Get tenant via domain service
    const tenant = await tenantService.getById(id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Check permissions - landlord or pmc can approve
    if (user.role === 'landlord') {
      // Verify tenant belongs to landlord's properties using domain service
      const belongsToLandlord = await tenantService.belongsToLandlord(id, user.userId);
      if (!belongsToLandlord) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } else if (user.role !== 'pmc' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update tenant status to approved
    const updated = await tenantService.update(id, {
      status: 'approved',
      approvedBy: user.userId,
      approvedAt: new Date().toISOString(),
    } as any);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Tenant application approved successfully',
    });
  } catch (error) {
    console.error('[Tenant Approval v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to approve tenant',
    });
  }
}, { requireRole: ['landlord', 'pmc', 'admin'], allowedMethods: ['POST'] });

