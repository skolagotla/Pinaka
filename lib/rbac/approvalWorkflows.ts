/**
 * RBAC Approval Workflows
 * Phase 5: Approval Workflows
 * 
 * Implements approval workflows based on design decisions:
 * - Property editing approval (3-day auto-revert)
 * - Big expense approval
 * - Lease approval
 * - Refund approval
 */

import { PrismaClient, ApprovalWorkflowType, ApprovalRequestStatus } from '@prisma/client';
import { hasPermission } from './permissions';
import { ResourceCategory, PermissionAction } from '@prisma/client';

// Re-export for convenience
export { ApprovalWorkflowType, ApprovalRequestStatus };

const prisma = new PrismaClient();

// ApprovalWorkflowType and ApprovalRequestStatus are imported from Prisma

/**
 * Approval request model (stored in database)
 */
export interface ApprovalRequest {
  id: string;
  workflowType: ApprovalWorkflowType;
  entityType: string; // 'property', 'expense', 'lease', 'refund'
  entityId: string;
  requestedBy: string;
  requestedByType: string;
  requestedAt: Date;
  status: ApprovalRequestStatus;
  approvers: ApprovalApprover[];
  metadata: any;
  expiresAt?: Date;
}

/**
 * Approver information
 */
export interface ApprovalApprover {
  userId: string;
  userType: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  rejectedAt?: Date;
  notes?: string;
}

/**
 * Create property edit approval request
 * Property edits require owner approval, auto-revert after 3 days if not approved
 */
export async function createPropertyEditApproval(
  propertyId: string,
  changes: any,
  requestedBy: string,
  requestedByType: string
): Promise<string> {
  // Get property to find owner
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { landlordId: true },
  });

  if (!property) {
    throw new Error('Property not found');
  }

  // Store original values for revert
  const originalValues = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  // Create approval request
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
  
  const approvalRequest = await prisma.approvalRequest.create({
    data: {
      workflowType: ApprovalWorkflowType.PROPERTY_EDIT,
      entityType: 'property',
      entityId: propertyId,
      requestedBy,
      requestedByType,
      status: ApprovalRequestStatus.PENDING,
      expiresAt,
      beforeState: originalValues as any,
      afterState: { ...originalValues, ...changes } as any,
      approvers: [
        {
          userId: property.landlordId,
          userType: 'landlord',
          role: 'OWNER_LANDLORD',
          status: 'pending',
        },
      ],
      metadata: {
        changes,
      },
    },
  });

  // Schedule auto-revert if not approved within 3 days
  // This would typically be done with a job scheduler (cron, queue, etc.)
  scheduleAutoRevert(approvalRequest.id, propertyId, originalValues, 3);

  return approvalRequest.id;
}

/**
 * Approve property edit
 */
export async function approvePropertyEdit(
  approvalRequestId: string,
  approvedBy: string,
  approvedByType: string,
  approvedByEmail?: string,
  approvedByName?: string
): Promise<void> {
  const approval = await prisma.approvalRequest.findUnique({
    where: { id: approvalRequestId },
  });

  if (!approval) {
    throw new Error('Approval request not found');
  }

  if (approval.status !== ApprovalRequestStatus.PENDING) {
    throw new Error('Approval request is not pending');
  }

  // Check if user can approve (must be owner/landlord)
  const canApprove = await hasPermission(
    approvedBy,
    approvedByType,
    'properties',
    PermissionAction.APPROVE,
    ResourceCategory.PROPERTY_UNIT_MANAGEMENT
  );

  if (!canApprove) {
    throw new Error('You do not have permission to approve property edits');
  }

  // Update approver status
  const approvers = approval.approvers as any[];
  const approver = approvers.find((a) => a.userId === approvedBy);
  if (approver) {
    approver.status = 'approved';
    approver.approvedAt = new Date();
  }

  // Apply changes
  const afterState = approval.afterState as any;
  await prisma.property.update({
    where: { id: approval.entityId },
    data: afterState,
  });

  // Mark as approved
  await prisma.approvalRequest.update({
    where: { id: approvalRequestId },
    data: {
      status: ApprovalRequestStatus.APPROVED,
      approvedBy,
      approvedByType,
      approvedByEmail,
      approvedByName,
      approvedAt: new Date(),
      approvers,
    },
  });

  // Log to audit
  await prisma.rBACAuditLog.create({
    data: {
      userId: approvedBy,
      userType: approvedByType,
      action: 'property_edit_approved',
      resource: 'property',
      resourceId: approval.entityId,
      details: {
        approvalRequestId,
        status: ApprovalRequestStatus.APPROVED,
      },
    },
  });
}

/**
 * Auto-revert property changes if not approved within deadline
 */
