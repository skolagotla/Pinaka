/**
 * Verify Verification API
 * POST /api/verifications/:id/verify - Verify a verification request
 * 
 * Uses unified verification service
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');
const { verifyVerification } = require('@/lib/services/unified-verification-service');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid verification ID' });
    }

    const { verificationNotes } = req.body;

    await verifyVerification(prisma, {
      verificationId: id,
      verifiedBy: user.userId,
      verifiedByRole: user.role,
      verifiedByEmail: user.email || '',
      verifiedByName: user.userName || user.email || '',
      verificationNotes: verificationNotes || null,
    });

    return res.status(200).json({
      success: true,
      message: 'Verification approved successfully',
    });
  } catch (error: any) {
    console.error('[Verifications Verify API] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify',
    });
  }
}, { requireRole: ['landlord', 'pmc', 'admin'], allowedMethods: ['POST'] });

