/**
 * Data Isolation Utilities
 * Ensures landlords only see their own data in a multi-tenant SaaS environment
 */

/**
 * Add landlord filter to Prisma query where clause
 * This ensures data isolation - landlords can only see their own data
 */
export function addLandlordFilter(whereClause: any, landlordId: string) {
  return {
    ...whereClause,
    landlordId: landlordId,
  };
}

/**
 * Verify that a resource belongs to a specific landlord
 * Used before allowing updates/deletes
 */
export async function verifyLandlordOwnership(
  prisma: any,
  model: string,
  resourceId: string,
  landlordId: string
): Promise<boolean> {
  try {
    const resource = await prisma[model].findUnique({
      where: { id: resourceId },
      select: { landlordId: true },
    });

    return resource?.landlordId === landlordId;
  } catch (error) {
    console.error(`[Data Isolation] Error verifying ownership for ${model}:`, error);
    return false;
  }
}

/**
 * Get all property IDs for a landlord
 * Used for filtering related data (units, leases, tenants, etc.)
 */
export async function getLandlordPropertyIds(prisma: any, landlordId: string): Promise<string[]> {
  const properties = await prisma.property.findMany({
    where: { landlordId },
    select: { id: true },
  });
  return properties.map((p: any) => p.id);
}

/**
 * Get all unit IDs for a landlord
 */
export async function getLandlordUnitIds(prisma: any, landlordId: string): Promise<string[]> {
  const properties = await prisma.property.findMany({
    where: { landlordId },
    include: {
      units: {
        select: { id: true },
      },
    },
  });
  
  const unitIds: string[] = [];
  properties.forEach((property: any) => {
    property.units.forEach((unit: any) => {
      unitIds.push(unit.id);
    });
  });
  
  return unitIds;
}

/**
 * Get all lease IDs for a landlord
 */
export async function getLandlordLeaseIds(prisma: any, landlordId: string): Promise<string[]> {
  const unitIds = await getLandlordUnitIds(prisma, landlordId);
  
  const leases = await prisma.lease.findMany({
    where: {
      unitId: {
        in: unitIds,
      },
    },
    select: { id: true },
  });
  
  return leases.map((lease: any) => lease.id);
}

/**
 * Get all tenant IDs for a landlord (through active leases)
 */
export async function getLandlordTenantIds(prisma: any, landlordId: string): Promise<string[]> {
  const leaseIds = await getLandlordLeaseIds(prisma, landlordId);
  
  const leaseTenants = await prisma.leaseTenant.findMany({
    where: {
      leaseId: {
        in: leaseIds,
      },
    },
    select: { tenantId: true },
  });
  
  const tenantIds = new Set(leaseTenants.map((lt: any) => lt.tenantId as string));
  return Array.from(tenantIds) as string[];
}

