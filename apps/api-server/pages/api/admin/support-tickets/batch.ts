/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN SUPPORT TICKET BATCH OPERATIONS API
 * ═══════════════════════════════════════════════════════════════
 * PATCH /api/admin/support-tickets/batch - Batch update tickets
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');
const { batchUpdateTickets, batchReassignTickets, batchUpdateStatuses } = require('@/lib/utils/support-ticket-batch');

async function handleBatchUpdate(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { updates, operation } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Updates array is required and must not be empty',
      });
    }

    let result;

    // Handle different batch operations
    if (operation === 'reassign') {
      const { ticketIds, routing } = req.body;
      if (!ticketIds || !routing) {
        return res.status(400).json({
          success: false,
          error: 'ticketIds and routing are required for reassign operation',
        });
      }
      result = await batchReassignTickets(ticketIds, routing);
    } else if (operation === 'updateStatus') {
      const { ticketIds, status } = req.body;
      if (!ticketIds || !status) {
        return res.status(400).json({
          success: false,
          error: 'ticketIds and status are required for updateStatus operation',
        });
      }
      result = await batchUpdateStatuses(ticketIds, status);
    } else {
      // Generic batch update
      result = await batchUpdateTickets(updates);
    }

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: `batch_${operation || 'update'}_tickets`,
        resource: 'support_ticket',
        resourceId: null, // Batch operation
        details: {
          operation: operation || 'update',
          count: updates.length,
          result,
        },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: result.success,
      },
    });

    return res.status(200).json({
      success: result.success,
      data: result,
    });
  } catch (error: any) {
    console.error('[Admin Support Tickets Batch] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to batch update tickets',
      message: error.message,
    });
  }
}

export default withAdminAuth(async (req: NextApiRequest, res: NextApiResponse, admin: any) => {
  if (req.method === 'PATCH') {
    return handleBatchUpdate(req, res, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
});

