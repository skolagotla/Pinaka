import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { withRequestId } from '@/lib/middleware/requestId';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { formatApiResponse, formatApiError, ErrorCodes } from '@/lib/utils/api-response';
import { invitationService } from '@/lib/domains/invitation';
const config = require('@/lib/config/app-config').default || require('@/lib/config/app-config');

/**
 * POST /api/v1/invitations/:id/resend
 * Resend an invitation email
 * 
 * Domain-Driven, API-First implementation
 * Uses domain service instead of direct Prisma access
 */
async function resendInvitation(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  const { id } = req.query;

  try {
    const updatedInvitation = await invitationService.resendInvitation(id as string, user);

    return res.status(200).json(formatApiResponse({
      data: {
        message: 'Invitation resent successfully',
        id: updatedInvitation.id,
        status: updatedInvitation.status,
      },
      req,
    }));
  } catch (error: any) {
    console.error('[Resend Invitation] Error:', error);
    
    // Handle domain service errors
    if (error.message.includes('not found')) {
      return res.status(404).json(formatApiError({
        code: ErrorCodes.NOT_FOUND,
        message: error.message,
        req,
      }));
    }
    
    if (error.message.includes('permission') || error.message.includes('Forbidden')) {
      return res.status(403).json(formatApiError({
        code: ErrorCodes.FORBIDDEN,
        message: error.message,
        req,
      }));
    }
    
    if (error.message.includes('Cannot resend')) {
      return res.status(400).json(formatApiError({
        code: ErrorCodes.BAD_REQUEST,
        message: error.message,
        req,
      }));
    }

    return res.status(500).json(formatApiError({
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'Failed to resend invitation',
      details: config.app.isDev ? { error: error.message } : undefined,
      req,
    }));
  }
}

const authHandler = withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  await resendInvitation(req, res, user);
}, { requireRole: 'landlord', allowedMethods: ['POST'] });

const wrappedHandler = async (req: NextApiRequest, res: NextApiResponse, user?: any) => {
  await authHandler(req, res);
};
const rateLimitedHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 resend attempts per window
})(wrappedHandler);

export default withRequestId(rateLimitedHandler);
