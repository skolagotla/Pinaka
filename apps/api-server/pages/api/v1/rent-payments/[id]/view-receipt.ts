/**
 * Rent Payment Receipt View API v1
 * GET /api/v1/rent-payments/:id/view-receipt
 * 
 * Domain-Driven, API-First, Shared-Schema implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { rentPaymentService } from '@/lib/domains/rent-payment';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid rent payment ID' });
    }

    // Check permissions using domain service (Domain-Driven Design)
    if (user.role === 'tenant') {
      const hasAccess = await rentPaymentService.belongsToTenant(id, user.userId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } else if (user.role === 'landlord') {
      const hasAccess = await rentPaymentService.belongsToLandlord(id, user.userId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    // Get full payment details with receipt information using domain service
    const payment = await rentPaymentService.getByIdWithReceiptDetails(id);

    if (!payment) {
      return res.status(404).json({ error: 'Rent payment not found' });
    }

    // Generate receipt PDF on-the-fly
    const { generateRentReceiptPDF } = require('@/lib/pdf-generator');
    const pdfDoc = generateRentReceiptPDF(payment as any);

    // Convert PDFDocument to buffer
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
    });

    // Stream PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="receipt-${id}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('[Rent Payment Receipt View v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to view receipt',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc'], allowedMethods: ['GET'] });

