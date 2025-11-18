/**
 * Document Approve Deletion API v1
 * POST /api/v1/documents/:id/approve-deletion
 * 
 * Handles mutual approval for document deletion
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { DocumentService, DocumentRepository } from '@/lib/domains/document';
import { documentApproveDeletionSchema } from '@/lib/schemas';
import { z } from 'zod';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    // Validate request body
    const { reason } = documentApproveDeletionSchema.parse(req.body);

    // Get document via service
    const repository = new DocumentRepository(prisma);
    const service = new DocumentService(repository);
    const document = await service.getById(id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Parse existing metadata
    let metadata: any = {};
    if (document.metadata) {
      try {
        metadata = typeof document.metadata === 'string' 
          ? JSON.parse(document.metadata) 
          : document.metadata;
      } catch (e) {
        console.error('[Approve Deletion] Error parsing metadata:', e);
        metadata = {};
      }
    }

    // Check if deletion is pending
    if (!metadata.pendingDeletion) {
      return res.status(400).json({
        success: false,
        error: 'No pending deletion request for this document',
      });
    }

    // Update approval based on user role
    const approvalKey = user.role === 'landlord' ? 'landlordApproval' : 'tenantApproval';
    if (!metadata.pendingDeletion[approvalKey]) {
      metadata.pendingDeletion[approvalKey] = {};
    }
    
    metadata.pendingDeletion[approvalKey] = {
      approved: true,
      approvedBy: user.userId,
      approvedByEmail: user.email,
      approvedByName: user.userName || user.email,
      approvedAt: new Date().toISOString(),
      reason: reason || null,
    };

    // Check if both parties have approved
    const landlordApproved = Boolean(metadata.pendingDeletion.landlordApproval?.approved);
    const tenantApproved = Boolean(metadata.pendingDeletion.tenantApproval?.approved);
    const bothApproved = landlordApproved && tenantApproved;

    // If both approved, delete the document
    if (bothApproved) {
      await service.delete(id);
      return res.status(200).json({
        success: true,
        message: 'Both parties have approved. Document has been deleted.',
        deleted: true,
      });
    }

    // Update document metadata
    await service.update(id, {
      metadata: JSON.stringify(metadata),
    });

    return res.status(200).json({
      success: true,
      message: 'Your approval has been recorded. Waiting for the other party to approve.',
      bothApproved: false,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Document Approve Deletion v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to approve deletion',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc'], allowedMethods: ['POST'] });

