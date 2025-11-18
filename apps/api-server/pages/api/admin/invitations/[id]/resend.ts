/**
 * POST /api/admin/invitations/:id/resend
 * Resend an admin invitation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { sendLandlordInvitation, sendPMCInvitation } from '@/lib/email';
const { prisma } = require('@/lib/prisma');
const config = require('@/lib/config/app-config').default || require('@/lib/config/app-config');

async function resendInvitation(req: NextApiRequest, res: NextApiResponse, admin: any) {
  const { id } = req.query;

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id: id as string },
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found',
      });
    }

    // Check if invitation is still valid
    if (invitation.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot resend a completed invitation',
      });
    }

    if (invitation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Cannot resend a cancelled invitation',
      });
    }

    // Check if expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot resend an expired invitation. Please create a new one.',
      });
    }

    // Send invitation email based on type
    const baseUrl = config.auth.baseUrl;
    const invitationUrl = `${baseUrl}/accept-invitation?token=${invitation.token}`;

    let emailResult;
    if (invitation.type === 'landlord') {
      const landlordName = invitation.metadata?.firstName && invitation.metadata?.lastName
        ? `${invitation.metadata.firstName} ${invitation.metadata.lastName}`
        : 'Landlord';
      emailResult = await sendLandlordInvitation({
        landlordEmail: invitation.email,
        landlordName,
        invitationToken: invitation.token,
        inviterName: admin.firstName && admin.lastName ? `${admin.firstName} ${admin.lastName}` : 'Admin',
      });
    } else if (invitation.type === 'pmc') {
      const companyName = invitation.metadata?.companyName || 'Property Management Company';
      emailResult = await sendPMCInvitation({
        pmcEmail: invitation.email,
        pmcName: companyName,
        invitationToken: invitation.token,
        inviterName: admin.firstName && admin.lastName ? `${admin.firstName} ${admin.lastName}` : 'Admin',
      });
    } else if (invitation.type === 'vendor' || invitation.type === 'contractor') {
      // Use generic invitation template (fallback to landlord template)
      const businessName = invitation.metadata?.businessName || invitation.metadata?.companyName || 'Business';
      emailResult = await sendLandlordInvitation({
        landlordEmail: invitation.email,
        landlordName: businessName,
        invitationToken: invitation.token,
        inviterName: admin.firstName && admin.lastName ? `${admin.firstName} ${admin.lastName}` : 'Admin',
      });
    } else {
      return res.status(400).json({
        success: false,
        error: `Email template not yet implemented for type: ${invitation.type}`,
      });
    }

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to resend invitation email',
        details: config.app.isDev ? emailResult.error : undefined,
      });
    }

    // Update invitation status to 'sent'
    await prisma.invitation.update({
      where: { id: id as string },
      data: { status: 'sent' },
    });

    return res.status(200).json({
      success: true,
      message: 'Invitation resent successfully',
    });
  } catch (error: any) {
    console.error('[Admin Resend Invitation] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to resend invitation',
      message: error.message,
    });
  }
}

export default withAdminAuth(resendInvitation, { allowedMethods: ['POST'] });

