/**
 * Conversation Messages API v1
 * POST /api/v1/conversations/:id/messages
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { conversationService } from '@/lib/domains/conversation';
import { conversationSendMessageSchema } from '@/lib/schemas';
import { z } from 'zod';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    // Get conversation via domain service
    const conversation = await conversationService.getById(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check permissions - user must be a participant
    const isParticipant = 
      (conversation as any).landlordId === user.userId ||
      (conversation as any).tenantId === user.userId ||
      (conversation as any).pmcId === user.userId;
    
    if (!isParticipant && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Parse request body - support both 'message' and 'messageText' for compatibility
    const body = req.body;
    const messageText = body.message || body.messageText;
    if (!messageText) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Get sender details based on role
    let senderLandlordId: string | null = null;
    let senderTenantId: string | null = null;
    let senderPMCId: string | null = null;

    if (user.role === 'landlord') {
      senderLandlordId = user.userId;
    } else if (user.role === 'tenant') {
      senderTenantId = user.userId;
    } else if (user.role === 'pmc') {
      senderPMCId = user.userId;
    }

    // Create message via domain service
    const message = await conversationService.createMessage(id, {
      messageText: messageText,
    }, {
      userId: user.userId,
      userRole: user.role,
    });

    return res.status(201).json({
      success: true,
      message: {
        id: message.id,
        message: message.messageText,
        senderId: message.senderId,
        senderRole: message.senderRole,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Conversation Messages v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to send message',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc'], allowedMethods: ['POST'] });

