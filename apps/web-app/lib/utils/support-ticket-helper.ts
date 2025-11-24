/**
 * Support Ticket Helper Utilities
 * Centralized logic for support ticket operations to reduce duplication
 */

const { prisma } = require('../prisma');

interface SupportTicketCreator {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'landlord' | 'tenant' | 'pmc';
}

interface SupportTicketCreateData {
  subject: string;
  description: string;
  priority?: string;
  propertyId?: string | null;
  contractorId?: string | null;
  vendorId?: string | null;
  createdBy?: string;
  createdByEmail?: string;
  createdByName?: string;
  createdByRole?: string;
}

interface SupportTicketRouting {
  assignedToLandlordId: string | null;
  assignedToPMCId: string | null;
  assignedToAdminId: string | null;
}

/**
 * Generate a unique ticket number
 */
function generateTicketNumber(): string {
  return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

/**
 * Generate a unique ticket ID
 */
function generateTicketId(): string {
  return `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Determine creator FKs based on role
 */
function getCreatorFKs(
  creator: SupportTicketCreator,
  createdBy?: string,
  createdByRole?: string
): {
  createdByLandlordId: string | null;
  createdByTenantId: string | null;
  createdByPMCId: string | null;
} {
  const createdByLandlordId = 
    (createdByRole === 'landlord' && createdBy) || creator.role === 'landlord' 
      ? (createdBy || creator.userId) 
      : null;
  
  const createdByTenantId = 
    (createdByRole === 'tenant' && createdBy) || creator.role === 'tenant' 
      ? (createdBy || creator.userId) 
      : null;
  
  const createdByPMCId = creator.role === 'pmc' ? creator.userId : null;

  return { createdByLandlordId, createdByTenantId, createdByPMCId };
}

/**
 * Update assignedToEmail and assignedToName based on routing
 * Optimized: Uses a single transaction to update the ticket
 */
async function updateTicketAssignment(
  ticketId: string,
  routing: SupportTicketRouting
): Promise<void> {
  let assignedToEmail: string | null = null;
  let assignedToName: string | null = null;

  if (routing.assignedToPMCId) {
    const pmc = await prisma.propertyManagementCompany.findUnique({
      where: { id: routing.assignedToPMCId },
      select: { email: true, companyName: true },
    });
    if (pmc) {
      assignedToEmail = pmc.email;
      assignedToName = pmc.companyName;
    }
  } else if (routing.assignedToLandlordId) {
    const landlord = await prisma.landlord.findUnique({
      where: { id: routing.assignedToLandlordId },
      select: { email: true, firstName: true, lastName: true },
    });
    if (landlord) {
      assignedToEmail = landlord.email;
      assignedToName = `${landlord.firstName} ${landlord.lastName}`;
    }
  } else if (routing.assignedToAdminId) {
    const admin = await prisma.admin.findUnique({
      where: { id: routing.assignedToAdminId },
      select: { email: true, firstName: true, lastName: true },
    });
    if (admin) {
      assignedToEmail = admin.email;
      assignedToName = `${admin.firstName} ${admin.lastName}`;
    }
  }

  // Only update if we have values
  if (assignedToEmail || assignedToName) {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedToEmail,
        assignedToName,
      },
    });
  }
}

/**
 * Get standard select for support ticket queries
 * Reduces duplication across list/get endpoints
 * Optimized: Uses select instead of include for better performance
 */
function getSupportTicketIncludes() {
  // Using select instead of include for better performance
  // Select only needed fields to reduce data transfer
  return {
    select: {
      id: true,
      ticketNumber: true,
      subject: true,
      description: true,
      priority: true,
      status: true,
      propertyId: true,
      createdBy: true,
      createdByEmail: true,
      createdByName: true,
      createdByRole: true,
      assignedTo: true,
      assignedToEmail: true,
      assignedToName: true,
      contractorId: true,
      vendorId: true,
      resolvedAt: true,
      resolvedBy: true,
      resolution: true,
      createdAt: true,
      updatedAt: true,
      property: {
        select: {
          id: true,
          propertyId: true,
          propertyName: true,
          addressLine1: true,
          city: true,
          provinceState: true,
          landlord: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      createdByLandlord: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      createdByTenant: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      assignedToAdmin: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      assignedToLandlord: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      assignedToPMC: {
        select: {
          id: true,
          companyId: true,
          companyName: true,
          email: true,
        },
      },
      serviceProvider: {
        select: {
          id: true,
          providerId: true,
          name: true,
          businessName: true,
          contactName: true,
          email: true,
          phone: true,
          type: true,
        },
      },
      notes: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          content: true,
          isInternal: true,
          createdByName: true,
          createdAt: true,
        },
      },
      attachments: {
        select: {
          id: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          uploadedAt: true,
        },
      },
      _count: {
        select: {
          notes: true,
          attachments: true,
        },
      },
    },
  };
}

/**
 * Create support ticket with optimized logic
 * Handles routing, creator FKs, and assignment updates
 */
async function createSupportTicket(
  data: SupportTicketCreateData,
  creator: SupportTicketCreator,
  routing: SupportTicketRouting
) {
  const { routeToPropertyManager } = require('./property-management-routing');
  
  // Get final routing (may override provided routing if propertyId changes)
  let finalRouting = routing;
  if (data.propertyId && !routing.assignedToLandlordId && !routing.assignedToPMCId && !routing.assignedToAdminId) {
    try {
      finalRouting = await routeToPropertyManager(data.propertyId);
    } catch (error) {
      console.error('[Support Tickets] Error routing:', error);
      // Use provided routing on error
    }
  }

  // Get creator FKs
  const creatorFKs = getCreatorFKs(creator, data.createdBy, data.createdByRole);

  // Generate IDs
  const ticketId = generateTicketId();
  const ticketNumber = generateTicketNumber();

  // Create ticket
  const ticket = await prisma.supportTicket.create({
    data: {
      id: ticketId,
      ticketNumber,
      subject: data.subject,
      description: data.description,
      priority: (data.priority || 'MEDIUM') as any,
      propertyId: data.propertyId || null,
      // Creator info (backward compat)
      createdBy: data.createdBy || creator.userId,
      createdByEmail: data.createdByEmail || creator.email,
      createdByName: data.createdByName || creator.name,
      createdByRole: data.createdByRole || creator.role,
      // Creator FKs
      ...creatorFKs,
      // Routing (backward compat)
      assignedTo: finalRouting.assignedToAdminId || finalRouting.assignedToLandlordId || finalRouting.assignedToPMCId || null,
      assignedToEmail: creator.email, // Will be updated
      assignedToName: creator.name, // Will be updated
      // Routing FKs
      assignedToAdminId: finalRouting.assignedToAdminId,
      assignedToLandlordId: finalRouting.assignedToLandlordId,
      assignedToPMCId: finalRouting.assignedToPMCId,
      // Related entities
      contractorId: data.contractorId || null,
      vendorId: data.vendorId || null,
    },
  });

  // Update assignment info based on routing
  await updateTicketAssignment(ticket.id, finalRouting);

  return ticket;
}

/**
 * Update support ticket assignment based on new routing
 * Used when property changes or manual reassignment
 */
async function updateSupportTicketAssignment(
  ticketId: string,
  routing: SupportTicketRouting
): Promise<void> {
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      assignedToAdminId: routing.assignedToAdminId,
      assignedToLandlordId: routing.assignedToLandlordId,
      assignedToPMCId: routing.assignedToPMCId,
    },
  });

  // Update email/name
  await updateTicketAssignment(ticketId, routing);
}

module.exports = {
  generateTicketNumber,
  generateTicketId,
  getCreatorFKs,
  updateTicketAssignment,
  getSupportTicketIncludes,
  createSupportTicket,
  updateSupportTicketAssignment,
};

