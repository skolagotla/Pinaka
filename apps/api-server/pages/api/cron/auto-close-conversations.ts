/**
 * Cron Job: Auto-Close Inactive Conversations
 * Automatically closes conversations that have been inactive for 15 days
 * Adds a system message indicating the reason for auto-closure
 * 
 * Can be called via:
 * - Vercel Cron: vercel.json cron configuration
 * - Manual API call: GET /api/cron/auto-close-conversations
 * - Scheduled task runner
 */

import { NextApiRequest, NextApiResponse } from 'next';
const { prisma } = require('@/lib/prisma');
const { generateCUID } = require('@/lib/utils/id-generator');

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = new Date();
    const fifteenDaysAgo = new Date(now);
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    // Find active conversations that haven't been updated in 15 days
    const inactiveConversations = await prisma.conversation.findMany({
      where: {
        status: 'active',
        updatedAt: {
          lte: fifteenDaysAgo
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Get last message to check if it's a system message
        }
      }
    });

    let closedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const conversation of inactiveConversations) {
      try {
        // Check if the last message is already a system message about auto-closure
        const lastMessage = conversation.messages?.[0];
        if (lastMessage && lastMessage.messageText?.includes('closed because there is no activity from')) {
          skippedCount++;
          continue;
        }

        // Close the conversation
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            status: 'closed',
            updatedAt: new Date()
          }
        });

        // Add a system message explaining the auto-closure
        const inactivityDate = new Date(conversation.updatedAt);
        const formattedDate = inactivityDate.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        await prisma.message.create({
          data: {
            id: generateCUID(),
            conversationId: conversation.id,
            senderId: 'system', // System user ID
            messageText: `[System] This conversation has been automatically closed because there is no activity from ${formattedDate}. Both parties can still view and download this conversation. If needed, either party can reopen it to continue the conversation.`,
            isRead: false
          }
        });

        closedCount++;
      } catch (error: any) {
        errors.push(`Failed to close conversation ${conversation.id}: ${error.message}`);
        console.error(`[Auto-Close] Error closing conversation ${conversation.id}:`, error);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${inactiveConversations.length} inactive conversations`,
      closed: closedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('[Auto-Close Conversations] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to auto-close conversations',
      message: error.message
    });
  }
}

// Export with optional auth (cron jobs may not have auth)
export default async function(req: NextApiRequest, res: NextApiResponse) {
  // Check if this is a cron job (Vercel adds a header)
  const isCron = req.headers['x-vercel-cron'] || req.query.secret === process.env.CRON_SECRET;
  
  if (!isCron && req.method === 'GET') {
    // For manual testing, allow GET without auth
    return handler(req, res);
  }
  
  if (isCron || req.method === 'GET') {
    // No auth required for cron jobs
    return handler(req, res);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};

