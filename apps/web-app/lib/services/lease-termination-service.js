/**
 * Early Lease Termination Service
 * Handles early lease termination workflow (Ontario-compliant)
 * Implements Business Rule 12: Early Lease Termination
 */

const { prisma } = require('../prisma');
const { createNotification, NOTIFICATION_TYPES } = require('./notification-service');

/**
 * Initiate early lease termination
 * @param {string} leaseId - Lease ID
 * @param {string} initiatedBy - User ID who initiated
 * @param {string} reason - Termination reason
 * @param {Date} terminationDate - Proposed termination date
 * @param {number} actualLoss - Actual loss amount (manual entry, no flat fees)
 * @returns {Promise<{success: boolean, terminationId: string}>}
 */
async function initiateTermination(leaseId, initiatedBy, reason, terminationDate, actualLoss = null) {
  try {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        unit: {
          include: {
            property: {
              include: {
                landlord: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        leaseTenants: {
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!lease) {
      throw new Error('Lease not found');
    }

    // Determine form type based on reason
    let formType = 'N11'; // Default: mutual agreement
    if (reason.includes('domestic violence') || reason.includes('N15')) {
      formType = 'N15'; // Domestic violence - 28 days, no penalty
    } else if (reason.includes('tenant') || reason.includes('N9')) {
      formType = 'N9'; // Tenant-initiated
    }

    // Create termination record
    const termination = await prisma.leaseTermination.create({
      data: {
        id: `term_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        leaseId,
        initiatedBy,
        reason,
        terminationDate: new Date(terminationDate),
        actualLoss: actualLoss ? parseFloat(actualLoss) : null,
        formType,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const landlord = lease.unit.property.landlord;
    const landlordName = `${landlord.firstName} ${landlord.lastName}`;

    // Notify landlord
    await createNotification({
      userId: landlord.id,
      userRole: 'landlord',
      userEmail: landlord.email,
      type: NOTIFICATION_TYPES.LEASE_TERMINATION,
      title: 'Early Lease Termination Requested',
      message: `Early termination has been requested for lease at ${lease.unit.property.addressLine1} ${lease.unit.unitName}. Reason: ${reason}`,
      priority: 'high',
      entityType: 'lease',
      entityId: lease.id,
      actionUrl: `/leases/${lease.id}/termination`,
      actionLabel: 'Review Termination',
      metadata: {
        terminationId: termination.id,
        formType,
      },
    });

    // Notify tenants
    for (const leaseTenant of lease.leaseTenants) {
      await createNotification({
        userId: leaseTenant.tenant.id,
        userRole: 'tenant',
        userEmail: leaseTenant.tenant.email,
        type: NOTIFICATION_TYPES.LEASE_TERMINATION,
        title: 'Early Lease Termination Requested',
        message: `Early termination has been requested for your lease at ${lease.unit.property.addressLine1} ${lease.unit.unitName}.`,
        priority: 'high',
        entityType: 'lease',
        entityId: lease.id,
        actionUrl: `/leases/${lease.id}/termination`,
        actionLabel: 'View Termination',
        metadata: {
          terminationId: termination.id,
          formType,
        },
      });
    }

    return {
      success: true,
      terminationId: termination.id,
      formType,
    };
  } catch (error) {
    console.error('[Lease Termination Service] Error:', error);
    throw error;
  }
}

/**
 * Approve termination
 */
async function approveTermination(terminationId, approvedBy, actualLoss = null) {
  try {
    const termination = await prisma.leaseTermination.findUnique({
      where: { id: terminationId },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  include: {
                    landlord: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!termination) {
      throw new Error('Termination not found');
    }

    // Update termination
    const updateData = {
      status: 'approved',
      approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date(),
    };

    if (actualLoss !== null) {
      updateData.actualLoss = parseFloat(actualLoss);
    }

    await prisma.leaseTermination.update({
      where: { id: terminationId },
      data: updateData,
    });

    // Update lease status
    await prisma.lease.update({
      where: { id: termination.leaseId },
      data: {
        status: 'Terminated',
        leaseEnd: termination.terminationDate,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('[Lease Termination Service] Error approving:', error);
    throw error;
  }
}

module.exports = {
  initiateTermination,
  approveTermination,
};

