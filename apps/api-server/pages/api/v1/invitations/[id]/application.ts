/**
 * Invitation Application API v1
 * GET /api/v1/invitations/:id/application
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { invitationService } from '@/lib/domains/invitation';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid invitation ID' });
    }

    // Get invitation via domain service
    const invitation = await invitationService.getInvitationById(id, user);
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Check permissions - only PMC admins can view applications
    if (user.role !== 'pmc' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get application data associated with invitation
    // Application data is stored in invitation.metadata or in a separate Application model
    const applicationData = (invitation as any).metadata || (invitation as any).applicationData;

    // If invitation type is 'tenant', get tenant data
    if (invitation.type === 'tenant' && invitation.email) {
      const tenant = await prisma.tenant.findUnique({
        where: { email: invitation.email },
        include: {
          emergencyContacts: true,
          employers: true,
        },
      });

      if (tenant) {
        return res.status(200).json({
          success: true,
          data: {
            invitation: {
              id: invitation.id,
              email: invitation.email,
              type: invitation.type,
              status: invitation.status,
            },
            tenant: {
              id: tenant.id,
              firstName: tenant.firstName,
              lastName: tenant.lastName,
              email: tenant.email,
              phone: tenant.phone,
              currentAddress: tenant.currentAddress,
              city: tenant.city,
              postalZip: tenant.postalZip,
              dateOfBirth: tenant.dateOfBirth,
              employmentStatus: tenant.employmentStatus,
              monthlyIncome: tenant.monthlyIncome,
              emergencyContacts: tenant.emergencyContacts || [],
              employers: tenant.employers || [],
            },
            applicationData: applicationData || {},
          },
        });
      }
    }

    // Return application data from invitation metadata
    return res.status(200).json({
      success: true,
      data: {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          type: invitation.type,
          status: invitation.status,
        },
        applicationData: applicationData || {},
      },
    });
  } catch (error) {
    console.error('[Invitation Application v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch application',
    });
  }
}, { requireRole: ['pmc', 'admin'], allowedMethods: ['GET'] });

