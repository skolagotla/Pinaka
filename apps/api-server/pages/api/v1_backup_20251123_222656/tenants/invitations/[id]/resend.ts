import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { withRequestId } from '@/lib/middleware/requestId';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { formatApiResponse, formatApiError, ErrorCodes } from '@/lib/utils/api-response';
import { tenantInvitationService } from '@/lib/domains/tenant-invitation';
const { sendTenantInvitation } = require('@/lib/email');
const config = require('@/lib/config/app-config').default || require('@/lib/config/app-config');

/**
 * POST /api/v1/tenants/invitations/:id/resend
 * Resend an invitation email
 */
async function resendInvitation(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  const { id } = req.query;

  try {
    // Use domain service to resend invitation (Domain-Driven Design)
    const invitation = await tenantInvitationService.resendInvitation(id as string, user);

    // Send email
    const prefillData = invitation.metadata as any || {};
    
    // Log resend attempt
    console.log('[Resend Invitation] Attempting to resend invitation:', {
      invitationId: invitation.id,
      email: invitation.email,
      status: invitation.status,
      gmailConfigured: config.email.gmail.isConfigured,
    });
    
    const emailResult = await sendTenantInvitation({
      tenantEmail: invitation.email,
      tenantName: prefillData?.firstName && prefillData?.lastName
        ? `${prefillData.firstName} ${prefillData.lastName}`
        : 'Tenant',
      invitationToken: invitation.token,
      landlordName: invitation.landlord
        ? `${invitation.landlord.firstName} ${invitation.landlord.lastName}`
        : 'Landlord',
    });

    // Check if email was actually sent
    if (!emailResult.success) {
      const errorMessage = emailResult.error || 'Unknown error';
      console.error('[Resend Invitation] Email sending failed:', errorMessage);
      console.error('[Resend Invitation] Full error details:', JSON.stringify(emailResult, null, 2));
      console.error('[Resend Invitation] Gmail config check:', {
        hasGmailUser: !!config.email.gmail.user,
        hasGmailPassword: !!config.email.gmail.appPassword,
        baseUrl: config.auth.baseUrl,
      });
      
      return res.status(500).json(formatApiError({
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to resend invitation email',
        details: config.app.isDev 
          ? {
              error: errorMessage,
              fullError: emailResult,
              gmailConfigured: config.email.gmail.isConfigured,
            }
          : undefined,
        req,
      }));
    }
    
    console.log('[Resend Invitation] Email sent successfully:', {
      invitationId: invitation.id,
      email: invitation.email,
      messageId: emailResult.data?.messageId,
    });

    // Update reminder count
    await tenantInvitationService.update(id as string, {
      status: 'sent',
      reminderCount: (invitation.reminderCount || 0) + 1,
      reminderSentAt: new Date(),
    } as any, user);

    return res.status(200).json(formatApiResponse({
      data: { message: 'Invitation resent successfully' },
      req,
    }));
  } catch (error: any) {
    if (error.message === 'Invitation not found') {
      return res.status(404).json(formatApiError({
        code: ErrorCodes.NOT_FOUND,
        message: error.message,
        req,
      }));
    }
    if (error.message === 'You do not have permission to resend this invitation') {
      return res.status(403).json(formatApiError({
        code: ErrorCodes.FORBIDDEN,
        message: error.message,
        req,
      }));
    }
    if (error.message.includes('Cannot resend') || error.message.includes('expired')) {
      return res.status(400).json(formatApiError({
        code: ErrorCodes.BAD_REQUEST,
        message: error.message,
        req,
      }));
    }
    console.error('[Resend Invitation] Unexpected error:', error);
    console.error('[Resend Invitation] Error stack:', error.stack);
    
    return res.status(500).json(formatApiError({
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'Failed to resend invitation email',
      details: config.app.isDev 
        ? {
            message: error.message,
            stack: error.stack,
            gmailConfigured: config.email.gmail.isConfigured,
          }
        : undefined,
      req,
    }));
  }
}

// Main handler
const handler = withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method === 'POST') {
    return resendInvitation(req, res, user);
  }

  return res.status(405).json(formatApiError({
    code: ErrorCodes.BAD_REQUEST,
    message: 'Method not allowed',
    req,
  }));
}, { requireRole: 'landlord', allowedMethods: ['POST'] });

const wrappedHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  await handler(req, res);
};
const rateLimitedHandler = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes (reduced for testing, increase to 15 minutes before going live)
  max: 30, // Increased limit for resend attempts (was 20)
  message: 'Too many resend attempts. Please wait a few minutes before trying again.',
})(wrappedHandler);

export default withRequestId(rateLimitedHandler);

