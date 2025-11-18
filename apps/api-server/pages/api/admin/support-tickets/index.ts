/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN SUPPORT TICKET MANAGEMENT API
 * ═══════════════════════════════════════════════════════════════
 * GET /api/admin/support-tickets - List tickets
 * POST /api/admin/support-tickets - Create ticket
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');
const { routeToPropertyManager } = require('@/lib/utils/property-management-routing');
const {
  createSupportTicket,
  getSupportTicketIncludes,
} = require('@/lib/utils/support-ticket-helper');

async function listTickets(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { status, priority, assignedTo, page = 1, limit = 50, search } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    // Validate pagination parameters
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: 'Invalid page parameter. Must be a positive number.' });
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({ error: 'Invalid limit parameter. Must be a number between 1 and 1000.' });
    }
    
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    // Support both old assignedTo (string) and new FK fields
    if (assignedTo) {
      where.OR = [
        { assignedTo: assignedTo },
        { assignedToAdminId: assignedTo },
        { assignedToLandlordId: assignedTo },
        { assignedToPMCId: assignedTo },
      ];
    }
    // Filter by property
    if (req.query.propertyId) {
      where.propertyId = req.query.propertyId;
    }
    // Filter by assigned to landlord
    if (req.query.assignedToLandlordId) {
      where.assignedToLandlordId = req.query.assignedToLandlordId;
    }
    // Filter by assigned to PMC
    if (req.query.assignedToPMCId) {
      where.assignedToPMCId = req.query.assignedToPMCId;
    }
    if (search) {
      const searchConditions = [
        { subject: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { ticketNumber: { contains: search as string, mode: 'insensitive' } },
        { createdByEmail: { contains: search as string, mode: 'insensitive' } },
        { property: { propertyName: { contains: search as string, mode: 'insensitive' } } },
        { property: { addressLine1: { contains: search as string, mode: 'insensitive' } } },
      ];
      
      if (where.OR) {
        // Merge with existing OR conditions
        where.OR = [...where.OR, ...searchConditions];
      } else {
        where.OR = searchConditions;
      }
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        ...getSupportTicketIncludes(),
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[Admin Support Tickets] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch tickets',
      message: error.message,
    });
  }
}

async function createTicket(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { 
      subject, 
      description, 
      priority, 
      propertyId,
      contractorId,
      vendorId,
      createdBy, 
      createdByEmail, 
      createdByName, 
      createdByRole 
    } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        error: 'Subject and description are required',
      });
    }

    // Determine initial routing
    let routing = {
      assignedToLandlordId: null,
      assignedToPMCId: null,
      assignedToAdminId: propertyId ? null : admin.id, // Default to admin if no property
    };

    // Create ticket using helper
    const ticket = await createSupportTicket(
      {
        subject,
        description,
        priority,
        propertyId,
        contractorId,
        vendorId,
        createdBy,
        createdByEmail,
        createdByName,
        createdByRole,
      },
      {
        userId: admin.id,
        email: admin.email,
        name: `${admin.firstName} ${admin.lastName}`,
        role: 'admin',
      },
      routing
    );

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'create_ticket',
        resource: 'support_ticket',
        resourceId: ticket.id,
        details: { ticketNumber: ticket.ticketNumber },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    console.error('[Admin Support Tickets] Error creating ticket:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create ticket',
      message: error.message,
    });
  }
}

export default withAdminAuth(async (req: NextApiRequest, res: NextApiResponse, admin: any) => {
  if (req.method === 'GET') {
    return listTickets(req, res, admin);
  } else if (req.method === 'POST') {
    return createTicket(req, res, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}, { requireRole: 'SUPER_ADMIN' });

