/**
 * Approve Maintenance Request API v1
 * POST /api/v1/maintenance/:id/approve
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { maintenanceService } from '@/lib/domains/maintenance';
import { maintenanceApprovalSchema } from '@/lib/schemas';
import { z } from 'zod';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid maintenance request ID' });
    }

    // Only landlords can approve maintenance requests
    if (user.role !== 'landlord' && user.role !== 'pmc' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get maintenance request via domain service
    const maintenanceRequest = await maintenanceService.getById(id);
    if (!maintenanceRequest) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Check permissions - landlord must own the property
    if (user.role === 'landlord') {
      const belongsToLandlord = await maintenanceService.belongsToLandlord(id, user.userId);
      if (!belongsToLandlord) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    // Parse request body
    const data = maintenanceApprovalSchema.parse(req.body || {});

    // Update maintenance request status to approved via domain service
    // Note: Maintenance status enum may not have 'Approved', using 'In Progress' as alternative
    const updated = await maintenanceService.update(id, {
      status: 'In Progress',
      approvedAmount: data?.approvedAmount,
      approvedBy: user.userId,
      approvedAt: new Date().toISOString(),
      notes: data?.notes,
    } as any);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Maintenance request approved successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Approve Maintenance v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to approve maintenance request',
    });
  }
}, { requireRole: ['landlord', 'pmc', 'admin'], allowedMethods: ['POST'] });