async function scheduleAutoRevert(
  approvalRequestId: string,
  propertyId: string,
  originalValues: any,
  days: number
): Promise<void> {
  // This would be implemented with a job scheduler
  // For now, we'll create a record that can be checked by a cron job
  // In production, use: node-cron, bull, agenda, or similar

  // Store revert job info (you'd create a Job model for this)
  // For now, we'll just log it
  console.log(
    `Scheduled auto-revert for property ${propertyId} in ${days} days`
  );
}

/**
 * Create big expense approval request
 * Big expenses require PMC + Landlord approval (if PMC-managed) or just Landlord (if self-managed)
 */
export async function createBigExpenseApproval(
  expenseId: string,
  amount: number,
  threshold: number,
  requestedBy: string,
  requestedByType: string,
  landlordId: string,
  pmcId?: string
): Promise<string> {
  if (amount <= threshold) {
    // Below threshold, no approval needed
    return '';
  }

  // Determine approvers based on management type
  const approvers: ApprovalApprover[] = [];

  if (pmcId) {
    // PMC-managed: need PMC Admin/Accountant + Landlord approval
    approvers.push({
      userId: '', // PMC Admin/Accountant ID
      userType: 'pmc',
      role: 'ACCOUNTANT', // Or PMC_ADMIN
      status: 'pending',
    });
  }

  // Always need landlord approval
  approvers.push({
    userId: landlordId,
    userType: 'landlord',
    role: 'OWNER_LANDLORD',
    status: 'pending',
  });

  // Create approval request
  const approvalRequest = await prisma.approvalRequest.create({
    data: {
      workflowType: ApprovalWorkflowType.BIG_EXPENSE,
      entityType: 'expense',
      entityId: expenseId,
      requestedBy,
      requestedByType,
      status: ApprovalRequestStatus.PENDING,
      approvers: approvers as any,
      metadata: {
        amount,
        threshold,
        pmcId,
        landlordId,
      },
    },
  });

  return approvalRequest.id;
}

/**
 * Approve big expense
 */
export async function approveBigExpense(
  approvalRequestId: string,
  expenseId: string,
  approvedBy: string,
  approvedByType: string,
  approvedByEmail?: string,
  approvedByName?: string
): Promise<void> {
  const approval = await prisma.approvalRequest.findUnique({
    where: { id: approvalRequestId },
  });

  if (!approval) {
    throw new Error('Approval request not found');
  }

  if (approval.status !== ApprovalRequestStatus.PENDING) {
    throw new Error('Approval request is not pending');
  }

  const approvers = approval.approvers as unknown as ApprovalApprover[];

  // Find approver and update status
  const approver = approvers.find((a) => a.userId === approvedBy);
  if (!approver) {
    throw new Error('You are not an approver for this request');
  }

  approver.status = 'approved';
  approver.approvedAt = new Date();

  // Check if all required approvers have approved
  const allApproved = approvers.every((a) => a.status === 'approved');
  const anyRejected = approvers.some((a) => a.status === 'rejected');

  if (anyRejected) {
    // One rejected = void
    const updateData: any = {
      status: ApprovalRequestStatus.REJECTED,
      rejectedBy: approvedBy,
      rejectedByType: approvedByType,
      rejectedAt: new Date(),
      rejectionReason: 'One or more approvers rejected',
      approvers,
    };
    if (approvedByEmail) updateData.rejectedByEmail = approvedByEmail;
    if (approvedByName) updateData.rejectedByName = approvedByName;
    
    await prisma.approvalRequest.update({
      where: { id: approvalRequestId },
      data: updateData,
    });

    // Log to audit
    await prisma.rBACAuditLog.create({
      data: {
        userId: approvedBy,
        userType: approvedByType,
        action: 'big_expense_voided',
        resource: 'expense',
        resourceId: expenseId,
        details: {
          approvalRequestId,
          status: ApprovalRequestStatus.REJECTED,
          reason: 'One or more approvers rejected',
        },
      },
    });
    return;
  }

  if (allApproved) {
    // All approved, mark expense as approved
    // Note: You'd need to add an approved field to Expense model or use PMCLandlordApproval
    await prisma.approvalRequest.update({
      where: { id: approvalRequestId },
      data: {
        status: ApprovalRequestStatus.APPROVED,
        approvedBy,
        approvedByType,
        approvedByEmail,
        approvedByName,
        approvedAt: new Date(),
        approvers: approvers as any,
      },
    });

    // Log to audit
    await prisma.rBACAuditLog.create({
      data: {
        userId: approvedBy,
        userType: approvedByType,
        action: 'big_expense_approved',
        resource: 'expense',
        resourceId: expenseId,
        details: {
          approvalRequestId,
          status: ApprovalRequestStatus.APPROVED,
        },
      },
    });
  } else {
    // Update approval request with new approver status
    await prisma.approvalRequest.update({
      where: { id: approvalRequestId },
      data: {
        approvers: approvers as any,
      },
    });
  }
}

