/**
 * Listing Management Feature
 * Phase 4: Feature Implementation (RBAC-Enabled)
 */

import { PrismaClient } from '@prisma/client';
import { hasPermission } from '../rbac';
import { ResourceCategory, PermissionAction } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create listing
 * RBAC: PM, Leasing, Landlord can create
 */
export async function createListing(
  propertyId: string,
  unitId: string | null,
  title: string,
  description: string | null,
  photos: string[],
  pricing: any,
  availability: Date | null,
  createdBy: string,
  createdByType: string,
  createdByEmail: string,
  createdByName: string,
  isSyndicated: boolean = false
): Promise<string> {
  // Check permission
  const canCreate = await hasPermission(
    createdBy,
    createdByType,
    'listings',
    PermissionAction.CREATE,
    ResourceCategory.MARKETING_LISTINGS
  );

  if (!canCreate) {
    throw new Error('You do not have permission to create listings');
  }

  const listing = await prisma.listing.create({
    data: {
      propertyId,
      unitId: unitId || null,
      title,
      description: description || null,
      photos: photos || [],
      pricing: pricing || null,
      availability: availability || null,
      status: 'draft',
      createdBy,
      createdByType,
      createdByEmail,
      createdByName,
      isSyndicated,
      syndicatedTo: [],
    },
  });

  return listing.id;
}

/**
 * Publish listing
 */
export async function publishListing(
  listingId: string,
  userId: string,
  userType: string
): Promise<void> {
  // Check permission
  const canPublish = await hasPermission(
    userId,
    userType,
    'listings',
    PermissionAction.UPDATE,
    ResourceCategory.MARKETING_LISTINGS
  );

  if (!canPublish) {
    throw new Error('You do not have permission to publish listings');
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      status: 'published',
      publishedAt: new Date(),
    },
  });
}

