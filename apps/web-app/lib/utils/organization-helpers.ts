/**
 * Organization Helper Utilities
 * Functions for managing organizations and enforcing multi-tenant data isolation
 */

import { PrismaClient } from '@prisma/client';

/**
 * Get organization ID from user context
 * Falls back to landlord's organization if user is a landlord
 */
export async function getOrganizationId(
  prisma: PrismaClient,
  user: { userId: string; role: string; email?: string }
): Promise<string | null> {
  if (user.role === 'landlord') {
    const landlord = await prisma.landlord.findUnique({
      where: { id: user.userId },
      select: { organizationId: true },
    });
    return landlord?.organizationId || null;
  }

  // For other roles, organizationId should be in user context
  // This will be set by middleware
  return (user as any).organizationId || null;
}

/**
 * Add organization filter to Prisma query where clause
 * Ensures data isolation - users can only see their organization's data
 */
export function addOrganizationFilter(
  whereClause: any,
  organizationId: string | null
): any {
  if (!organizationId) {
    // If no organizationId, return original where clause
    // This allows backward compatibility during migration
    return whereClause;
  }

  return {
    ...whereClause,
    organizationId: organizationId,
  };
}

/**
 * Verify that a resource belongs to a specific organization
 * Used before allowing updates/deletes
 */
export async function verifyOrganizationOwnership(
  prisma: PrismaClient,
  model: string,
  resourceId: string,
  organizationId: string
): Promise<boolean> {
  try {
    const resource = await (prisma as any)[model].findUnique({
      where: { id: resourceId },
      select: { organizationId: true },
    });

    return resource?.organizationId === organizationId;
  } catch (error) {
    console.error(`[Organization Helpers] Error verifying ownership for ${model}:`, error);
    return false;
  }
}

/**
 * Get organization usage statistics
 * Used for enforcing limits and quotas
 */
export async function getOrganizationUsage(
  prisma: PrismaClient,
  organizationId: string
): Promise<{
  propertyCount: number;
  tenantCount: number;
  userCount: number;
  storageGB: number;
}> {
  const [propertyCount, tenantCount, userCount] = await Promise.all([
    prisma.property.count({
      where: { organizationId },
    }),
    prisma.tenant.count({
      where: {
        leaseTenants: {
          some: {
            lease: {
              unit: {
                property: {
                  organizationId,
                },
              },
            },
          },
        },
      },
    }),
    prisma.landlord.count({
      where: { organizationId },
    }),
  ]);

  // Calculate storage (simplified - would need actual file size calculation)
  // For now, estimate based on document count
  const documentCount = await prisma.document.count({
    where: {
      property: {
        organizationId,
      },
    },
  });

  // Rough estimate: 1MB per document average
  const storageGB = (documentCount * 1) / 1024;

  return {
    propertyCount,
    tenantCount,
    userCount,
    storageGB: Math.round(storageGB * 100) / 100, // Round to 2 decimal places
  };
}

/**
 * Check if organization has reached usage limits
 */
export async function checkOrganizationLimits(
  prisma: PrismaClient,
  organizationId: string
): Promise<{
  withinLimits: boolean;
  exceededLimits: string[];
  usage: Awaited<ReturnType<typeof getOrganizationUsage>>;
}> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      maxProperties: true,
      maxTenants: true,
      maxUsers: true,
      maxStorageGB: true,
    },
  });

  if (!organization) {
    throw new Error(`Organization ${organizationId} not found`);
  }

  const usage = await getOrganizationUsage(prisma, organizationId);
  const exceededLimits: string[] = [];

  if (organization.maxProperties !== null && usage.propertyCount >= organization.maxProperties) {
    exceededLimits.push('properties');
  }
  if (organization.maxTenants !== null && usage.tenantCount >= organization.maxTenants) {
    exceededLimits.push('tenants');
  }
  if (organization.maxUsers !== null && usage.userCount >= organization.maxUsers) {
    exceededLimits.push('users');
  }
  if (organization.maxStorageGB !== null && usage.storageGB >= organization.maxStorageGB) {
    exceededLimits.push('storage');
  }

  return {
    withinLimits: exceededLimits.length === 0,
    exceededLimits,
    usage,
  };
}

/**
 * Get organization by subdomain
 * Used for subdomain-based routing
 */
export async function getOrganizationBySubdomain(
  prisma: PrismaClient,
  subdomain: string
): Promise<{ id: string; name: string; status: string } | null> {
  const organization = await prisma.organization.findUnique({
    where: { subdomain },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  return organization;
}

/**
 * Verify organization status and trial expiration
 * Returns error message if organization is not active, null if OK
 */
export async function verifyOrganizationStatus(
  prisma: PrismaClient,
  organizationId: string | null
): Promise<{ allowed: boolean; error?: string; status?: string }> {
  if (!organizationId) {
    // No organization - allow (backward compatibility)
    return { allowed: true };
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      status: true,
      trialEndsAt: true,
      subscriptionStatus: true,
    },
  });

  if (!organization) {
    return { allowed: false, error: 'Organization not found' };
  }

  // Check trial expiration
  if (organization.trialEndsAt && new Date(organization.trialEndsAt) < new Date()) {
    // Trial expired - check if subscription is active
    if (organization.subscriptionStatus !== 'active') {
      return {
        allowed: false,
        error: 'Your trial period has ended. Please upgrade to a paid plan to continue using the service.',
        status: 'TRIAL_EXPIRED',
      };
    }
  }

  // Check organization status
  switch (organization.status) {
    case 'ACTIVE':
      return { allowed: true, status: 'ACTIVE' };
    case 'SUSPENDED':
      return {
        allowed: false,
        error: 'Your organization account has been suspended. Please contact support for assistance.',
        status: 'SUSPENDED',
      };
    case 'CANCELLED':
      return {
        allowed: false,
        error: 'Your organization account has been cancelled. Please contact support to reactivate.',
        status: 'CANCELLED',
      };
    case 'TRIAL':
      // Trial is active (not expired)
      return { allowed: true, status: 'TRIAL' };
    default:
      return {
        allowed: false,
        error: 'Your organization account is in an invalid state. Please contact support.',
        status: organization.status,
      };
  }
}

