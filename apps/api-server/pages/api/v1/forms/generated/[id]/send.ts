/**
 * Form Send API v1
 * POST /api/v1/forms/generated/:id/send
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { generatedFormService } from '@/lib/domains/generated-form';
import { tenantService } from '@/lib/domains/tenant';
import { propertyService } from '@/lib/domains/property';
import { landlordService } from '@/lib/domains/landlord';
const { fillN4PDF } = require('@/lib/pdf-filler/n4-service');
const { addSignatureToPDF } = require('@/lib/pdf-filler/signature-service');
const { sendN4FormToTenant } = require('@/lib/email-gmail');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
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

    // Only N4 forms supported for now
    if (form.formType !== 'N4') {
      return res.status(400).json({ error: 'Email sending is currently only supported for N4 forms' });
    }

    // Fetch tenant and related data using domain services (Domain-Driven Design)
    if (!form.tenantId) {
      return res.status(400).json({ error: 'Form must have a tenant to send' });
    }

    // Get tenant with lease information using domain service
    const tenant = await tenantService.getById(form.tenantId, {
      leases: true,
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Find active lease from tenant's leaseTenants
    const activeLease = (tenant as any).leaseTenants?.find((lt: any) => lt.lease?.status === 'Active')?.lease;
    if (!activeLease) {
      return res.status(400).json({ error: 'Tenant must have an active lease' });
    }

    // Get property and unit using domain services
    const property = activeLease.unit?.propertyId 
      ? await propertyService.getById(activeLease.unit.propertyId)
      : null;
    const unit = activeLease.unit;

    // Generate PDF
    const pdfBuffer = await fillN4PDF(form.formData as any, {
      tenant,
      property,
      unit,
    });

    // Add signature using domain service
    const landlord = await landlordService.getById(user.userId);

    let finalPdfBuffer = pdfBuffer;
    if (landlord?.signatureFileName) {
      finalPdfBuffer = await addSignatureToPDF(pdfBuffer, landlord.signatureFileName);
    }

    // Send email
    await sendN4FormToTenant({
      tenant,
      property,
      unit,
      pdfBuffer: finalPdfBuffer,
      landlordEmail: user.email,
      landlordName: user.userName || user.email,
    });

    return res.status(200).json({
      success: true,
      message: 'Form sent successfully to tenant',
    });
  } catch (error) {
    console.error('[Form Send v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to send form',
    });
  }
}, { requireRole: ['landlord'], allowedMethods: ['POST'] });

