import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/apiMiddleware';
import { withRequestId } from '@/lib/middleware/requestId';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { formatApiResponse, formatApiError, ErrorCodes } from '@/lib/utils/api-response';
import { generateSecureToken } from '@/lib/utils/token-generator';
import { emitEvent, EventType } from '@/lib/events/emitter';
const { prisma } = require('@/lib/prisma');
const { sendTenantInvitation } = require('@/lib/email');
const config = require('@/lib/config/app-config').default || require('@/lib/config/app-config');

/**
 * POST /api/v1/tenants/invitations
 * Create a new tenant invitation
 * 
 * Body: {
 *   email: string (required)
 *   propertyId?: string
 *   unitId?: string
 *   prefillData?: { firstName?, lastName?, phone?, ... }
 *   expiresInDays?: number (default: 14)
 * }
 */
async function createInvitation(req: NextApiRequest, res: NextApiResponse, user: any) {
  // Check if landlord is PMC-managed (cannot send invitations)
  if (user.role === 'landlord') {
    const { isLandlordPMCManaged } = require('@/lib/utils/pmc-permissions');
    const { prisma } = require('@/lib/prisma');
    const isPMCManaged = await isLandlordPMCManaged(prisma, user.userId);
    if (isPMCManaged) {
      return res.status(403).json(formatApiError({
        code: 'PMC_MANAGED_RESTRICTION',
        message: 'PMC-managed landlords cannot send tenant invitations. Please contact your PMC to invite tenants.',
        req,
      }));
    }
  }

  const { email, propertyId, unitId, prefillData, expiresInDays = 14 } = req.body;

  if (!email) {
    return res.status(400).json(formatApiError({
      code: ErrorCodes.VALIDATION_ERROR,
      message: 'Email is required',
      req,
    }));
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json(formatApiError({
      code: ErrorCodes.VALIDATION_ERROR,
      message: 'Invalid email format',
      req,
    }));
  }

  // Check if tenant already exists
  const existingTenant = await prisma.tenant.findUnique({
    where: { email },
  });

  if (existingTenant) {
    return res.status(409).json(formatApiError({
      code: 'TENANT_EXISTS',
      message: 'A tenant with this email already exists',
      req,
    }));
  }

  // Check for existing pending invitation
  const existingInvitation = await prisma.tenantInvitation.findFirst({
    where: {
      email,
      status: { in: ['pending', 'sent', 'opened'] },
      expiresAt: { gt: new Date() },
    },
  });

  if (existingInvitation) {
    return res.status(409).json(formatApiError({
      code: 'INVITATION_EXISTS',
      message: 'An active invitation already exists for this email',
      details: { invitationId: existingInvitation.id },
      req,
    }));
  }

  // Generate secure token
  const token = generateSecureToken(32);

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  // Create invitation
  const invitation = await prisma.tenantInvitation.create({
    data: {
      email,
      token,
      invitedBy: user.userId,
      propertyId: propertyId || null,
      unitId: unitId || null,
      expiresAt,
      status: 'pending',
      metadata: prefillData || {},
    },
  });

  // Send invitation email (non-blocking - don't wait for email to complete)
  // Return success immediately and send email in background
  const landlord = await prisma.landlord.findUnique({
    where: { id: user.userId },
    select: { firstName: true, lastName: true },
  });

  // Send email in background (fire and forget)
  sendTenantInvitation({
    tenantEmail: email,
    tenantName: prefillData?.firstName && prefillData?.lastName
      ? `${prefillData.firstName} ${prefillData.lastName}`
      : 'Tenant',
    invitationToken: token,
    landlordName: landlord ? `${landlord.firstName} ${landlord.lastName}` : 'Landlord',
  })
    .then((emailResult) => {
      // Update status based on email result
      if (emailResult.success) {
        prisma.tenantInvitation.update({
          where: { id: invitation.id },
          data: { status: 'sent' },
        }).catch(err => {
          console.error('[Create Invitation] Error updating status to sent:', err);
        });
        
        // Emit event
        emitEvent(EventType.TENANT_INVITED, {
          invitationId: invitation.id,
          email,
          landlordId: user.userId,
        }, {
          userId: user.userId,
          userRole: user.role,
          requestId: req.headers['x-request-id'] as string,
        }).catch(err => {
          console.error('[Create Invitation] Error emitting event:', err);
        });
      } else {
        console.error('[Create Invitation] Email sending failed:', emailResult.error);
        prisma.tenantInvitation.update({
          where: { id: invitation.id },
          data: { status: 'pending' },
        }).catch(err => {
          console.error('[Create Invitation] Error updating status to pending:', err);
        });
      }
    })
    .catch((error) => {
      console.error('[Create Invitation] Error in email sending:', error);
      prisma.tenantInvitation.update({
        where: { id: invitation.id },
        data: { status: 'pending' },
      }).catch(err => {
        console.error('[Create Invitation] Error updating status to pending:', err);
      });
    });

  // Return success immediately (don't wait for email)
  return res.status(201).json(formatApiResponse({
    data: {
      id: invitation.id,
      email: invitation.email,
      status: 'pending', // Will be updated to 'sent' when email completes
      expiresAt: invitation.expiresAt,
    },
    req,
  }));
}

/**
 * GET /api/v1/tenants/invitations
 * List all invitations for the current landlord
 */
async function listInvitations(req: NextApiRequest, res: NextApiResponse, user: any) {
  const { status, limit = 50, offset = 0 } = req.query;

  const where: any = {
    invitedBy: user.userId,
  };

  if (status) {
    where.status = status;
  }

  const [invitations, total] = await Promise.all([
    prisma.tenantInvitation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      select: {
        id: true,
        email: true,
        status: true,
        expiresAt: true,
        openedAt: true,
        completedAt: true,
        reminderCount: true,
        createdAt: true,
        propertyId: true,
        unitId: true,
      },
    }),
    prisma.tenantInvitation.count({ where }),
  ]);

  return res.status(200).json(formatApiResponse({
    data: {
      invitations,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    },
    req,
  }));
}

// Main handler
const handler = withAuth(async (req: NextApiRequest, res: NextApiResponse, user: any) => {
  if (req.method === 'POST') {
    return createInvitation(req, res, user);
  }
  
  if (req.method === 'GET') {
    return listInvitations(req, res, user);
  }

  return res.status(405).json(formatApiError({
    code: ErrorCodes.BAD_REQUEST,
    message: 'Method not allowed',
    req,
  }));
}, { requireRole: 'landlord', allowedMethods: ['GET', 'POST'] });

// Apply middleware
const wrappedHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  await handler(req, res);
};
const rateLimitedHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
})(wrappedHandler);

export default withRequestId(rateLimitedHandler);

