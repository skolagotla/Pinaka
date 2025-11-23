/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN SUPPORT TICKET API - SINGLE TICKET
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');
const { getSupportTicketIncludes } = require('@/lib/utils/support-ticket-helper');

async function getTicket(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;

    const includes = getSupportTicketIncludes();
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: id as string },
      select: {
        ...includes.select,
        notes: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            isInternal: true,
            createdByName: true,
            createdAt: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    console.error('[Admin Support Tickets] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch ticket',
      message: error.message,
    });
  }
}

async function updateTicket(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;
    const { 
      status, 
      priority, 
      assignedTo, 
      assignedToEmail, 
      assignedToName,
      assignedToAdminId,
      assignedToLandlordId,
      assignedToPMCId,
      propertyId, // Allow updating property (will trigger re-routing)
      contractorId, // FK to Contractor (if ticket is related to contractor work)
      vendorId, // FK to Vendor (if ticket is related to vendor work)
      resolution 
    } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    
    // Handle reassignment - support both old and new fields
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo;
      updateData.assignedToEmail = assignedToEmail;
      updateData.assignedToName = assignedToName;
    }
    
    // Handle new FK-based reassignment
    if (assignedToAdminId !== undefined) {
      updateData.assignedToAdminId = assignedToAdminId || null;
      updateData.assignedToLandlordId = null;
      updateData.assignedToPMCId = null;
      if (assignedToAdminId) {
        const assignedAdmin = await prisma.admin.findUnique({
          where: { id: assignedToAdminId },
          select: { email: true, firstName: true, lastName: true },
        });
        if (assignedAdmin) {
          updateData.assignedToEmail = assignedAdmin.email;
          updateData.assignedToName = `${assignedAdmin.firstName} ${assignedAdmin.lastName}`;
        }
      }
    } else if (assignedToLandlordId !== undefined) {
      updateData.assignedToLandlordId = assignedToLandlordId || null;
      updateData.assignedToAdminId = null;
      updateData.assignedToPMCId = null;
      if (assignedToLandlordId) {
        const assignedLandlord = await prisma.landlord.findUnique({
          where: { id: assignedToLandlordId },
          select: { email: true, firstName: true, lastName: true },
        });
        if (assignedLandlord) {
          updateData.assignedToEmail = assignedLandlord.email;
          updateData.assignedToName = `${assignedLandlord.firstName} ${assignedLandlord.lastName}`;
        }
      }
    } else if (assignedToPMCId !== undefined) {
      updateData.assignedToPMCId = assignedToPMCId || null;
      updateData.assignedToAdminId = null;
      updateData.assignedToLandlordId = null;
      if (assignedToPMCId) {
        const assignedPMC = await prisma.propertyManagementCompany.findUnique({
          where: { id: assignedToPMCId },
          select: { email: true, companyName: true },
        });
        if (assignedPMC) {
          updateData.assignedToEmail = assignedPMC.email;
          updateData.assignedToName = assignedPMC.companyName;
        }
      }
    }
    
    // Handle property update (will trigger re-routing if needed)
    if (propertyId !== undefined) {
      updateData.propertyId = propertyId || null;
      // If property changed, re-route
      if (propertyId) {
        const { routeToPropertyManager } = require('@/lib/utils/property-management-routing');
        try {
          const routing = await routeToPropertyManager(propertyId);
          updateData.assignedToAdminId = routing.assignedToAdminId;
          updateData.assignedToLandlordId = routing.assignedToLandlordId;
          updateData.assignedToPMCId = routing.assignedToPMCId;
          
          // Update assignedToEmail and assignedToName
          if (routing.assignedToPMCId) {
            const pmc = await prisma.propertyManagementCompany.findUnique({
              where: { id: routing.assignedToPMCId },
              select: { email: true, companyName: true },
            });
            if (pmc) {
              updateData.assignedToEmail = pmc.email;
              updateData.assignedToName = pmc.companyName;
            }
          } else if (routing.assignedToLandlordId) {
            const landlord = await prisma.landlord.findUnique({
              where: { id: routing.assignedToLandlordId },
              select: { email: true, firstName: true, lastName: true },
            });
            if (landlord) {
              updateData.assignedToEmail = landlord.email;
              updateData.assignedToName = `${landlord.firstName} ${landlord.lastName}`;
            }
          }
        } catch (error) {
          console.error('[Support Tickets] Error re-routing:', error);
        }
      }
    }
    
    if (resolution) {
      updateData.resolution = resolution;
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = admin.id;
    }
    
    // Handle contractor/vendor updates
    if (contractorId !== undefined) {
      updateData.contractorId = contractorId || null;
    }
    if (vendorId !== undefined) {
      updateData.vendorId = vendorId || null;
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: id as string },
      data: updateData,
    });

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'update_ticket',
        resource: 'support_ticket',
        resourceId: ticket.id,
        details: { changes: updateData },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    console.error('[Admin Support Tickets] Error updating ticket:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update ticket',
      message: error.message,
    });
  }
}

async function addNote(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;
    const { content, isInternal } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Note content is required',
      });
    }

    const note = await prisma.ticketNote.create({
      data: {
        id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        ticketId: id as string,
        content,
        isInternal: isInternal || false,
        createdBy: admin.id,
        createdByEmail: admin.email,
        createdByName: `${admin.firstName} ${admin.lastName}`,
        createdByRole: 'admin',
      },
    });

    return res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error: any) {
    console.error('[Admin Support Tickets] Error adding note:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add note',
      message: error.message,
    });
  }
}

export default withAdminAuth(async (req: NextApiRequest, res: NextApiResponse, admin: any) => {
  if (req.method === 'GET') {
    return getTicket(req, res, admin);
  } else if (req.method === 'PATCH') {
    return updateTicket(req, res, admin);
  } else if (req.method === 'POST' && req.query.action === 'note') {
    return addNote(req, res, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}, { requireRole: 'super_admin' });

