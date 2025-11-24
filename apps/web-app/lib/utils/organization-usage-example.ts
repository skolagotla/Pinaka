/**
 * Example: How to use organizationId in API Routes
 * 
 * This file shows examples of how to use organizationId for data isolation
 * in your API endpoints.
 */

import { UserContext } from '../middleware/apiMiddleware';
import { addOrganizationFilter, checkOrganizationLimits } from './organization-helpers';
const { prisma } = require('../prisma');

/**
 * Example 1: Simple query with organization filter
 */
export async function exampleGetProperties(user: UserContext) {
  // Get organizationId from user context (injected by middleware)
  const { organizationId } = user;

  // Add organization filter to query
  const where = addOrganizationFilter(
    { status: 'ACTIVE' }, // Your existing filters
    organizationId ?? null
  );

  // Query with organization isolation
  const properties = await prisma.property.findMany({
    where,
    include: {
      units: true,
      landlord: true,
    },
  });

  return properties;
}

/**
 * Example 2: Check limits before creating resource
 */
export async function exampleCreateProperty(user: UserContext, propertyData: any) {
  const { organizationId } = user;

  if (!organizationId) {
    throw new Error('Organization ID required');
  }

  // Check if organization has reached property limit
  const limits = await checkOrganizationLimits(prisma, organizationId);
  
  if (!limits.withinLimits) {
    if (limits.exceededLimits.includes('properties')) {
      throw new Error(
        `Organization has reached the property limit (${limits.usage.propertyCount}). ` +
        `Please upgrade your plan to add more properties.`
      );
    }
  }

  // Create property with organizationId
  const property = await prisma.property.create({
    data: {
      ...propertyData,
      organizationId, // Always set organizationId
      landlordId: user.userId, // Assuming user is a landlord
    },
  });

  return property;
}

/**
 * Example 3: Update query with organization verification
 */
export async function exampleUpdateProperty(
  user: UserContext,
  propertyId: string,
  updateData: any
) {
  const { organizationId } = user;

  // First, verify the property belongs to the organization
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      organizationId, // Ensure property belongs to organization
    },
  });

  if (!property) {
    throw new Error('Property not found or access denied');
  }

  // Update the property
  const updated = await prisma.property.update({
    where: { id: propertyId },
    data: updateData,
  });

  return updated;
}

/**
 * Example 4: Complex query with multiple organization filters
 */
export async function exampleGetTenantsWithProperties(user: UserContext) {
  const { organizationId } = user;

  // Get all properties for this organization
  const properties = await prisma.property.findMany({
    where: addOrganizationFilter({}, organizationId ?? null),
    select: { id: true },
  });

  const propertyIds = properties.map(p => p.id);

  // Get tenants through leases
  const tenants = await prisma.tenant.findMany({
    where: {
      leaseTenants: {
        some: {
          lease: {
            unit: {
              propertyId: {
                in: propertyIds, // Only properties in this organization
              },
            },
          },
        },
      },
    },
    include: {
      leaseTenants: {
        include: {
          lease: {
            include: {
              unit: {
                include: {
                  property: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return tenants;
}

/**
 * Example 5: Aggregation query with organization filter
 */
export async function exampleGetOrganizationStats(user: UserContext) {
  const { organizationId } = user;

  if (!organizationId) {
    throw new Error('Organization ID required');
  }

  // Get usage statistics
  const usage = await checkOrganizationLimits(prisma, organizationId);

  // Get organization details
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      settings: true,
    },
  });

  // Get property count
  const propertyCount = await prisma.property.count({
    where: addOrganizationFilter({}, organizationId ?? null),
  });

  // Get tenant count (through properties)
  const tenantCount = await prisma.tenant.count({
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
  });

  return {
    organization,
    usage,
    counts: {
      properties: propertyCount,
      tenants: tenantCount,
    },
    limits: {
      maxProperties: organization?.maxProperties,
      maxTenants: organization?.maxTenants,
      maxUsers: organization?.maxUsers,
      maxStorageGB: organization?.maxStorageGB,
    },
  };
}

