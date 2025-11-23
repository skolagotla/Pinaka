/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN APPLICATION REJECTION API
 * ═══════════════════════════════════════════════════════════════
 * POST /api/admin/applications/[id]/reject - Reject application
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');
const { rejectApplication: rejectApplicationService, getApplicationConfig } = require('@/lib/services/application-service');

async function rejectApplication(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;
    const { reason, comment } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required',
      });
    }

    // Get invitation to determine type
    const invitation = await prisma.invitation.findUnique({
      where: { id: id as string },
      select: { type: true },
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Application not found',
      });
    }

    // Get config based on invitation type
    const applicationType = invitation.type === 'landlord' ? 'landlord' : 'pmc';
    const config = getApplicationConfig('admin', applicationType);

    // Get admin name
    const adminName = admin.name || admin.email || 'Admin';

    // Use shared service
    const result = await rejectApplicationService(prisma, config, {
      invitationId: id as string,
      rejectorId: admin.id,
      rejectorName: adminName,
      rejectorRole: 'admin',
      reason,
      comment,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[Admin Applications] Error rejecting:', error);
    const statusCode = error.message.includes('not found') ? 404 
      : error.message.includes('already') ? 400 
      : 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to reject application',
      message: error.message,
    });
  }
}

export default withAdminAuth(rejectApplication, { requireRole: 'super_admin' });

