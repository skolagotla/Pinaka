/**
 * Owner Payouts Feature
 * Phase 4: Feature Implementation (RBAC-Enabled)
 */

import { PrismaClient } from '@prisma/client';
import { hasPermission } from '../rbac';
import { ResourceCategory, PermissionAction } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create owner payout
 * RBAC: PMC initiated, requires approval
 */
export async function createOwnerPayout(
  landlordId: string,
  payoutDate: Date,
  payoutPeriodStart: Date,
  payoutPeriodEnd: Date,
  totalRent: number,
  totalExpenses: number,
  commission: number,
  paymentTerms: 'NET_15' | 'NET_30',
  userId: string,
  userType: string,
  userEmail: string,
  userName: string,
  propertyId?: string,
  pmcId?: string
): Promise<{ payoutId: string; approvalRequestId?: string }> {
  // Check permission (PMC initiated)
  const canCreate = await hasPermission(
    userId,
    userType,
    'owner_payouts',
    PermissionAction.CREATE,
    ResourceCategory.ACCOUNTING
  );

  if (!canCreate) {
    throw new Error('You do not have permission to create owner payouts');
  }

  // Calculate net amount
  const netAmount = totalRent - totalExpenses - commission;

  // Calculate due date
  const dueDate = new Date(payoutDate);
  const days = paymentTerms === 'NET_15' ? 15 : 30;
  dueDate.setDate(dueDate.getDate() + days);

  // Create payout
  const payout = await prisma.ownerPayout.create({
    data: {
      payoutDate,
      payoutPeriodStart,
      payoutPeriodEnd,
      landlordId,
      propertyId: propertyId || null,
      pmcId: pmcId || null,
      totalRent,
      totalExpenses,
      commission,
      netAmount,
      paymentTerms,
      dueDate,
      status: 'pending',
    },
  });

  // Create approval request if needed
  let approvalRequestId: string | undefined;
  // Approval workflow would be implemented here

  return {
    payoutId: payout.id,
    approvalRequestId,
  };
}

/**
 * Approve payout
 */
export async function approvePayout(
  payoutId: string,
  approvedBy: string,
  approvedByType: string,
  approvedByEmail: string,
  approvedByName: string
): Promise<void> {
  // Check permission
  const canApprove = await hasPermission(
    approvedBy,
    approvedByType,
    'owner_payouts',
    PermissionAction.APPROVE,
    ResourceCategory.ACCOUNTING
  );

  if (!canApprove) {
    throw new Error('You do not have permission to approve payouts');
  }

  await prisma.ownerPayout.update({
    where: { id: payoutId },
    data: {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy,
      approvedByType,
      approvedByEmail,
      approvedByName,
    },
  });
}

