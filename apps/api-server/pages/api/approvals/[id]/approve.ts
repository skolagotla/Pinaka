/**
 * Approve Approval Request API
 * POST /api/approvals/:id/approve
 * 
 * Approves an approval request
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid approval ID' });
    }

    const { notes } = req.body || {};

    // Get the approval request
    const approvalRequest = await prisma.approvalRequest.findUnique({
      where: { id },
    });

    if (!approvalRequest) {
      return res.status(404).json({
        success: false,
        error: 'Approval request not found',
      });
    }

    if (approvalRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Approval request is already ${approvalRequest.status.toLowerCase()}`,
      });
    }

    // Update approval request
    const updated = await prisma.approvalRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: user.userId,
        approvedByType: user.role,
        approvedByEmail: user.email,
        approvedByName: user.userName || user.email,
        approvedAt: new Date(),
        approvalNotes: notes || null,
      },
    });

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Approval request approved successfully',
    });
  } catch (error: any) {
    console.error('[Approve Approval] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to approve request',
      message: error.message,
    });
  }
}, { allowedMethods: ['POST'] });

