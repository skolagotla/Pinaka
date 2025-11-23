/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN REJECT LANDLORD
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');
const { APPROVAL_CONFIG, rejectEntity } = require('@/lib/services/approval-service');

async function rejectLandlord(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;
    const { reason } = req.body;
    const config = APPROVAL_CONFIG.landlord;

    const updatedLandlord = await rejectEntity(prisma, config, {
      entityId: id as string,
      rejectorId: admin.id,
      rejectorName: `${admin.firstName} ${admin.lastName}`,
      rejectorRole: 'admin',
      reason,
      req,
    });

    return res.status(200).json({
      success: true,
      data: updatedLandlord,
      message: 'Landlord rejected successfully',
    });
  } catch (error: any) {
    console.error('[Admin Approvals] Error rejecting landlord:', error);
    const statusCode = error.message.includes('not found') ? 404 
      : error.message.includes('already') ? 400 
      : 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to reject landlord',
      message: error.message,
    });
  }
}

export default withAdminAuth(rejectLandlord, { requireRole: 'super_admin' });

