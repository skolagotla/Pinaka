/**
 * Vendor Ratings Feature
 * Phase 4: Feature Implementation (RBAC-Enabled)
 */

import { PrismaClient } from '@prisma/client';
import { hasPermission } from '../rbac';
import { ResourceCategory, PermissionAction } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create vendor rating
 * RBAC: Tenants, Landlords, PMs can rate
 */
export async function createVendorRating(
  vendorId: string,
  quality: number,
  timeliness: number,
  communication: number,
  professionalism: number,
  review: string | null,
  userId: string,
  userType: string,
  userEmail: string,
  userName: string,
  workOrderId?: string,
  propertyId?: string,
  unitId?: string
): Promise<string> {
  // Check permission
  const canCreate = await hasPermission(
    userId,
    userType,
    'vendor_ratings',
    PermissionAction.CREATE,
    ResourceCategory.VENDOR_MANAGEMENT
  );

  if (!canCreate) {
    throw new Error('You do not have permission to rate vendors');
  }

  // Calculate overall rating
  const overall = (quality + timeliness + communication + professionalism) / 4;

  const rating = await prisma.vendorRating.create({
    data: {
      vendorId,
      ratedBy: userId,
      ratedByType: userType,
      ratedByEmail: userEmail,
      ratedByName: userName,
      workOrderId: workOrderId || null,
      propertyId: propertyId || null,
      unitId: unitId || null,
      quality,
      timeliness,
      communication,
      professionalism,
      overall,
      review: review || null,
      status: 'active',
    },
  });

  return rating.id;
}

/**
 * Block vendor (PM can block low-rated vendors)
 */
export async function blockVendor(
  vendorId: string,
  blockedBy: string,
  blockedByType: string
): Promise<void> {
  // Check permission
  const canBlock = await hasPermission(
    blockedBy,
    blockedByType,
    'vendor_ratings',
    PermissionAction.MANAGE,
    ResourceCategory.VENDOR_MANAGEMENT
  );

  if (!canBlock) {
    throw new Error('You do not have permission to block vendors');
  }

  // Update all ratings for this vendor to blocked
  await prisma.vendorRating.updateMany({
    where: { vendorId },
    data: {
      isBlocked: true,
    },
  });
}

