/**
 * Eviction Workflow Feature
 * Phase 4: Feature Implementation (RBAC-Enabled)
 */

import { PrismaClient } from '@prisma/client';
import { hasPermission } from '../rbac';
import { ResourceCategory, PermissionAction } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Initiate eviction
 * RBAC: PMC PM/Leasing or Landlord can initiate
 */
export async function initiateEviction(
  tenantId: string,
  leaseId: string,
  propertyId: string,
  unitId: string,
  reason: string,
  reasonDetails: string | null,
  initiatedBy: string,
  initiatedByType: string,
  initiatedByEmail: string,
  initiatedByName: string,
  ltbFormType?: string
): Promise<string> {
  // Check permission
  const canCreate = await hasPermission(
    initiatedBy,
    initiatedByType,
    'evictions',
    PermissionAction.CREATE,
    ResourceCategory.TENANT_MANAGEMENT
  );

  if (!canCreate) {
    throw new Error('You do not have permission to initiate evictions');
  }

  const eviction = await prisma.eviction.create({
    data: {
      tenantId,
      leaseId,
      propertyId,
      unitId,
      initiatedBy,
      initiatedByType,
      initiatedByEmail,
      initiatedByName,
      reason,
      reasonDetails: reasonDetails || null,
      ltbFormType: ltbFormType || null,
      status: 'initiated',
    },
  });

  return eviction.id;
}

/**
 * Approve eviction (Landlord approval required)
 */
export async function approveEviction(
  evictionId: string,
  approvedBy: string,
  approvedByEmail: string,
  approvedByName: string
): Promise<void> {
  // Check permission
  const canApprove = await hasPermission(
    approvedBy,
    'landlord',
    'evictions',
    PermissionAction.APPROVE,
    ResourceCategory.TENANT_MANAGEMENT
  );

  if (!canApprove) {
    throw new Error('You do not have permission to approve evictions');
  }

  await prisma.eviction.update({
    where: { id: evictionId },
    data: {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy,
      approvedByEmail,
      approvedByName,
    },
  });
}

