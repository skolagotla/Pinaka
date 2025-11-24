/**
 * Maintenance PDF Download API v1
 * GET /api/v1/maintenance/:id/download-pdf
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { MaintenanceService, MaintenanceRepository } from '@/lib/domains/maintenance';
import { generateMaintenancePDF } from '@/lib/pdf-generator';
const { prisma } = require('@/lib/prisma');

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

    // Generate PDF
    const pdfDoc = generateMaintenancePDF(maintenanceRequest as any);
    
    // Convert PDFDocument to buffer
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
    });

    // Stream PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="maintenance-${maintenanceRequest.ticketNumber || id}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('[Maintenance PDF Download v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to download PDF',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc'], allowedMethods: ['GET'] });

