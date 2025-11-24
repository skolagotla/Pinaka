/**
 * Owner Statements Feature
 * Phase 4: Feature Implementation (RBAC-Enabled)
 */

import { PrismaClient } from '@prisma/client';
import { hasPermission } from '../rbac';
import { ResourceCategory, PermissionAction } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate owner statement
 * RBAC: Self-service generation
 */
export async function generateOwnerStatement(
  landlordId: string,
  statementDate: Date,
  statementPeriodStart: Date,
  statementPeriodEnd: Date,
  statementType: 'monthly' | 'quarterly' | 'yearly',
  userId: string,
  userType: string,
  userEmail: string,
  userName: string,
  propertyId?: string,
  templateId?: string,
  customFields?: any
): Promise<string> {
  // Check permission (self-service)
  const canGenerate = await hasPermission(
    userId,
    userType,
    'owner_statements',
    PermissionAction.CREATE,
    ResourceCategory.REPORTING_OWNER_STATEMENTS
  );

  if (!canGenerate) {
    throw new Error('You do not have permission to generate owner statements');
  }

  // Calculate financial summary (would fetch from actual data)
  // This is a placeholder - would calculate from rent payments, expenses, etc.
  const totalIncome = 0; // Would calculate from rent payments
  const totalExpenses = 0; // Would calculate from expenses
  const netProfit = totalIncome - totalExpenses;
  const commission = 0; // Would calculate based on commission rate

  const statement = await prisma.ownerStatement.create({
    data: {
      statementDate,
      statementPeriodStart,
      statementPeriodEnd,
      statementType,
      landlordId,
      propertyId: propertyId || null,
      totalIncome,
      totalExpenses,
      netProfit,
      commission,
      templateId: templateId || null,
      customFields: customFields || null,
      status: 'draft',
      generatedBy: userId,
      generatedByType: userType,
      generatedByEmail: userEmail,
      generatedByName: userName,
      generatedAt: new Date(),
    },
  });

  return statement.id;
}

/**
 * Finalize statement (generate PDF)
 */
export async function finalizeStatement(
  statementId: string,
  userId: string,
  userType: string
): Promise<string> {
  // Check permission
  const canUpdate = await hasPermission(
    userId,
    userType,
    'owner_statements',
    PermissionAction.UPDATE,
    ResourceCategory.REPORTING_OWNER_STATEMENTS
  );

  if (!canUpdate) {
    throw new Error('You do not have permission to finalize statements');
  }

  // Generate PDF (placeholder - would use PDF generation library)
  const pdfPath = `/statements/${statementId}.pdf`;

  await prisma.ownerStatement.update({
    where: { id: statementId },
    data: {
      status: 'generated',
      pdfPath,
    },
  });

  return pdfPath;
}

