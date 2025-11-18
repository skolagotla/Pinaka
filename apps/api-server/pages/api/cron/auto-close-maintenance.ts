/**
 * Cron Job: Auto-Close Maintenance Tickets
 * Automatically closes maintenance tickets with no activity for 7 days
 * 
 * Can be called via:
 * - Vercel Cron: vercel.json cron configuration
 * - Manual API call: GET /api/cron/auto-close-maintenance
 * - Scheduled task runner
 */

import { NextApiRequest, NextApiResponse } from 'next';
const { prisma } = require('@/lib/prisma');
const { generateCUID } = require('@/lib/utils/id-generator');

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow GET for cron jobs (no auth required for cron)
  if (req.method === 'GET') {
    return handleCronJob(req, res);
  }
  
  // Allow POST for manual triggers (requires auth)
  if (req.method === 'POST') {
    return handleCronJob(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleCronJob(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('[Auto-Close Maintenance] Starting auto-close check...');
    
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Find tickets that:
    // 1. Are not already fully closed (both parties approved)
    // 2. Have no activity (comments or status updates) in the last 7 days
    // 3. Are not in "New" status (only close tickets that have been reviewed)
    const ticketsToClose = await prisma.maintenanceRequest.findMany({
      where: {
        status: {
          not: 'New' // Don't auto-close tickets that haven't been reviewed
        },
        OR: [
          {
            // Not fully closed
            AND: [
              { status: 'Closed' },
              {
                OR: [
                  { landlordApproved: false },
                  { tenantApproved: false }
                ]
              }
            ]
          },
          {
            // Or in other statuses (Pending, In Progress)
            status: {
              in: ['Pending', 'In Progress']
            }
          }
        ],
        // Last activity was more than 7 days ago
        updatedAt: {
          lt: sevenDaysAgo
        }
      },
      include: {
        comments: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Only need the most recent comment
        },
        property: {
          include: {
            landlord: true
          }
        },
        tenant: true
      }
    });
    
    // Filter tickets where the most recent comment is also older than 7 days
    const ticketsWithNoRecentActivity = ticketsToClose.filter(ticket => {
      if (ticket.comments && ticket.comments.length > 0) {
        const lastCommentDate = new Date(ticket.comments[0].createdAt);
        return lastCommentDate < sevenDaysAgo;
      }
      // If no comments, use updatedAt
      return true;
    });
    
    console.log(`[Auto-Close Maintenance] Found ${ticketsWithNoRecentActivity.length} tickets to auto-close`);
    
    let closedCount = 0;
    const results: Array<{
      ticketId: string;
      ticketNumber: string | null;
      title: string;
      previousStatus?: string;
      error?: string;
    }> = [];
    
    for (const ticket of ticketsWithNoRecentActivity) {
      try {
        // Auto-close the ticket by setting both approvals to true
        await prisma.maintenanceRequest.update({
          where: { id: ticket.id },
          data: {
            status: 'Closed',
            landlordApproved: true,
            tenantApproved: true,
            completedDate: new Date(),
            updatedAt: new Date()
          }
        });
        
        // Create a system comment explaining the auto-close
        await prisma.maintenanceComment.create({
          data: {
            id: generateCUID(),
            maintenanceRequestId: ticket.id,
            authorEmail: 'system@pinaka.app',
            authorName: 'System',
            authorRole: 'system',
            comment: 'No Activity for 7 Days, closing ticket',
            isStatusUpdate: true,
            oldStatus: ticket.status,
            newStatus: 'Closed'
          }
        });
        
        closedCount++;
        results.push({
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          title: ticket.title,
          previousStatus: ticket.status
        });
        
        console.log(`[Auto-Close Maintenance] Auto-closed ticket ${ticket.ticketNumber || ticket.id}`);
      } catch (error: any) {
        console.error(`[Auto-Close Maintenance] Error closing ticket ${ticket.id}:`, error);
        results.push({
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          title: ticket.title,
          error: error?.message || String(error)
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Auto-closed ${closedCount} maintenance ticket(s)`,
      closedCount,
      totalChecked: ticketsWithNoRecentActivity.length,
      results
    });
  } catch (error) {
    console.error('[Auto-Close Maintenance] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to auto-close maintenance tickets',
      message: error.message
    });
  }
}

// Export with optional auth (cron jobs may not have auth)
export default async function(req: NextApiRequest, res: NextApiResponse) {
  // Check if this is a cron job (Vercel adds a header)
  const isCron = req.headers['x-vercel-cron'] || req.query.secret === process.env.CRON_SECRET;
  
  if (isCron || !req.headers.authorization) {
    // No auth required for cron jobs
    return handler(req, res);
  }
  
  // For manual calls, you might want to add auth here
  return handler(req, res);
};

