import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { withRequestId } from '@/lib/middleware/requestId';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { formatApiResponse, formatApiError, ErrorCodes } from '@/lib/utils/api-response';
import { emitEvent, EventType } from '@/lib/events/emitter';
import { tenantInvitationService } from '@/lib/domains/tenant-invitation';
const { sendTenantInvitation } = require('@/lib/email');

/**
 * GET /api/v1/tenants/invitations/:id
 * Get invitation details
 */
async function getInvitation(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  const { id } = req.query;

  try {
    // Use domain service to get invitation (Domain-Driven Design)
    const invitation = await tenantInvitationService.getById(id as string);

    if (!invitation) {
      return res.status(404).json(formatApiError({
        code: ErrorCodes.NOT_FOUND,
        message: 'Invitation not found',
        req,
      }));
    }

    // Check authorization
    if (invitation.invitedBy !== user.userId) {
      return res.status(403).json(formatApiError({
        code: ErrorCodes.FORBIDDEN,
        message: 'You do not have permission to view this invitation',
        req,
      }));
    }

    return res.status(200).json(formatApiResponse({
      data: invitation,
      req,
    }));
  } catch (error: any) {
    console.error('[Get Invitation] Error:', error);
    return res.status(500).json(formatApiError({
      code: ErrorCodes.INTERNAL_ERROR,
      message: error.message || 'Failed to get invitation',
      req,
    }));
  }
}

/**
 * DELETE /api/v1/tenants/invitations/:id
 * Cancel an invitation
 */
async function cancelInvitation(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  const { id } = req.query;

  try {
    // Use domain service to cancel invitation (Domain-Driven Design)
    const invitation = await tenantInvitationService.cancel(id as string, user);

    // Emit event
    await emitEvent(EventType.TENANT_INVITATION_CANCELLED, {
      invitationId: invitation.id,
      email: invitation.email,
    }, {
      userId: user.userId,
      userRole: user.role,
      requestId: req.headers['x-request-id'] as string,
    });

    return res.status(200).json(formatApiResponse({
      data: { message: 'Invitation cancelled successfully' },
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
    if (error.message === 'You do not have permission to cancel this invitation') {
      return res.status(403).json(formatApiError({
        code: ErrorCodes.FORBIDDEN,
        message: error.message,
        req,
      }));
    }
    if (error.message === 'Cannot cancel a completed invitation') {
      return res.status(400).json(formatApiError({
        code: ErrorCodes.BAD_REQUEST,
        message: error.message,
        req,
      }));
    }
    console.error('[Cancel Invitation] Error:', error);
    return res.status(500).json(formatApiError({
      code: ErrorCodes.INTERNAL_ERROR,
      message: error.message || 'Failed to cancel invitation',
      req,
    }));
  }
}

// Main handler
const handler = withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method === 'GET') {
    return getInvitation(req, res, user);
  }
  
  if (req.method === 'DELETE') {
    return cancelInvitation(req, res, user);
  }

  return res.status(405).json(formatApiError({
    code: ErrorCodes.BAD_REQUEST,
    message: 'Method not allowed',
    req,
  }));
}, { requireRole: 'landlord', allowedMethods: ['GET', 'DELETE'] });

const wrappedHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  await handler(req, res);
};
const rateLimitedHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})(wrappedHandler);

export default withRequestId(rateLimitedHandler);

