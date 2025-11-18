import { NextApiRequest, NextApiResponse } from 'next';
import { withRequestId } from '@/lib/middleware/requestId';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { formatApiResponse, formatApiError, ErrorCodes } from '@/lib/utils/api-response';
import { emitEvent, EventType } from '@/lib/events/emitter';
import { validateFormData, getRoleConfig } from '@/lib/config/invitation-roles';
import { createUserFromInvitation } from '@/lib/services/invitation-acceptance';
import { mapCountryRegionToFKs } from '@/lib/utils/country-region-mapper';
const { prisma } = require('@/lib/prisma');
const { invalidateInvitationCache } = require('@/lib/utils/invitation-cache');
const config = require('@/lib/config/app-config').default || require('@/lib/config/app-config');

/**
 * POST /api/v1/public/invitations/accept
 * Public endpoint for accepting invitations and submitting user information
 * 
 * Body: {
 *   token: string (required)
 *   formData: { firstName, lastName, phone, ... } (role-specific fields)
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

  const { token, formData } = req.body as { token?: string; formData?: any };

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
    // Find invitation
    // First try to find in generic Invitation table
    let invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        landlord: {
          select: { firstName: true, lastName: true },
        },
        tenant: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    // If not found, check TenantInvitation table (for tenant-specific invitations)
    let isTenantInvitation = false;
    if (!invitation) {
      const tenantInvitation = await prisma.tenantInvitation.findUnique({
        where: { token },
        include: {
          landlord: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      if (tenantInvitation) {
        isTenantInvitation = true;
        // Convert TenantInvitation to match Invitation format
        invitation = {
          id: tenantInvitation.id,
          email: tenantInvitation.email,
          type: 'tenant',
          status: tenantInvitation.status,
          expiresAt: tenantInvitation.expiresAt,
          metadata: tenantInvitation.metadata as any,
          invitedBy: tenantInvitation.invitedBy,
          landlord: tenantInvitation.landlord,
          tenant: null,
        } as any;
      }
    }

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
      // Update status to expired (handle both Invitation and TenantInvitation)
      if (isTenantInvitation) {
        await prisma.tenantInvitation.update({
          where: { id: invitation.id },
          data: { status: 'expired' },
        });
      } else {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'expired' },
        });
      }

      await emitEvent(EventType.TENANT_INVITATION_EXPIRED, {
        invitationId: invitation.id,
        email: invitation.email,
        type: invitation.type,
      });

      return res.status(400).json(formatApiError({
        code: ErrorCodes.BAD_REQUEST,
        message: 'This invitation has expired',
        req,
      }));
    }

    // Get role configuration
    const roleConfig = getRoleConfig(invitation.type);
    if (!roleConfig) {
      return res.status(400).json(formatApiError({
        code: ErrorCodes.BAD_REQUEST,
        message: `Invalid invitation type: ${invitation.type}`,
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

    // Validate form data
    const validation = validateFormData(formData, invitation.type);
    if (!validation.valid) {
      return res.status(400).json(formatApiError({
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Invalid form data',
        details: { errors: validation.errors },
        req,
      }));
    }

    // Check if user already exists
    type LandlordType = {
      id: string;
      firstName: string | null;
      lastName: string | null;
      middleName: string | null;
      phone: string | null;
      addressLine1: string | null;
      addressLine2: string | null;
      city: string | null;
      provinceState: string | null;
      postalZip: string | null;
      country: string | null;
    };
    type TenantType = {
      id: string;
      firstName: string | null;
      lastName: string | null;
      middleName: string | null;
      phone: string | null;
      country: string | null;
      provinceState: string | null;
      postalZip: string | null;
      dateOfBirth: Date | null;
      currentAddress: string | null;
      city: string | null;
      numberOfAdults: number | null;
      numberOfChildren: number | null;
      moveInDate: Date | null;
      leaseTerm: string | null;
    };
    type PMCType = {
      id: string;
      companyName: string;
      email: string;
      phone: string | null;
      country: string | null;
      provinceState: string | null;
      postalZip: string | null;
      addressLine1: string | null;
      addressLine2: string | null;
      city: string | null;
    };
    let existingUser: LandlordType | TenantType | PMCType | null = null;
    if (invitation.type === 'landlord') {
      existingUser = await prisma.landlord.findUnique({
        where: { email: invitation.email },
      }) as LandlordType | null;
    } else if (invitation.type === 'tenant') {
      existingUser = await prisma.tenant.findUnique({
        where: { email: invitation.email },
      }) as TenantType | null;
    } else if (invitation.type === 'pmc') {
      existingUser = await prisma.propertyManagementCompany.findUnique({
        where: { email: invitation.email },
      }) as PMCType | null;
    }

    // Map country/provinceState to FKs for landlord, tenant, and PMC
    let country: string | null = null;
    let provinceState: string | null = null;
    
    if (invitation.type === 'landlord') {
      country = formData.country || (existingUser as LandlordType)?.country || null;
      provinceState = formData.provinceState || (existingUser as LandlordType)?.provinceState || null;
    } else if (invitation.type === 'tenant') {
      country = formData.country || (existingUser as TenantType)?.country || null;
      provinceState = formData.provinceState || (existingUser as TenantType)?.provinceState || null;
    } else if (invitation.type === 'pmc') {
      country = formData.country || (existingUser as PMCType)?.country || null;
      provinceState = formData.provinceState || (existingUser as PMCType)?.provinceState || null;
    }
    
    const { countryCode: finalCountryCode, regionCode: finalRegionCode } = await mapCountryRegionToFKs(
      country || null,
      provinceState || null,
      null, // countryCode not provided in form
      null  // regionCode not provided in form
    );

    let userRecord;
    if (existingUser) {
      // Update existing user
      if (invitation.type === 'landlord') {
        const landlordUser = existingUser as LandlordType;
        userRecord = await prisma.landlord.update({
          where: { id: landlordUser.id },
          data: {
            firstName: formData.firstName || landlordUser.firstName,
            lastName: formData.lastName || landlordUser.lastName,
            middleName: formData.middleName || landlordUser.middleName,
            phone: formData.phone || landlordUser.phone,
            addressLine1: formData.addressLine1 || landlordUser.addressLine1,
            addressLine2: formData.addressLine2 || landlordUser.addressLine2,
            city: formData.city || landlordUser.city,
            provinceState: formData.provinceState || landlordUser.provinceState, // Legacy
            postalZip: formData.postalZip || landlordUser.postalZip,
            country: formData.country || landlordUser.country, // Legacy
            countryCode: finalCountryCode || null, // New FK
            regionCode: finalRegionCode || null, // New FK
            updatedAt: new Date(),
          },
        });
      } else if (invitation.type === 'tenant') {
        const tenantUser = existingUser as TenantType;
        userRecord = await prisma.tenant.update({
          where: { id: tenantUser.id },
          data: {
            firstName: formData.firstName || tenantUser.firstName,
            lastName: formData.lastName || tenantUser.lastName,
            middleName: formData.middleName || tenantUser.middleName,
            phone: formData.phone || tenantUser.phone,
            country: formData.country || tenantUser.country, // Legacy
            provinceState: formData.provinceState || tenantUser.provinceState, // Legacy
            countryCode: finalCountryCode || null, // New FK
            regionCode: finalRegionCode || null, // New FK
            postalZip: formData.postalZip || tenantUser.postalZip,
            dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : tenantUser.dateOfBirth,
            currentAddress: formData.currentAddress || tenantUser.currentAddress,
            city: formData.city || tenantUser.city,
            numberOfAdults: formData.numberOfAdults || tenantUser.numberOfAdults,
            numberOfChildren: formData.numberOfChildren || tenantUser.numberOfChildren,
            moveInDate: formData.moveInDate ? new Date(formData.moveInDate) : tenantUser.moveInDate,
            leaseTerm: formData.leaseTerm || tenantUser.leaseTerm,
            hasAccess: true,
            updatedAt: new Date(),
          },
        });
      } else if (invitation.type === 'pmc') {
        const pmcUser = existingUser as PMCType;
        userRecord = await prisma.propertyManagementCompany.update({
          where: { id: pmcUser.id },
          data: {
            companyName: formData.companyName || pmcUser.companyName,
            phone: formData.phone || pmcUser.phone,
            addressLine1: formData.addressLine1 || pmcUser.addressLine1,
            addressLine2: formData.addressLine2 || pmcUser.addressLine2,
            city: formData.city || pmcUser.city,
            provinceState: formData.provinceState || pmcUser.provinceState, // Legacy
            postalZip: formData.postalZip || pmcUser.postalZip,
            country: formData.country || pmcUser.country, // Legacy
            countryCode: finalCountryCode || null, // New FK
            regionCode: finalRegionCode || null, // New FK
            defaultCommissionRate: formData.defaultCommissionRate
              ? parseFloat(formData.defaultCommissionRate) / 100
              : null,
            updatedAt: new Date(),
          },
        });
      }
    } else {
      // Create new user
      userRecord = await createUserFromInvitation(prisma, formData, invitation);
      
      // If a PMC invited a landlord, create the PMCLandlord relationship
      if (invitation.type === 'landlord' && invitation.invitedByRole === 'pmc' && invitation.invitedByPMCId) {
        try {
          // Check if relationship already exists (shouldn't, but be safe)
          const existingRelationship = await prisma.pMCLandlord.findUnique({
            where: {
              pmcId_landlordId: {
                pmcId: invitation.invitedByPMCId,
                landlordId: userRecord.id,
              },
            },
          });
          
          if (!existingRelationship) {
            await prisma.pMCLandlord.create({
              data: {
                id: `pmc_lld_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                pmcId: invitation.invitedByPMCId,
                landlordId: userRecord.id,
                status: 'active',
                startedAt: new Date(),
                contractTerms: invitation.metadata?.contractTerms || null,
                notes: `Relationship created automatically when landlord accepted PMC invitation`,
              },
            });
            console.log('[Accept Invitation] Created PMCLandlord relationship:', {
              pmcId: invitation.invitedByPMCId,
              landlordId: userRecord.id,
            });
          }
        } catch (relationshipError: any) {
          // Log error but don't fail the invitation acceptance
          console.error('[Accept Invitation] Error creating PMCLandlord relationship:', relationshipError);
          // The invitation was still accepted, so we continue
        }
      }
    }

    // Update invitation status (handle both Invitation and TenantInvitation)
    if (isTenantInvitation) {
      await prisma.tenantInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });
    } else {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          [roleConfig.relationField]: userRecord.id,
        },
      });
    }

    // Invalidate cache (invitation status changed)
    if (invalidateInvitationCache) {
      invalidateInvitationCache(token);
    }

    // Emit event
    await emitEvent(EventType.TENANT_INVITATION_COMPLETED, {
      invitationId: invitation.id,
      userId: userRecord.id,
      email: invitation.email,
      type: invitation.type,
    }, {
      requestId: req.headers['x-request-id'] as string,
    });

    return res.status(200).json(formatApiResponse({
      data: {
        message: 'Invitation accepted successfully',
        role: invitation.type,
        userId: userRecord.id,
        redirectTo: roleConfig.redirectTo,
      },
      req,
    }));
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
}

// Public endpoint - no auth required
// Increased rate limit since users may need multiple attempts (typos, validation errors, etc.)
const rateLimitedHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Increased from 10 to allow for multiple attempts during form completion
  message: 'Too many requests. Please wait a few minutes before trying again.',
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

