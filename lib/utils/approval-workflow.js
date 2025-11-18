/**
 * Approval Workflow Utilities
 * 
 * Handles PMC approval requests to landlords
 */

const { prisma } = require('../prisma');

/**
 * Create an approval request from PMC to landlord
 * @param {Object} options
 * @param {string} options.pmcId - PMC ID
 * @param {string} options.landlordId - Landlord ID
 * @param {string} options.approvalType - Type of approval (EXPENSE, WORK_ORDER, etc.)
 * @param {string} options.entityType - Type of entity (expense, maintenance, etc.)
 * @param {string} options.entityId - ID of the entity
 * @param {string} options.title - Title of the request
 * @param {number} options.amount - Amount (if applicable)
 * @param {string} options.description - Description of the request
 * @param {Object} options.metadata - Additional metadata
 * @returns {Promise<Object>} Created approval request
 */
export async function createApprovalRequest({
  pmcId,
  landlordId,
  approvalType,
  entityType,
  entityId,
  title,
  amount = null,
  description = null,
  metadata = {},
}) {
  // Find the PMC-Landlord relationship
  const pmcLandlord = await prisma.pMCLandlord.findFirst({
    where: {
      pmcId,
      landlordId,
      status: 'active',
      OR: [
        { endedAt: null },
        { endedAt: { gt: new Date() } },
      ],
    },
  });

  if (!pmcLandlord) {
    throw new Error('PMC-Landlord relationship not found or inactive');
  }

  // Get PMC user details for requestedByEmail and requestedByName
  const pmc = await prisma.propertyManagementCompany.findUnique({
    where: { id: pmcId },
    select: {
      email: true,
      companyName: true,
    },
  });

  // Create approval request
  const approvalRequest = await prisma.pMCLandlordApproval.create({
    data: {
      pmcLandlordId: pmcLandlord.id,
      approvalType,
      status: 'PENDING',
      entityType,
      entityId,
      title,
      amount,
      description,
      metadata: metadata || {},
      requestedBy: pmcId,
      requestedByEmail: pmc?.email || '',
      requestedByName: pmc?.companyName || '',
      requestedAt: new Date(),
    },
    include: {
      pmcLandlord: {
        include: {
          pmc: {
            select: {
              id: true,
              companyName: true,
              email: true,
            },
          },
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
  });

  return approvalRequest;
}

/**
 * Approve an approval request
 * @param {string} approvalId - Approval request ID
 * @param {string} approvedBy - Landlord ID who approved
 * @param {string} notes - Optional approval notes
 * @returns {Promise<Object>} Updated approval request
 */
export async function approveRequest(approvalId, approvedBy, notes = null) {
  const approval = await prisma.pMCLandlordApproval.findUnique({
    where: { id: approvalId },
    include: {
      pmcLandlord: {
        include: {
          landlord: true,
        },
      },
    },
  });

  if (!approval) {
    throw new Error('Approval request not found');
  }

  if (approval.pmcLandlord.landlordId !== approvedBy) {
    throw new Error('Only the landlord can approve this request');
  }

  if (approval.status !== 'PENDING') {
    throw new Error(`Approval request is already ${approval.status}`);
  }

  const updated = await prisma.pMCLandlordApproval.update({
    where: { id: approvalId },
    data: {
      status: 'APPROVED',
      approvedBy,
      approvedAt: new Date(),
      notes,
    },
  });

  return updated;
}

/**
 * Reject an approval request
 * @param {string} approvalId - Approval request ID
 * @param {string} rejectedBy - Landlord ID who rejected
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Updated approval request
 */
export async function rejectRequest(approvalId, rejectedBy, reason) {
  const approval = await prisma.pMCLandlordApproval.findUnique({
    where: { id: approvalId },
    include: {
      pmcLandlord: {
        include: {
          landlord: true,
        },
      },
    },
  });

  if (!approval) {
    throw new Error('Approval request not found');
  }

  if (approval.pmcLandlord.landlordId !== rejectedBy) {
    throw new Error('Only the landlord can reject this request');
  }

  if (approval.status !== 'PENDING') {
    throw new Error(`Approval request is already ${approval.status}`);
  }

  const updated = await prisma.pMCLandlordApproval.update({
    where: { id: approvalId },
    data: {
      status: 'REJECTED',
      rejectedBy,
      rejectedAt: new Date(),
      notes: reason,
    },
  });

  return updated;
}

/**
 * Get pending approvals for a landlord
 * @param {string} landlordId - Landlord ID
 * @returns {Promise<Array>} List of pending approvals
 */
export async function getPendingApprovalsForLandlord(landlordId) {
  const approvals = await prisma.pMCLandlordApproval.findMany({
    where: {
      pmcLandlord: {
        landlordId,
      },
      status: 'PENDING',
    },
    include: {
      pmcLandlord: {
        include: {
          pmc: {
            select: {
              id: true,
              companyName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      requestedAt: 'desc',
    },
  });

  return approvals;
}

/**
 * Get approval requests for a PMC
 * @param {string} pmcId - PMC ID
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} List of approval requests
 */
export async function getApprovalRequestsForPMC(pmcId, status = null) {
  const where = {
    pmcLandlord: {
      pmcId,
    },
  };

  if (status) {
    where.status = status;
  }

  const approvals = await prisma.pMCLandlordApproval.findMany({
    where,
    include: {
      pmcLandlord: {
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
    orderBy: {
      requestedAt: 'desc',
    },
  });

  return approvals;
}

