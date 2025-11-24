/**
 * Security Deposit Management Feature
 * Phase 4: Feature Implementation (RBAC-Enabled)
 * 
 * Implements security deposit management with RBAC integration
 */

import { PrismaClient } from '@prisma/client';
import { hasPermission, canAccessResource } from '../rbac';
import { logDataAccess, logSensitiveDataAccess } from '../rbac/auditLogging';
import { createRefundApproval, approveRefund } from '../rbac/approvalWorkflows';
import { ResourceCategory, PermissionAction } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Security Deposit model (to be added to schema)
 */
interface SecurityDeposit {
  id: string;
  leaseId: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  depositType: 'security' | 'pet' | 'last_month' | 'other';
  status: 'held' | 'refunded' | 'forfeited' | 'partial_refund';
  heldInEscrow: boolean;
  escrowAccount?: string;
  refundedAmount?: number;
  refundedAt?: Date;
  refundedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get security deposit for a lease
 * RBAC: Tenant can view own, PM/Accountant/Landlord can view for their properties
 */
export async function getSecurityDeposit(
  leaseId: string,
  userId: string,
  userType: string,
  userEmail: string,
  userName: string,
  ipAddress?: string,
  userAgent?: string
): Promise<any> {
  // Get lease to check property access
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: {
      unit: {
        include: {
          property: true,
        },
      },
    },
  });

  if (!lease) {
    throw new Error('Lease not found');
  }

  // Check access
  if (userType === 'tenant') {
    // Tenant can only see their own deposits
    const isTenantOnLease = await prisma.leaseTenant.findFirst({
      where: {
        leaseId,
        tenantId: userId,
      },
    });

    if (!isTenantOnLease) {
      throw new Error('Access denied');
    }
  } else {
    // PM/Accountant/Landlord need permission
    const canView = await hasPermission(
      userId,
      userType,
      'security_deposits',
      PermissionAction.READ,
      ResourceCategory.ACCOUNTING,
      {
        propertyId: lease.unit.propertyId,
      }
    );

    if (!canView) {
      throw new Error('Access denied');
    }

    // Check property access
    const canAccessProperty = await canAccessResource(
      userId,
      userType,
      lease.unit.propertyId,
      'property'
    );

    if (!canAccessProperty) {
      throw new Error('Access denied to this property');
    }
  }

  // Log access (sensitive financial data)
  await logSensitiveDataAccess(
    userId,
    userType,
    userEmail,
    userName,
    'security_deposit',
    leaseId,
    ['financials', 'deposit_amount'],
    ipAddress,
    userAgent
  );

  // Get deposit (would query SecurityDeposit model when added to schema)
  // For now, return placeholder
  return {
    leaseId,
    amount: 0, // Would be from SecurityDeposit model
    status: 'held',
  };
}

/**
 * Create or update security deposit
 * RBAC: PM/Accountant can edit, Landlord can edit if self-managed
 */
export async function updateSecurityDeposit(
  leaseId: string,
  amount: number,
  depositType: string,
  userId: string,
  userType: string,
  userEmail: string,
  userName: string
): Promise<void> {
  // Check permission
  const canEdit = await hasPermission(
    userId,
    userType,
    'security_deposits',
    PermissionAction.UPDATE,
    ResourceCategory.ACCOUNTING
  );

  if (!canEdit) {
    throw new Error('You do not have permission to edit security deposits');
  }

  // Get lease to check property access
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: {
      unit: {
        include: {
          property: true,
        },
      },
    },
  });

  if (!lease) {
    throw new Error('Lease not found');
  }

  // Check property access
  const canAccessProperty = await canAccessResource(
    userId,
    userType,
    lease.unit.propertyId,
    'property'
  );

  if (!canAccessProperty) {
    throw new Error('Access denied to this property');
  }

  // Update deposit (would update SecurityDeposit model when added to schema)
  // For now, log the action
  await prisma.rBACAuditLog.create({
    data: {
      userId,
      userType,
      userEmail,
      userName,
      action: 'security_deposit_updated',
      resource: 'security_deposit',
      resourceId: leaseId,
      details: {
        amount,
        depositType,
      },
    },
  });
}

/**
 * Process security deposit refund
 * RBAC: PMC Accountant or Landlord can process, requires approval
 * Always full refund (no partial)
 */
export async function processSecurityDepositRefund(
  leaseId: string,
  userId: string,
  userType: string,
  userEmail: string,
  userName: string,
  pmcId?: string,
  landlordId?: string
): Promise<string> {
  // Check permission
  const canRefund = await hasPermission(
    userId,
    userType,
    'security_deposits',
    PermissionAction.APPROVE,
    ResourceCategory.ACCOUNTING
  );

  if (!canRefund) {
    throw new Error('You do not have permission to process refunds');
  }

  // Get deposit amount (would be from SecurityDeposit model)
  const depositAmount = 1000; // Placeholder

  // Create refund approval request (always requires approval, always full refund)
  const approvalRequestId = await createRefundApproval(
    `refund-${leaseId}`, // refundId
    depositAmount,
    userId,
    userType,
    pmcId,
    landlordId
  );

  return approvalRequestId;
}

