import { NextApiRequest, NextApiResponse } from 'next';
import { withRequestId } from '@/lib/middleware/requestId';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { formatApiResponse, formatApiError, ErrorCodes } from '@/lib/utils/api-response';
import { emitEvent, EventType } from '@/lib/events/emitter';
import { getCachedInvitation, setCachedInvitation, invalidateInvitationCache } from '@/lib/utils/invitation-cache';
const { prisma } = require('@/lib/prisma');

/**
 * GET /api/v1/public/tenants/invitations/:token
 * Public endpoint to get invitation details (for tenant to view before accepting)
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

  if (!token) {
    return res.status(400).json(formatApiError({
      code: ErrorCodes.VALIDATION_ERROR,
      message: 'Token is required',
      req,
    }));
  }

  const tokenString = token as string;

  // Check cache first (reduces database queries)
  const cached = getCachedInvitation(tokenString);
  if (cached) {
    // Return cached data (but still check expiration)
    const isExpired = new Date(cached.expiresAt) < new Date();
    if (isExpired && cached.status !== 'expired') {
      // Update status in background (don't block response)
      prisma.tenantInvitation.update({
        where: { id: cached.id },
        data: { status: 'expired' },
      }).catch(console.error);
      
      cached.status = 'expired';
      invalidateInvitationCache(tokenString);
    }
    
    return res.status(200).json(formatApiResponse({
      data: {
        id: cached.id,
        email: cached.email,
        status: cached.status,
        expiresAt: cached.expiresAt,
        isExpired,
        landlord: cached.landlord,
        metadata: cached.metadata,
      },
      req,
    }));
  }

  // Cache miss - fetch from database
  const invitation = await prisma.tenantInvitation.findUnique({
    where: { token: tokenString },
    include: {
      landlord: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!invitation) {
    return res.status(404).json(formatApiError({
      code: ErrorCodes.NOT_FOUND,
      message: 'Invalid invitation token',
      req,
    }));
  }

  // Check if expired
  const isExpired = new Date(invitation.expiresAt) < new Date();
  if (isExpired && invitation.status !== 'expired') {
    await prisma.tenantInvitation.update({
      where: { id: invitation.id },
      data: { status: 'expired' },
    });
    invitation.status = 'expired';
    
    await emitEvent(EventType.TENANT_INVITATION_EXPIRED, {
      invitationId: invitation.id,
      email: invitation.email,
    });
  }

  // Track that invitation was opened (if not already)
  if (invitation.status === 'sent' || invitation.status === 'pending') {
    await prisma.tenantInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'opened',
        openedAt: new Date(),
      },
    });

    await emitEvent(EventType.TENANT_INVITATION_OPENED, {
      invitationId: invitation.id,
      email: invitation.email,
    });
  }

  // Prepare response data
  const responseData = {
    id: invitation.id,
    email: invitation.email,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    isExpired,
    landlord: invitation.landlord,
    metadata: invitation.metadata, // Prefill data
  };

  // Cache the response (before status updates)
  setCachedInvitation(tokenString, {
    ...responseData,
    landlord: invitation.landlord,
  });

  // Return safe invitation data (no sensitive info)
  return res.status(200).json(formatApiResponse({
    data: responseData,
    req,
  }));
}

// Public endpoint - no auth required
// Use token-based rate limiting (each invitation token has its own limit)
// More lenient limits since this is a one-time access page
const rateLimitedHandler = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes (reduced from 15)
  max: 200, // Increased limit for invitation viewing (was 100)
  keyGenerator: (req) => {
    // Use token as part of the key so each invitation has its own rate limit
    const token = req.query.token as string;
    const ip = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';
    return `invitation:${token || 'no-token'}:${ip}`;
  },
  message: 'Too many requests for this invitation. Please try again later.',
})(getInvitationByToken);

export default withRequestId(rateLimitedHandler);

