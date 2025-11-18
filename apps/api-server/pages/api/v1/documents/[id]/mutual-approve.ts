/**
 * Document Mutual Approval API v1
 * POST /api/v1/documents/:id/mutual-approve
 * 
 * Handles mutual approval for version changes
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { DocumentService, DocumentRepository } from '@/lib/domains/document';
import { documentMutualApproveSchema } from '@/lib/schemas';
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
    const { comment } = documentMutualApproveSchema.parse(req.body);

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
        console.error('[Mutual Approve] Error parsing metadata:', e);
        metadata = {};
      }
    }

    // Initialize mutual approval structure if needed
    if (!metadata.requiresMutualApproval) {
      return res.status(400).json({
        success: false,
        error: 'This document does not require mutual approval',
      });
    }

    // Update approval based on user role
    const approvalKey = user.role === 'landlord' ? 'landlordApproval' : 'tenantApproval';
    metadata[approvalKey] = {
      approved: true,
      approvedBy: user.userId,
      approvedByEmail: user.email,
      approvedByName: user.userName || user.email,
      approvedAt: new Date().toISOString(),
      comment: comment || null,
    };

    // Check if both parties have approved
    const landlordApproved = Boolean(metadata.landlordApproval?.approved);
    const tenantApproved = Boolean(metadata.tenantApproval?.approved);
    const bothApproved = landlordApproved && tenantApproved;

    // Update document metadata
    await service.update(id, {
      metadata: JSON.stringify(metadata),
    });

    return res.status(200).json({
      success: true,
      message: bothApproved 
        ? 'Both parties have approved. Version change is complete.' 
        : 'Your approval has been recorded. Waiting for the other party to approve.',
      bothApproved,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Document Mutual Approve v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to approve document',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc'], allowedMethods: ['POST'] });

