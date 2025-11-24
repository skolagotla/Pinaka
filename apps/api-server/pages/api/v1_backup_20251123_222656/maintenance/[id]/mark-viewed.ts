/**
 * Mark Maintenance as Viewed API v1
 * POST /api/v1/maintenance/:id/mark-viewed
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { maintenanceService } from '@/lib/domains/maintenance';
import { maintenanceMarkViewedSchema } from '@/lib/schemas';
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

    // Get maintenance request via domain service
    const maintenanceRequest = await maintenanceService.getById(id);
    if (!maintenanceRequest) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Check permissions
    if (user.role === 'tenant') {
      if (maintenanceRequest.tenantId !== user.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } else if (user.role === 'landlord') {
      // Check if maintenance belongs to landlord's property using domain service
      const belongsToLandlord = await maintenanceService.belongsToLandlord(id, user.userId);
      if (!belongsToLandlord) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    // Parse request body
    const data = maintenanceMarkViewedSchema.parse(req.body);

    // Update viewed status based on role
    const updateData: any = {};
    if (data.role === 'landlord') {
      updateData.lastViewedByLandlord = new Date();
    } else if (data.role === 'tenant') {
      updateData.lastViewedByTenant = new Date();
    }

    // Update maintenance request via domain service
    await maintenanceService.update(id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Maintenance request marked as viewed',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Mark Maintenance Viewed v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to mark maintenance as viewed',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc'], allowedMethods: ['POST'] });

