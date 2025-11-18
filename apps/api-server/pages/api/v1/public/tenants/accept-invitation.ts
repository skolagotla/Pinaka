import { NextApiRequest, NextApiResponse } from 'next';
import { withRequestId } from '@/lib/middleware/requestId';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { formatApiResponse, formatApiError, ErrorCodes } from '@/lib/utils/api-response';
import { emitEvent, EventType } from '@/lib/events/emitter';
import { invalidateInvitationCache } from '@/lib/utils/invitation-cache';
import { mapCountryRegionToFKs } from '@/lib/utils/country-region-mapper';
const { prisma } = require('@/lib/prisma');
const { generateCUID } = require('@/lib/utils/id-generator');
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

  // Find invitation
  const invitation = await prisma.tenantInvitation.findUnique({
    where: { token },
    include: {
      landlord: {
        select: { firstName: true, lastName: true },
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
    await prisma.tenantInvitation.update({
      where: { id: invitation.id },
      data: { status: 'expired' },
    });

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

  // Check if tenant already exists
  let tenant = await prisma.tenant.findUnique({
    where: { email: invitation.email },
  });

  if (tenant) {
    // Map country/provinceState to FKs
    const { countryCode: finalCountryCode, regionCode: finalRegionCode } = await mapCountryRegionToFKs(
      formData.country || tenant.country || null,
      formData.provinceState || tenant.provinceState || null,
      null, // countryCode not provided
      null  // regionCode not provided
    );

    // Update existing tenant
    tenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        firstName: formData.firstName || tenant.firstName,
        lastName: formData.lastName || tenant.lastName,
        middleName: formData.middleName || tenant.middleName,
        phone: formData.phone || tenant.phone,
        country: formData.country || tenant.country, // Legacy
        provinceState: formData.provinceState || tenant.provinceState, // Legacy
        countryCode: finalCountryCode || null, // New FK
        regionCode: finalRegionCode || null, // New FK
        postalZip: formData.postalZip || tenant.postalZip,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : tenant.dateOfBirth,
        currentAddress: formData.currentAddress || tenant.currentAddress,
        city: formData.city || tenant.city,
        numberOfAdults: formData.numberOfAdults || tenant.numberOfAdults,
        numberOfChildren: formData.numberOfChildren || tenant.numberOfChildren,
        hasAccess: true,
      },
    });
  } else {
    // Create new tenant
    const tenantId = `TNT${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Map country/provinceState to FKs
    const { countryCode: finalCountryCode, regionCode: finalRegionCode } = await mapCountryRegionToFKs(
      formData.country || null,
      formData.provinceState || null,
      null, // countryCode not provided
      null  // regionCode not provided
    );

    tenant = await prisma.tenant.create({
      data: {
        id: generateCUID(),
        tenantId,
        email: invitation.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || null,
        phone: formData.phone || null,
        country: formData.country || null, // Legacy
        provinceState: formData.provinceState || null, // Legacy
        countryCode: finalCountryCode || null, // New FK
        regionCode: finalRegionCode || null, // New FK
        postalZip: formData.postalZip || null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        currentAddress: formData.currentAddress || null,
        city: formData.city || null,
        numberOfAdults: formData.numberOfAdults || null,
        numberOfChildren: formData.numberOfChildren || null,
        hasAccess: true,
        invitationToken: token,
        invitationSentAt: invitation.createdAt,
        invitedBy: invitation.invitedBy,
        updatedAt: new Date(), // Required field
      },
    });

    // Handle emergency contacts
    if (formData.emergencyContacts && Array.isArray(formData.emergencyContacts)) {
      for (const contact of formData.emergencyContacts) {
        if (contact.contactName || contact.email || contact.phone) {
          await prisma.emergencyContact.create({
            data: {
              id: generateCUID(),
              tenantId: tenant.id,
              contactName: contact.contactName || '',
              email: contact.email || null,
              phone: contact.phone || '',
              isPrimary: contact.isPrimary || false,
            },
          });
        }
      }
    }

    // Handle employers
    if (formData.employers && Array.isArray(formData.employers)) {
      for (const employer of formData.employers) {
        if (employer.employerName) {
          await prisma.employer.create({
            data: {
              id: generateCUID(),
              tenantId: tenant.id,
              employerName: employer.employerName,
              employerAddress: employer.employerAddress || null,
              income: employer.income || null,
              jobTitle: employer.jobTitle || null,
              startDate: employer.startDate ? new Date(employer.startDate) : null,
              payFrequency: employer.payFrequency || null,
              isCurrent: employer.isCurrent !== undefined ? employer.isCurrent : true,
            },
          });
        }
      }
    }
  }

  // Update invitation status
  await prisma.tenantInvitation.update({
    where: { id: invitation.id },
    data: {
      status: 'completed',
      completedAt: new Date(),
      tenantId: tenant.id,
    },
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