/**
 * Create lease approval request
 * Leases ALWAYS require owner approval
 */
export async function createLeaseApproval(
  leaseId: string,
  requestedBy: string,
  requestedByType: string,
  landlordId: string
): Promise<string> {
  // Create approval request
  const approvalRequest = await prisma.approvalRequest.create({
    data: {
      workflowType: ApprovalWorkflowType.LEASE,
      entityType: 'lease',
      entityId: leaseId,
      requestedBy,
      requestedByType,
      status: ApprovalRequestStatus.PENDING,
      approvers: [
        {
          userId: landlordId,
          userType: 'landlord',
          role: 'OWNER_LANDLORD',
          status: 'pending',
        },
      ],
      metadata: {
        requiresApproval: true, // Always required
      },
    },
  });

  return approvalRequest.id;
}

/**
 * Approve lease
 */
export async function approveLease(
  approvalRequestId: string,
  leaseId: string,
  approvedBy: string,
  approvedByType: string,
  approvedByEmail?: string,
  approvedByName?: string
): Promise<void> {
  const approval = await prisma.approvalRequest.findUnique({
    where: { id: approvalRequestId },
  });

  if (!approval) {
    throw new Error('Approval request not found');
  }

  // Check if user can approve (must be owner/landlord)
  const canApprove = await hasPermission(
    approvedBy,
    approvedByType,
    'leases',
    PermissionAction.APPROVE,
    ResourceCategory.LEASING_APPLICATIONS
  );

  if (!canApprove) {
    throw new Error('You do not have permission to approve leases');
  }

  // Mark lease as approved and official
  await prisma.lease.update({
    where: { id: leaseId },
    data: {
      status: 'Active', // Or 'Official'
    },
  });

  // Update approval request
  await prisma.approvalRequest.update({
    where: { id: approvalRequestId },
    data: {
      status: ApprovalRequestStatus.APPROVED,
      approvedBy,
      approvedByType,
      approvedByEmail,
      approvedByName,
      approvedAt: new Date(),
    },
  });

  // Log to audit
  await prisma.rBACAuditLog.create({
    data: {
      userId: approvedBy,
      userType: approvedByType,
      action: 'lease_approved',
      resource: 'lease',
      resourceId: leaseId,
      details: {
        approvalRequestId,
        status: ApprovalRequestStatus.APPROVED,
      },
    },
  });
}

/**
 * Create refund approval request
 * Refunds require PMC Admin or Landlord final approval, always full refund
 */
export async function createRefundApproval(
  refundId: string,
  amount: number,
  requestedBy: string,
  requestedByType: string,
  pmcId?: string,
  landlordId?: string
): Promise<string> {
  // Refunds are always full - no partial refunds
  // This is enforced at the application level

  // Determine approver
  const approverId = pmcId || landlordId;
  if (!approverId) {
    throw new Error('Either pmcId or landlordId must be provided');
  }
  const approverType = pmcId ? 'pmc' : 'landlord';
  const approverRole = pmcId ? 'PMC_ADMIN' : 'OWNER_LANDLORD';

  const approvalRequest = await prisma.approvalRequest.create({
    data: {
      workflowType: ApprovalWorkflowType.REFUND,
      entityType: 'refund',
      entityId: refundId,
      requestedBy,
      requestedByType,
      status: ApprovalRequestStatus.PENDING,
      approvers: [
        {
          userId: approverId,
          userType: approverType,
          role: approverRole,
          status: 'pending',
        },
      ],
      metadata: {
        amount,
        fullRefund: true, // Always full
        pmcId,
        landlordId,
      },
    },
  });

  return approvalRequest.id;
}

/**
 * Approve refund
 */
export async function approveRefund(
  approvalRequestId: string,
  refundId: string,
  approvedBy: string,
  approvedByType: string,
  approvedByEmail?: string,
  approvedByName?: string
): Promise<void> {
  const approval = await prisma.approvalRequest.findUnique({
    where: { id: approvalRequestId },
  });

  if (!approval) {
    throw new Error('Approval request not found');
  }

  if (approval.status !== ApprovalRequestStatus.PENDING) {
    throw new Error('Approval request is not pending');
  }

  const approvers = approval.approvers as unknown as ApprovalApprover[];
  const approver = approvers.find((a) => a.userId === approvedBy);

  // Check if user is an approver
  if (!approver) {
    throw new Error('You are not authorized to approve this refund');
  }

  // Process refund (full amount)
  // This would integrate with your payment system

  // Update approver status
  approver.status = 'approved';
  approver.approvedAt = new Date();

  // Update approval request
  await prisma.approvalRequest.update({
    where: { id: approvalRequestId },
    data: {
      status: ApprovalRequestStatus.APPROVED,
      approvedBy,
      approvedByType,
      approvedByEmail,
      approvedByName,
      approvedAt: new Date(),
      approvers: approvers as any,
    },
  });

  // Log to audit
  await prisma.rBACAuditLog.create({
    data: {
      userId: approvedBy,
      userType: approvedByType,
      action: 'refund_approved',
      resource: 'refund',
      resourceId: refundId,
      details: {
        approvalRequestId,
        status: ApprovalRequestStatus.APPROVED,
        amount: (approval.metadata as any)?.amount,
      },
    },
  });
}

