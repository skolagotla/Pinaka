/**
 * Support Ticket Batch Operations
 * Optimized batch operations for multiple ticket updates
 */

const { prisma } = require('../prisma');
const { updateTicketAssignment } = require('./support-ticket-helper');

interface BatchTicketUpdate {
  ticketId: string;
  status?: string;
  priority?: string;
  assignedToAdminId?: string | null;
  assignedToLandlordId?: string | null;
  assignedToPMCId?: string | null;
  contractorId?: string | null;
  vendorId?: string | null;
  resolution?: string | null;
}

interface BatchUpdateResult {
  success: boolean;
  updated: number;
  failed: number;
  errors: Array<{ ticketId: string; error: string }>;
}

/**
 * Batch update multiple support tickets
 * Optimized to use transactions and reduce database round-trips
 */
export async function batchUpdateTickets(
  updates: BatchTicketUpdate[]
): Promise<BatchUpdateResult> {
  const result: BatchUpdateResult = {
    success: true,
    updated: 0,
    failed: 0,
    errors: [],
  };

  if (!updates || updates.length === 0) {
    return result;
  }

  // Group updates by type to optimize queries
  const statusUpdates: Array<{ id: string; status: string }> = [];
  const priorityUpdates: Array<{ id: string; priority: string }> = [];
  const assignmentUpdates: Array<{ id: string; routing: any }> = [];
  const relatedEntityUpdates: Array<{ id: string; contractorId?: string | null; vendorId?: string | null }> = [];
  const resolutionUpdates: Array<{ id: string; resolution: string | null; resolvedAt: Date | null; resolvedBy: string | null }> = [];

  // Process each update
  for (const update of updates) {
    if (update.status) {
      statusUpdates.push({ id: update.ticketId, status: update.status });
    }
    if (update.priority) {
      priorityUpdates.push({ id: update.ticketId, priority: update.priority });
    }
    if (update.assignedToAdminId !== undefined || update.assignedToLandlordId !== undefined || update.assignedToPMCId !== undefined) {
      assignmentUpdates.push({
        id: update.ticketId,
        routing: {
          assignedToAdminId: update.assignedToAdminId ?? null,
          assignedToLandlordId: update.assignedToLandlordId ?? null,
          assignedToPMCId: update.assignedToPMCId ?? null,
        },
      });
    }
    if (update.contractorId !== undefined || update.vendorId !== undefined) {
      relatedEntityUpdates.push({
        id: update.ticketId,
        contractorId: update.contractorId ?? null,
        vendorId: update.vendorId ?? null,
      });
    }
    if (update.resolution !== undefined) {
      resolutionUpdates.push({
        id: update.ticketId,
        resolution: update.resolution,
        resolvedAt: update.resolution ? new Date() : null,
        resolvedBy: update.resolution ? null : null, // Will be set by caller if needed
      });
    }
  }

  // Execute updates in transaction for consistency
  try {
    await prisma.$transaction(async (tx) => {
      // Batch status updates
      if (statusUpdates.length > 0) {
        await Promise.all(
          statusUpdates.map(update =>
            tx.supportTicket.update({
              where: { id: update.id },
              data: { status: update.status as any },
            })
          )
        );
      }

      // Batch priority updates
      if (priorityUpdates.length > 0) {
        await Promise.all(
          priorityUpdates.map(update =>
            tx.supportTicket.update({
              where: { id: update.id },
              data: { priority: update.priority as any },
            })
          )
        );
      }

      // Batch assignment updates (FKs only, email/name updated separately)
      if (assignmentUpdates.length > 0) {
        await Promise.all(
          assignmentUpdates.map(update =>
            tx.supportTicket.update({
              where: { id: update.id },
              data: {
                assignedToAdminId: update.routing.assignedToAdminId,
                assignedToLandlordId: update.routing.assignedToLandlordId,
                assignedToPMCId: update.routing.assignedToPMCId,
              },
            })
          )
        );

        // Update email/name for assignments (can be done in parallel)
        await Promise.all(
          assignmentUpdates.map(async (update) => {
            try {
              await updateTicketAssignment(update.id, update.routing);
            } catch (error) {
              // Log but don't fail entire batch
              console.error(`[Batch Update] Error updating assignment for ticket ${update.id}:`, error);
            }
          })
        );
      }

      // Batch related entity updates
      if (relatedEntityUpdates.length > 0) {
        await Promise.all(
          relatedEntityUpdates.map(update =>
            tx.supportTicket.update({
              where: { id: update.id },
              data: {
                contractorId: update.contractorId,
                vendorId: update.vendorId,
              },
            })
          )
        );
      }

      // Batch resolution updates
      if (resolutionUpdates.length > 0) {
        await Promise.all(
          resolutionUpdates.map(update =>
            tx.supportTicket.update({
              where: { id: update.id },
              data: {
                resolution: update.resolution,
                resolvedAt: update.resolvedAt,
                resolvedBy: update.resolvedBy,
              },
            })
          )
        );
      }
    });

    result.updated = updates.length;
  } catch (error: any) {
    result.success = false;
    result.failed = updates.length;
    result.errors = updates.map(u => ({
      ticketId: u.ticketId,
      error: error.message || 'Unknown error',
    }));
  }

  return result;
}

/**
 * Batch reassign tickets to a new assignee
 * Optimized for bulk reassignments
 */
export async function batchReassignTickets(
  ticketIds: string[],
  routing: {
    assignedToAdminId?: string | null;
    assignedToLandlordId?: string | null;
    assignedToPMCId?: string | null;
  }
): Promise<BatchUpdateResult> {
  const updates: BatchTicketUpdate[] = ticketIds.map(id => ({
    ticketId: id,
    ...routing,
  }));

  return batchUpdateTickets(updates);
}

/**
 * Batch update ticket statuses
 * Optimized for bulk status changes
 */
export async function batchUpdateStatuses(
  ticketIds: string[],
  status: string
): Promise<BatchUpdateResult> {
  const updates: BatchTicketUpdate[] = ticketIds.map(id => ({
    ticketId: id,
    status,
  }));

  return batchUpdateTickets(updates);
}

module.exports = {
  batchUpdateTickets,
  batchReassignTickets,
  batchUpdateStatuses,
};

