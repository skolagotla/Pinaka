/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN APPROVE LANDLORD
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');
const { APPROVAL_CONFIG, approveEntity } = require('@/lib/services/approval-service');

async function approveLandlord(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;
    const config = APPROVAL_CONFIG.landlord;

    const updatedLandlord = await approveEntity(prisma, config, {
      entityId: id as string,
      approverId: admin.id,
      approverName: `${admin.firstName} ${admin.lastName}`,
      approverRole: 'admin',
      req,
    });

    return res.status(200).json({
      success: true,
      data: updatedLandlord,
      message: 'Landlord approved successfully',
    });
  } catch (error: any) {
    console.error('[Admin Approvals] Error approving landlord:', error);
    const statusCode = error.message.includes('not found') ? 404 
      : error.message.includes('already') ? 400 
      : 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to approve landlord',
      message: error.message,
    });
  }
}

export default withAdminAuth(approveLandlord, { requireRole: 'super_admin' });

