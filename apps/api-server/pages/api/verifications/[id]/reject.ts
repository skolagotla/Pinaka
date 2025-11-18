/**
 * Reject Verification API
 * POST /api/verifications/:id/reject - Reject a verification request
 * 
 * Uses unified verification service
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');
const { rejectVerification } = require('@/lib/services/unified-verification-service');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid verification ID' });
    }

    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required',
      });
    }

    await rejectVerification(prisma, {
      verificationId: id,
      rejectedBy: user.userId,
      rejectedByRole: user.role,
      rejectedByEmail: user.email || '',
      rejectedByName: user.userName || user.email || '',
      rejectionReason: rejectionReason.trim(),
    });

    return res.status(200).json({
      success: true,
      message: 'Verification rejected',
    });
  } catch (error: any) {
    console.error('[Verifications Reject API] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to reject',
    });
  }
}, { requireRole: ['landlord', 'pmc', 'admin'], allowedMethods: ['POST'] });

