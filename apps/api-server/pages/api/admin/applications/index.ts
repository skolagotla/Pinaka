/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN APPLICATION MANAGEMENT API
 * ═══════════════════════════════════════════════════════════════
 * GET /api/admin/applications - List applications (completed invitations)
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');
const { listApplications: listApplicationsService, getApplicationConfig } = require('@/lib/services/application-service');

async function listApplications(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { type, approvalStatus, page = '1', limit = '50' } = req.query;

    // Use shared service - admin can view both landlord and pmc applications
    // If type is specified, use that config; otherwise, we'll handle both types
    const applicationType = (type as string) || 'landlord'; // Default to landlord, but we'll fetch all if no type
    
    // For admin, we need to handle both types if no type filter
    if (!type) {
      // Fetch both landlord and pmc applications
      const [landlordApps, pmcApps] = await Promise.all([
        listApplicationsService(prisma, getApplicationConfig('admin', 'landlord'), {
          inviterId: admin.id,
          inviterRole: 'admin',
          approvalStatus: approvalStatus as string,
          type: 'landlord',
          page: parseInt(page as string, 10),
          limit: parseInt(limit as string, 10),
        }),
        listApplicationsService(prisma, getApplicationConfig('admin', 'pmc'), {
          inviterId: admin.id,
          inviterRole: 'admin',
          approvalStatus: approvalStatus as string,
          type: 'pmc',
          page: parseInt(page as string, 10),
          limit: parseInt(limit as string, 10),
        }),
      ]);

      // Combine results
      const combinedData = [...(landlordApps.data || []), ...(pmcApps.data || [])];
      
      return res.status(200).json({
        success: true,
        data: combinedData,
        pagination: {
          page: parseInt(page as string, 10),
          limit: parseInt(limit as string, 10),
          total: combinedData.length,
          totalPages: Math.ceil(combinedData.length / parseInt(limit as string, 10)),
        },
      });
    }

    // Single type fetch
    const config = getApplicationConfig('admin', applicationType as 'landlord' | 'pmc');
    const result = await listApplicationsService(prisma, config, {
      inviterId: admin.id,
      inviterRole: 'admin',
      approvalStatus: approvalStatus as string,
      type: applicationType as string,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[Admin Applications] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch applications',
      message: error.message,
    });
  }
}

export default withAdminAuth(listApplications, { requireRole: 'super_admin' });

