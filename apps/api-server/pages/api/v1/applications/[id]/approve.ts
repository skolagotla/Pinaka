/**
 * Approve Application API v1
 * POST /api/v1/applications/:id/approve
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { applicationService } from '@/lib/domains/application';
import { applicationApprovalSchema } from '@/lib/schemas';
import { z } from 'zod';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    // Only landlords and PMCs can approve applications
    if (user.role !== 'landlord' && user.role !== 'pmc' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get application via domain service
    const application = await applicationService.getById(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check permissions
    if (user.role === 'landlord') {
      // Check if application belongs to landlord's property using domain service
      const belongsToLandlord = await applicationService.belongsToLandlord(id, user.userId);
      if (!belongsToLandlord) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    // Parse request body
    const data = applicationApprovalSchema.parse(req.body || {});

    // Update application status to approved via domain service
    const updated = await applicationService.update(id, {
      status: 'approved',
      approvedBy: user.userId,
      approvedAt: new Date().toISOString(),
      notes: data?.notes,
    } as any);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Application approved successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Approve Application v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to approve application',
    });
  }
}, { requireRole: ['landlord', 'pmc', 'admin'], allowedMethods: ['POST'] });

