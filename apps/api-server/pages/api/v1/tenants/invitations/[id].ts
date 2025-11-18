import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/apiMiddleware';
import { withRequestId } from '@/lib/middleware/requestId';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { formatApiResponse, formatApiError, ErrorCodes } from '@/lib/utils/api-response';
import { emitEvent, EventType } from '@/lib/events/emitter';
const { prisma } = require('@/lib/prisma');
const { sendTenantInvitation } = require('@/lib/email');

/**
 * GET /api/v1/tenants/invitations/:id
 * Get invitation details
 */
async function getInvitation(req: NextApiRequest, res: NextApiResponse, user: any) {
  const { id } = req.query;

  const invitation = await prisma.tenantInvitation.findUnique({
    where: { id: id as string },
    include: {
      landlord: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

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
}

/**
 * DELETE /api/v1/tenants/invitations/:id
 * Cancel an invitation
 */
async function cancelInvitation(req: NextApiRequest, res: NextApiResponse, user: any) {
  const { id } = req.query;

  const invitation = await prisma.tenantInvitation.findUnique({
    where: { id: id as string },
  });

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
      message: 'You do not have permission to cancel this invitation',
      req,
    }));
  }

  // Only cancel if not already completed
  if (invitation.status === 'completed') {
    return res.status(400).json(formatApiError({
      code: ErrorCodes.BAD_REQUEST,
      message: 'Cannot cancel a completed invitation',
      req,
    }));
  }

  // Update status
  await prisma.tenantInvitation.update({
    where: { id: id as string },
    data: { status: 'cancelled' },
  });

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
}

// Main handler
const handler = withAuth(async (req: NextApiRequest, res: NextApiResponse, user: any) => {
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

