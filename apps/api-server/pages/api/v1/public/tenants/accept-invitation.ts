import { NextApiRequest, NextApiResponse } from 'next';
import { withRequestId } from '@/lib/middleware/requestId';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { formatApiResponse, formatApiError, ErrorCodes } from '@/lib/utils/api-response';
import { emitEvent, EventType } from '@/lib/events/emitter';
import { invalidateInvitationCache } from '@/lib/utils/invitation-cache';
import { tenantInvitationService } from '@/lib/domains/tenant-invitation';
import { tenantService } from '@/lib/domains/tenant';
const config = require('@/lib/config/app-config').default || require('@/lib/config/app-config');

/**
 * POST /api/v1/public/tenants/accept-invitation
 * Public endpoint for tenants to accept invitation and submit their information
 * 
 * Body: {
 *   token: string (required)
 *   formData: { firstName, lastName, email, phone, ... }
 * }
 */
async function acceptInvitation(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json(formatApiError({
      code: ErrorCodes.BAD_REQUEST,
      message: 'Method not allowed',
      req,
    }));
  }

  const { token, formData } = req.body;

  if (!token) {
    return res.status(400).json(formatApiError({
      code: ErrorCodes.VALIDATION_ERROR,
      message: 'Token is required',
      req,
    }));
  }

  if (!formData) {
    return res.status(400).json(formatApiError({
      code: ErrorCodes.VALIDATION_ERROR,
      message: 'Form data is required',
      req,
    }));
  }

  try {
    // Use domain service to get invitation by token (Domain-Driven Design)
    const invitation = await tenantInvitationService.getByToken(token);

    if (!invitation) {
      return res.status(404).json(formatApiError({
        code: ErrorCodes.NOT_FOUND,
        message: 'Invalid invitation token',
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
      // Use domain service to update invitation status (no user context for system operations)
      await tenantInvitationService.update(invitation.id, { status: 'expired' });

      await emitEvent(EventType.TENANT_INVITATION_EXPIRED, {
        invitationId: invitation.id,
        email: invitation.email,
      });

      return res.status(400).json(formatApiError({
        code: ErrorCodes.BAD_REQUEST,
        message: 'This invitation has expired',
        req,
      }));
    }

    // Validate email matches
    if (formData.email && formData.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(400).json(formatApiError({
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Email does not match invitation',
        req,
      }));
    }

    // Check if tenant already exists using domain service (Domain-Driven Design)
    let tenant = await tenantService.getByEmail(invitation.email);

    if (tenant) {
      // Update existing tenant using domain service (Domain-Driven Design)
      tenant = await tenantService.update(tenant.id, {
        firstName: formData.firstName || tenant.firstName,
        lastName: formData.lastName || tenant.lastName,
        middleName: formData.middleName || tenant.middleName,
        phone: formData.phone || tenant.phone,
        country: formData.country || tenant.country,
        provinceState: formData.provinceState || tenant.provinceState,
        postalZip: formData.postalZip || tenant.postalZip,
        dateOfBirth: formData.dateOfBirth || tenant.dateOfBirth,
        currentAddress: formData.currentAddress || tenant.currentAddress,
        city: formData.city || tenant.city,
        numberOfAdults: formData.numberOfAdults || tenant.numberOfAdults,
        numberOfChildren: formData.numberOfChildren || tenant.numberOfChildren,
        hasAccess: true,
      } as any);
    } else {
      // Create new tenant using domain service (Domain-Driven Design)
      // Prepare emergency contacts and employers for tenantService.create()
      const emergencyContacts = formData.emergencyContacts && Array.isArray(formData.emergencyContacts)
        ? formData.emergencyContacts.map((contact: any) => ({
            contactName: contact.contactName || '',
            email: contact.email || null,
            phone: contact.phone || '',
            isPrimary: contact.isPrimary || false,
          }))
        : [];

      const employers = formData.employers && Array.isArray(formData.employers)
        ? formData.employers.map((employer: any) => ({
            employerName: employer.employerName,
            address: employer.employerAddress || null,
            monthlyIncome: employer.income || null,
            jobTitle: employer.jobTitle || null,
            startDate: employer.startDate || null,
            payFrequency: employer.payFrequency || null,
            isCurrent: employer.isCurrent !== undefined ? employer.isCurrent : true,
          }))
        : [];

      tenant = await tenantService.create({
        email: invitation.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || null,
        phone: formData.phone || null,
        country: formData.country || null,
        provinceState: formData.provinceState || null,
        postalZip: formData.postalZip || null,
        dateOfBirth: formData.dateOfBirth || null,
        currentAddress: formData.currentAddress || null,
        city: formData.city || null,
        numberOfAdults: formData.numberOfAdults || null,
        numberOfChildren: formData.numberOfChildren || null,
        hasAccess: true,
        invitationToken: token,
        invitationSentAt: invitation.createdAt,
        invitedBy: invitation.invitedBy,
        emergencyContacts,
        employers,
      } as any, {
        userId: invitation.invitedBy,
        invitedBy: invitation.invitedBy,
      });
    }

    // Update invitation status using domain service (Domain-Driven Design)
    // No user context needed for system operations
    await tenantInvitationService.update(invitation.id, {
      status: 'completed',
      completedAt: new Date(),
      tenantId: tenant.id,
    });

  // Invalidate cache (invitation status changed)
  invalidateInvitationCache(token);

  // Emit event
  await emitEvent(EventType.TENANT_INVITATION_COMPLETED, {
    invitationId: invitation.id,
    tenantId: tenant.id,
    email: invitation.email,
  }, {
    requestId: req.headers['x-request-id'] as string,
  });

    return res.status(200).json(formatApiResponse({
      data: {
        message: 'Invitation accepted successfully',
        tenantId: tenant.id,
      },
      req,
    }));
  } catch (error: any) {
    console.error('[Accept Invitation] Error:', error);
    return res.status(500).json(formatApiError({
      code: ErrorCodes.INTERNAL_ERROR,
      message: error.message || 'Failed to accept invitation',
      req,
    }));
  }
}

// Public endpoint - no auth required
const rateLimitedHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Limit acceptance attempts
})(acceptInvitation);

// Wrap with error handling
const handlerWithErrorHandling = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    return await rateLimitedHandler(req, res);
  } catch (error: any) {
    console.error('[Accept Invitation] Unhandled error:', error);
    console.error('[Accept Invitation] Error stack:', error?.stack);
    
    // Ensure response hasn't been sent
    if (!res.headersSent) {
      return res.status(500).json(formatApiError({
        code: ErrorCodes.INTERNAL_ERROR,
        message: error?.message || 'Internal server error',
        details: config.app.isDev ? {
          stack: error?.stack,
          name: error?.name,
        } : undefined,
        req,
      }));
    }
  }
};

export default withRequestId(handlerWithErrorHandling);

