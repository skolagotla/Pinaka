import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { withRequestId } from '@/lib/middleware/requestId';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { formatApiResponse, formatApiError, ErrorCodes } from '@/lib/utils/api-response';
import { generateSecureToken } from '@/lib/utils/token-generator';
import { emitEvent, EventType } from '@/lib/events/emitter';
import { tenantInvitationService } from '@/lib/domains/tenant-invitation';
import { landlordService } from '@/lib/domains/landlord';
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
async function createInvitation(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
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

  try {
    // Generate secure token
    const token = generateSecureToken(32);

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Use domain service to create invitation (Domain-Driven Design)
    const invitation = await tenantInvitationService.create({
      email,
      token,
      invitedBy: user.userId,
      propertyId: propertyId || null,
      unitId: unitId || null,
      expiresAt,
      status: 'pending',
      metadata: prefillData || {},
    }, user);

    // Send invitation email (non-blocking - don't wait for email to complete)
    // Return success immediately and send email in background
    const landlord = await landlordService.getById(user.userId);

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
          tenantInvitationService.update(invitation.id, { status: 'sent' }, user).catch(err => {
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
          tenantInvitationService.update(invitation.id, { status: 'pending' }, user).catch(err => {
            console.error('[Create Invitation] Error updating status to pending:', err);
          });
        }
      })
      .catch((error) => {
        console.error('[Create Invitation] Error in email sending:', error);
        tenantInvitationService.update(invitation.id, { status: 'pending' }, user).catch(err => {
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
  } catch (error: any) {
    if (error.message === 'A tenant with this email already exists') {
      return res.status(409).json(formatApiError({
        code: 'TENANT_EXISTS',
        message: error.message,
        req,
      }));
    }
    if (error.message === 'An active invitation already exists for this email') {
      return res.status(409).json(formatApiError({
        code: 'INVITATION_EXISTS',
        message: error.message,
        req,
      }));
    }
    console.error('[Create Invitation] Error:', error);
    return res.status(500).json(formatApiError({
      code: ErrorCodes.INTERNAL_ERROR,
      message: error.message || 'Failed to create invitation',
      req,
    }));
  }
}

/**
 * GET /api/v1/tenants/invitations
 * List all invitations for the current landlord
 */
async function listInvitations(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  const { status, limit = 50, offset = 0 } = req.query;

  try {
    // Use domain service to list invitations (Domain-Driven Design)
    const result = await tenantInvitationService.list({
      status: status as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    }, user);

    return res.status(200).json(formatApiResponse({
      data: {
        invitations: result.invitations,
        pagination: {
          total: result.total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      },
      req,
    }));
  } catch (error: any) {
    console.error('[List Invitations] Error:', error);
    return res.status(500).json(formatApiError({
      code: ErrorCodes.INTERNAL_ERROR,
      message: error.message || 'Failed to list invitations',
      req,
    }));
  }
}

// Main handler
const handler = withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
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

