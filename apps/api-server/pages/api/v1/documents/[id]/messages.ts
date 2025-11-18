/**
 * Document Messages API v1
 * GET /api/v1/documents/:id/messages - Get messages for a document
 * POST /api/v1/documents/:id/messages - Send a message for a document
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { documentService } from '@/lib/domains/document';
import { documentMessageSchema } from '@/lib/schemas';
import { z } from 'zod';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    // Get document via domain service
    const document = await documentService.getById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check permissions - user must have access to the document
    if (user.role === 'tenant') {
      if (document.tenantId !== user.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } else if (user.role === 'landlord') {
      // Check if document belongs to landlord's property using domain service
      if (document.propertyId) {
        const belongsToLandlord = await documentService.belongsToLandlord(id, user.userId);
        if (!belongsToLandlord) {
          return res.status(403).json({ error: 'Unauthorized' });
        }
      }
    }

    if (req.method === 'GET') {
      // Get messages for document using domain service
      const messages = await documentService.getMessages(id);

      return res.status(200).json({
        success: true,
        messages: messages.map((msg: any) => ({
          id: msg.id,
          message: msg.message,
          senderEmail: msg.senderEmail,
          senderName: msg.senderName,
          senderRole: msg.senderRole,
          isRead: msg.isRead,
          readAt: msg.readAt,
          createdAt: msg.createdAt,
        })),
      });
    } else if (req.method === 'POST') {
      // Send message for document
      const validated = documentMessageSchema.parse(req.body);

      // Get user details for sender info using domain services
      let senderEmail = user.email;
      let senderName = user.userName || user.email;
      let senderRole = user.role;

      if (user.role === 'landlord') {
        const { landlordService } = await import('@/lib/domains/landlord');
        try {
          const landlord = await landlordService.getById(user.userId);
          if (landlord) {
            senderEmail = landlord.email;
            senderName = `${landlord.firstName} ${landlord.lastName}`;
          }
        } catch (error) {
          // Use defaults if landlord not found
        }
      } else if (user.role === 'tenant') {
        const { tenantService } = await import('@/lib/domains/tenant');
        try {
          const tenant = await tenantService.getById(user.userId);
          if (tenant) {
            senderEmail = tenant.email;
            senderName = `${tenant.firstName} ${tenant.lastName}`;
          }
        } catch (error) {
          // Use defaults if tenant not found
        }
      }

      // Create message via domain service
      const message = await documentService.addMessage(id, {
        message: validated.message,
        senderEmail,
        senderName,
        senderRole,
      });

      return res.status(201).json({
        success: true,
        message: {
          id: message.id,
          message: message.message,
          senderEmail: message.senderEmail,
          senderName: message.senderName,
          senderRole: message.senderRole,
          createdAt: message.createdAt,
        },
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Document Messages v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process request',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc'], allowedMethods: ['GET', 'POST'] });

