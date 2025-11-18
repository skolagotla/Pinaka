/**
 * Bank Reconciliation Feature
 * Phase 4: Feature Implementation (RBAC-Enabled)
 */

import { PrismaClient } from '@prisma/client';
import { hasPermission } from '../rbac';
import { logDataAccess } from '../rbac/auditLogging';
import { ResourceCategory, PermissionAction } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create bank reconciliation
 * RBAC: Accountant, PMC Admin, Landlord can create
 */
export async function createBankReconciliation(
  reconciliationDate: Date,
  startingBalance: number,
  endingBalance: number,
  matchedPayments: any[],
  matchedExpenses: any[],
  unmatchedPayments: any[],
  unmatchedExpenses: any[],
  userId: string,
  userType: string,
  userEmail: string,
  userName: string,
  pmcId?: string,
  landlordId?: string,
  propertyId?: string
): Promise<string> {
  // Check permission
  const canCreate = await hasPermission(
    userId,
    userType,
    'bank_reconciliation',
    PermissionAction.CREATE,
    ResourceCategory.ACCOUNTING
  );

  if (!canCreate) {
    throw new Error('You do not have permission to create bank reconciliations');
  }

  // Calculate reconciliation result
  const reconciledAmount = endingBalance - startingBalance;
  const difference = 0; // Would be calculated based on matched vs unmatched items

  const reconciliation = await prisma.bankReconciliation.create({
    data: {
      reconciliationDate,
      pmcId: pmcId || null,
      landlordId: landlordId || null,
      propertyId: propertyId || null,
      startingBalance,
      endingBalance,
      matchedPayments: matchedPayments as any,
      matchedExpenses: matchedExpenses as any,
      unmatchedPayments: unmatchedPayments as any,
      unmatchedExpenses: unmatchedExpenses as any,
      reconciledAmount,
      difference,
      status: 'draft',
      reconciledBy: userId,
      reconciledByType: userType,
      reconciledByEmail: userEmail,
      reconciledByName: userName,
    },
  });

  return reconciliation.id;
}

/**
 * Complete reconciliation
 */
export async function completeReconciliation(
  reconciliationId: string,
  userId: string,
  userType: string,
  userEmail: string,
  userName: string
): Promise<void> {
  // Check permission
  const canUpdate = await hasPermission(
    userId,
    userType,
    'bank_reconciliation',
    PermissionAction.UPDATE,
    ResourceCategory.ACCOUNTING
  );

  if (!canUpdate) {
    throw new Error('You do not have permission to complete reconciliations');
  }

  await prisma.bankReconciliation.update({
    where: { id: reconciliationId },
    data: {
      status: 'completed',
      reconciledAt: new Date(),
    },
  });
}

