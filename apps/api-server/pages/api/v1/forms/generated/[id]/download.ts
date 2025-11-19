/**
 * Form PDF Download API v1
 * GET /api/v1/forms/generated/:id/download
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { generatedFormService } from '@/lib/domains/generated-form';
import { tenantService } from '@/lib/domains/tenant';
import { propertyService } from '@/lib/domains/property';
import { unitService } from '@/lib/domains/unit';
import { landlordService } from '@/lib/domains/landlord';
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

    // Only landlords can download forms
    if (user.role !== 'landlord') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get form via service (includes RBAC check)
    const form = await generatedFormService.getGeneratedFormById(id, user);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Fetch related data using domain services (Domain-Driven Design)
    let tenant = null;
    let property = null;
    let unit = null;

    if (form.tenantId) {
      const tenantData = await tenantService.getById(form.tenantId);
      tenant = tenantData as any;
    }
    if (form.propertyId) {
      const propertyData = await propertyService.getById(form.propertyId);
      property = propertyData as any;
    }
    if (form.unitId) {
      const unitData = await unitService.getById(form.unitId, { property: true });
      unit = unitData as any;
    }

    // Generate PDF (only N4 supported for now)
    if (form.formType !== 'N4') {
      return res.status(400).json({ error: 'PDF download is currently only supported for N4 forms' });
    }

    const pdfBuffer = await fillN4PDF(form.formData as any, {
      tenant,
      property,
      unit,
    });

    // Add signature if available using domain service
    const landlord = await landlordService.getById(user.userId);

    let finalPdfBuffer = pdfBuffer;
    if (landlord?.signatureFileName) {
      finalPdfBuffer = await addSignatureToPDF(pdfBuffer, landlord.signatureFileName);
    }

    // Return PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${form.formType}-${form.id}.pdf"`);
    return res.send(finalPdfBuffer);
  } catch (error) {
    console.error('[Form Download v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to download form',
    });
  }
}, { requireRole: ['landlord'], allowedMethods: ['GET'] });

