/**
 * ═══════════════════════════════════════════════════════════════
 * USER STATUS API
 * ═══════════════════════════════════════════════════════════════
 * GET /api/v1/user/status - Get current user's approval status
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');

async function getUserStatus(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    let userRecord: any = null;
    let role = 'unknown';

    // Find user in all roles
    const [landlord, tenant, pmc] = await Promise.all([
      prisma.landlord.findUnique({
        where: { email: user.email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          approvalStatus: true,
          rejectedAt: true,
          rejectionReason: true,
        },
      }),
      prisma.tenant.findUnique({
        where: { email: user.email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          approvalStatus: true,
          rejectedAt: true,
          rejectionReason: true,
        },
      }),
      prisma.propertyManagementCompany.findUnique({
        where: { email: user.email },
        select: {
          id: true,
          email: true,
          companyName: true,
          approvalStatus: true,
          rejectedAt: true,
          rejectionReason: true,
        },
      }),
    ]);

    if (landlord) {
      userRecord = landlord;
      role = 'landlord';
    } else if (tenant) {
      userRecord = tenant;
      role = 'tenant';
    } else if (pmc) {
      userRecord = pmc;
      role = 'pmc';
    }

    if (!userRecord) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      role,
      approvalStatus: userRecord.approvalStatus || 'PENDING',
      rejectionReason: userRecord.rejectionReason || null,
      rejectedAt: userRecord.rejectedAt || null,
    });
  } catch (error: any) {
    console.error('[User Status] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user status',
      message: error.message,
    });
  }
}

// This endpoint should be accessible to any authenticated user, even if they don't have a role yet (pending approval)
export default withAuth(getUserStatus, { skipAuth: false });

