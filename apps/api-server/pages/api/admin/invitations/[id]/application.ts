/**
 * ═══════════════════════════════════════════════════════════════
 * GET APPLICATION DETAILS BY INVITATION ID
 * ═══════════════════════════════════════════════════════════════
 * GET /api/admin/invitations/[id]/application - Get application details for an invitation
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');

async function getApplicationByInvitation(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invitation ID is required',
      });
    }

    // Get invitation with linked user data
    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        type: true,
        status: true,
        completedAt: true,
        createdAt: true,
        pmcId: true,
        landlordId: true,
        tenantId: true,
      },
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found',
      });
    }

    if (invitation.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Invitation is not completed yet',
      });
    }

    // Fetch user data based on invitation type
    let userData = null;
    let approvalStatus = null;

    if (invitation.type === 'pmc' && invitation.pmcId) {
      const pmc = await prisma.propertyManagementCompany.findUnique({
        where: { id: invitation.pmcId },
        select: {
          id: true,
          companyId: true,
          companyName: true,
          email: true,
          phone: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          provinceState: true,
          postalZip: true,
          country: true,
          countryCode: true,
          regionCode: true,
          defaultCommissionRate: true,
          approvalStatus: true,
          approvedAt: true,
          rejectedAt: true,
          rejectionReason: true,
          createdAt: true,
          countryFK: {
            select: {
              code: true,
              name: true,
            },
          },
          regionFK: {
            select: {
              code: true,
              name: true,
              countryCode: true,
            },
          },
        },
      });
      if (pmc) {
        userData = pmc;
        approvalStatus = pmc.approvalStatus;
      }
    } else if (invitation.type === 'landlord' && invitation.landlordId) {
      const landlord = await prisma.landlord.findUnique({
        where: { id: invitation.landlordId },
        select: {
          id: true,
          landlordId: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          approvalStatus: true,
          approvedAt: true,
          rejectedAt: true,
          rejectionReason: true,
          createdAt: true,
        },
      });
      if (landlord) {
        userData = landlord;
        approvalStatus = landlord.approvalStatus;
      }
    } else if (invitation.type === 'tenant' && invitation.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: invitation.tenantId },
        select: {
          id: true,
          tenantId: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          approvalStatus: true,
          approvedAt: true,
          rejectedAt: true,
          rejectionReason: true,
          createdAt: true,
        },
      });
      if (tenant) {
        userData = tenant;
        approvalStatus = tenant.approvalStatus;
      }
    }

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'Application data not found for this invitation',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          type: invitation.type,
          status: invitation.status,
          completedAt: invitation.completedAt,
          createdAt: invitation.createdAt,
        },
        user: userData,
        approvalStatus,
      },
    });
  } catch (error: any) {
    console.error('[Get Application by Invitation] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch application details',
      message: error.message,
    });
  }
}

export default withAdminAuth(getApplicationByInvitation, { requireRole: 'SUPER_ADMIN' });

