/**
 * Reject Approval Request API
 * POST /api/approvals/:id/reject
 * 
 * Rejects an approval request
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { z } from 'zod';
const { prisma } = require('@/lib/prisma');

const rejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid approval ID' });
    }

    // Validate request body
    const { reason } = rejectSchema.parse(req.body);

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
        status: 'REJECTED',
        rejectedBy: user.userId,
        rejectedByType: user.role,
        rejectedByEmail: user.email,
        rejectedByName: user.userName || user.email,
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    });

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Approval request rejected successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Reject Approval] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reject request',
      message: error.message,
    });
  }
}, { allowedMethods: ['POST'] });