/**
 * Get pending approvals for a user
 */
export async function getPendingApprovals(
  userId: string,
  userType: string
): Promise<any[]> {
  // Get approvals where user is an approver
  const approvals = await prisma.approvalRequest.findMany({
    where: {
      status: ApprovalRequestStatus.PENDING,
      approvers: {
        path: ['$[*].userId'],
        array_contains: userId,
      },
    },
    orderBy: {
      requestedAt: 'desc',
    },
  });

  // Filter to only those where user's approver status is pending
  return approvals.filter((approval) => {
    const approvers = approval.approvers as unknown as ApprovalApprover[];
    const userApprover = approvers.find((a) => a.userId === userId);
    return userApprover?.status === 'pending';
  });
}

/**
 * Check and process expired approvals
 * This should be run by a cron job (e.g., daily)
 */
export async function checkExpiredApprovals(): Promise<void> {
  const now = new Date();

  // Find expired pending approvals
  const expiredApprovals = await prisma.approvalRequest.findMany({
    where: {
      status: ApprovalRequestStatus.PENDING,
      expiresAt: {
        lte: now,
      },
    },
  });

  for (const approval of expiredApprovals) {
    if (approval.workflowType === ApprovalWorkflowType.PROPERTY_EDIT) {
      // Revert property changes
      const beforeState = approval.beforeState as any;
      if (beforeState && approval.entityId) {
        await prisma.property.update({
          where: { id: approval.entityId },
          data: beforeState,
        });

        // Notify requester
        // (Implementation depends on your notification system)
      }
    }

    // Mark as expired
    await prisma.approvalRequest.update({
      where: { id: approval.id },
      data: {
        status: ApprovalRequestStatus.EXPIRED,
      },
    });

    // Log to audit
    await prisma.rBACAuditLog.create({
      data: {
        userId: approval.requestedBy,
        userType: approval.requestedByType,
        action: `${approval.workflowType}_expired`,
        resource: approval.entityType,
        resourceId: approval.entityId,
        details: {
          approvalRequestId: approval.id,
          status: ApprovalRequestStatus.EXPIRED,
          reverted: approval.workflowType === ApprovalWorkflowType.PROPERTY_EDIT,
        },
      },
    });
  }
}

/**
 * Reject an approval request
 */
export async function rejectApproval(
  approvalRequestId: string,
  rejectedBy: string,
  rejectedByType: string,
  rejectionReason: string,
  rejectedByEmail?: string,
  rejectedByName?: string
): Promise<void> {
  const approval = await prisma.approvalRequest.findUnique({
    where: { id: approvalRequestId },
  });

  if (!approval) {
    throw new Error('Approval request not found');
  }

  if (approval.status !== ApprovalRequestStatus.PENDING) {
    throw new Error('Approval request is not pending');
  }

  // Update approver status
  const approvers = approval.approvers as unknown as ApprovalApprover[];
  const approver = approvers.find((a) => a.userId === rejectedBy);
  if (approver) {
    approver.status = 'rejected';
    approver.rejectedAt = new Date();
    approver.notes = rejectionReason;
  }

  // For big expenses, if one rejects, the whole thing is void
  if (approval.workflowType === ApprovalWorkflowType.BIG_EXPENSE) {
    await prisma.approvalRequest.update({
      where: { id: approvalRequestId },
      data: {
        status: ApprovalRequestStatus.REJECTED,
        rejectedBy,
        rejectedByType,
        rejectedByEmail,
        rejectedByName,
        rejectedAt: new Date(),
        rejectionReason,
        approvers: approvers as any,
      },
    });
  } else {
    // For other workflows, update approver status
    await prisma.approvalRequest.update({
      where: { id: approvalRequestId },
      data: {
        approvers: approvers as any,
      },
    });
  }

  // Log to audit
  await prisma.rBACAuditLog.create({
    data: {
      userId: rejectedBy,
      userType: rejectedByType,
      action: `${approval.workflowType}_rejected`,
      resource: approval.entityType,
      resourceId: approval.entityId,
      details: {
        approvalRequestId,
        status: ApprovalRequestStatus.REJECTED,
        rejectionReason,
      },
    },
  });
}

