import { NextApiRequest, NextApiResponse } from 'next';
import { withRequestId } from '@/lib/middleware/requestId';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { formatApiResponse, formatApiError, ErrorCodes } from '@/lib/utils/api-response';
import { invitationService } from '@/lib/domains/invitation';
const { prisma } = require('@/lib/prisma');
const config = require('@/lib/config/app-config').default || require('@/lib/config/app-config');

/**
 * GET /api/v1/public/invitations/:token
 * Public endpoint to get invitation details by token (no auth required)
 */
async function getInvitationByToken(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json(formatApiError({
      code: ErrorCodes.BAD_REQUEST,
      message: 'Method not allowed',
      req,
    }));
  }

  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json(formatApiError({
      code: ErrorCodes.VALIDATION_ERROR,
      message: 'Token is required',
      req,
    }));
  }

  try {
    // Use domain service to find invitation by token (Domain-Driven Design)
    let invitation = await invitationService.getInvitationByToken(token);

    // If not found, check TenantInvitation table (for tenant-specific invitations)
    if (!invitation) {
      const tenantInvitation = await prisma.tenantInvitation.findUnique({
        where: { token },
        include: {
          landlord: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      if (tenantInvitation) {
        // Convert TenantInvitation to match Invitation format for the response
        invitation = {
          id: tenantInvitation.id,
          email: tenantInvitation.email,
          type: 'tenant',
          status: tenantInvitation.status,
          expiresAt: tenantInvitation.expiresAt,
          metadata: tenantInvitation.metadata as any,
          invitedByName: tenantInvitation.landlord 
            ? `${tenantInvitation.landlord.firstName} ${tenantInvitation.landlord.lastName}`
            : 'Landlord',
          invitedByRole: 'landlord', // TenantInvitation is always from landlord
          landlord: tenantInvitation.landlord,
          tenant: null,
          openedAt: tenantInvitation.openedAt,
        } as any;
      }
    }

    if (!invitation) {
      return res.status(404).json(formatApiError({
        code: ErrorCodes.NOT_FOUND,
        message: 'Invalid invitation token',
        req,
      }));
    }

    // Check if cancelled
    if (invitation.status === 'cancelled') {
      return res.status(400).json(formatApiError({
        code: ErrorCodes.BAD_REQUEST,
        message: 'This invitation has been cancelled',
        req,
      }));
    }

    // Check if expired
    if (new Date(invitation.expiresAt) < new Date()) {
      // Update status to expired (handle both Invitation and TenantInvitation)
      if (invitation.type === 'tenant') {
        await prisma.tenantInvitation.update({
          where: { id: invitation.id },
          data: { status: 'expired' },
        });
      } else {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'expired' },
        });
      }

      return res.status(400).json(formatApiError({
        code: ErrorCodes.BAD_REQUEST,
        message: 'This invitation has expired',
        req,
      }));
    }

    // Check if already completed
    if (invitation.status === 'completed') {
      return res.status(400).json(formatApiError({
        code: ErrorCodes.BAD_REQUEST,
        message: 'This invitation has already been accepted',
        req,
      }));
    }

    // Track that invitation was opened
    if (invitation.status === 'sent' && !invitation.openedAt) {
      if (invitation.type === 'tenant') {
        // Update TenantInvitation status
        await prisma.tenantInvitation.update({
          where: { id: invitation.id },
          data: {
            status: 'opened',
            openedAt: new Date(),
          },
        });
      } else {
        // Update generic Invitation
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { openedAt: new Date() },
        });
      }
    } else if (invitation.type === 'tenant' && (invitation.status === 'pending' || invitation.status === 'sent')) {
      // Also handle pending tenant invitations
      await prisma.tenantInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'opened',
          openedAt: new Date(),
        },
      });
    }

    // Get company name from included PMC or fetch if needed
    let companyName = null;
    if (invitation.invitedByPMC) {
      companyName = invitation.invitedByPMC.companyName;
    } else if (invitation.invitedByRole === 'pmc' && invitation.invitedBy) {
      const pmc = await prisma.propertyManagementCompany.findUnique({
        where: { id: invitation.invitedBy },
        select: { companyName: true },
      });
      if (pmc) {
        companyName = pmc.companyName;
      }
    }

    // Get landlord name from included landlord or from invitedByLandlord
    let landlordData: { firstName: any; lastName: any } | null = null;
    if (invitation.landlord) {
      landlordData = {
        firstName: invitation.landlord.firstName,
        lastName: invitation.landlord.lastName,
      };
    } else if (invitation.invitedByLandlord) {
      landlordData = {
        firstName: invitation.invitedByLandlord.firstName,
        lastName: invitation.invitedByLandlord.lastName,
      };
    }

    // Get PMC data
    let pmcData: { companyName: any } | null = null;
    if (invitation.invitedByPMC) {
      pmcData = {
        companyName: invitation.invitedByPMC.companyName,
      };
    }

    // Return public-safe invitation data
    return res.status(200).json(formatApiResponse({
      data: {
        id: invitation.id,
        email: invitation.email,
        type: invitation.type,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        metadata: invitation.metadata,
        invitedByName: invitation.invitedByName,
        invitedByRole: invitation.invitedByRole, // Include role for message customization
        companyName: companyName, // Include company name if PMC (for backward compatibility)
        landlord: landlordData, // Include landlord name for tenant messages
        pmc: pmcData, // Include PMC data for tenant messages
      },
      req,
    }));
  } catch (error: any) {
    console.error('[Get Invitation by Token] Error:', error);
    return res.status(500).json(formatApiError({
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'Failed to fetch invitation',
      details: config.app.isDev ? { error: error.message } : undefined,
      req,
    }));
  }
}

const rateLimitedHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 lookups per window
})(getInvitationByToken);

export default withRequestId(rateLimitedHandler);

