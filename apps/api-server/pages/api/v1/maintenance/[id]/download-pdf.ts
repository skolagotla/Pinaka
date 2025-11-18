/**
 * Maintenance PDF Download API v1
 * GET /api/v1/maintenance/:id/download-pdf
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { MaintenanceService, MaintenanceRepository } from '@/lib/domains/maintenance';
const { prisma } = require('@/lib/prisma');
const { generateMaintenancePDF } = require('@/lib/pdf-generator'); // Assuming this exists

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid maintenance request ID' });
    }

    // Get maintenance request via service (includes RBAC check)
    const repository = new MaintenanceRepository(prisma);
    const service = new MaintenanceService(repository);
    const maintenanceRequest = await service.getById(id, {
      tenant: true,
      property: true,
      comments: true,
      assignedToProvider: true,
    });

    if (!maintenanceRequest) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Generate PDF (if PDF generator exists)
    // For now, return a placeholder response
    // TODO: Implement PDF generation for maintenance requests
    return res.status(501).json({
      error: 'PDF generation for maintenance requests is not yet implemented',
    });

    // When implemented:
    // const pdfBuffer = await generateMaintenancePDF(maintenanceRequest);
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', `attachment; filename="maintenance-${id}.pdf"`);
    // return res.send(pdfBuffer);
  } catch (error) {
    console.error('[Maintenance PDF Download v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to download PDF',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc'], allowedMethods: ['GET'] });

