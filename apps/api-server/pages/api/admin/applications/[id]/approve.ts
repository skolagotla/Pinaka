/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN APPLICATION APPROVAL API
 * ═══════════════════════════════════════════════════════════════
 * POST /api/admin/applications/[id]/approve - Approve application
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');
const { approveApplication: approveApplicationService, getApplicationConfig } = require('@/lib/services/application-service');

async function approveApplication(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;
    const { comment } = req.body;

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
    const result = await approveApplicationService(prisma, config, {
      invitationId: id as string,
      approverId: admin.id,
      approverName: adminName,
      approverRole: 'admin',
      comment,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[Admin Applications] Error approving:', error);
    const statusCode = error.message.includes('not found') ? 404 
      : error.message.includes('already') ? 400 
      : 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to approve application',
      message: error.message,
    });
  }
}

export default withAdminAuth(approveApplication, { requireRole: 'super_admin' });

