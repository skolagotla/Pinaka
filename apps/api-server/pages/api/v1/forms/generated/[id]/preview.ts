/**
 * Form Preview API v1
 * GET /api/v1/forms/generated/:id/preview
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { generatedFormService } from '@/lib/domains/generated-form';
const { prisma } = require('@/lib/prisma');
const { fillN4PDF } = require('@/lib/pdf-filler/n4-service');
const { addSignatureToPDF } = require('@/lib/pdf-filler/signature-service');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid form ID' });
    }

    // Get form via service (includes RBAC check)
    const form = await generatedFormService.getGeneratedFormById(id, user);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Fetch related data for PDF generation
    let tenant = null;
    let property = null;
    let unit = null;

    if (form.tenantId) {
      tenant = await prisma.tenant.findUnique({ where: { id: form.tenantId } });
    }
    if (form.propertyId) {
      property = await prisma.property.findUnique({ where: { id: form.propertyId } });
    }
    if (form.unitId) {
      unit = await prisma.unit.findUnique({
        where: { id: form.unitId },
        include: { property: true },
      });
    }

    // Generate PDF (only N4 supported for now)
    if (form.formType !== 'N4') {
      return res.status(400).json({ error: 'PDF preview is currently only supported for N4 forms' });
    }

    const pdfBuffer = await fillN4PDF(form.formData as any, {
      tenant,
      property,
      unit,
    });

    // Add signature if available (for preview, we can optionally include signature)
    const landlord = await prisma.landlord.findUnique({
      where: { id: user.userId },
      select: { signatureFileName: true },
    });

    let finalPdfBuffer = pdfBuffer;
    if (landlord?.signatureFileName) {
      finalPdfBuffer = await addSignatureToPDF(pdfBuffer, landlord.signatureFileName);
    }

    // Return PDF for preview (inline display)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="preview-${form.formType}-${form.id}.pdf"`);
    return res.send(finalPdfBuffer);
  } catch (error) {
    console.error('[Form Preview v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to preview form',
    });
  }
}, { requireRole: ['landlord', 'pmc'], allowedMethods: ['GET'] });

