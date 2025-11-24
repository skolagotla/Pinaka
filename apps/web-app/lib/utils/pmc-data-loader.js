/**
 * PMC Data Loader Utility
 * 
 * Consolidates all PMC data fetching patterns for landlords managed by the PMC.
 * Similar to landlord-data-loader but for PMC-managed properties.
 */

/**
 * Get all data for landlords managed by a PMC
 * @param {Object} prisma - Prisma client instance
 * @param {string} pmcId - PMC ID
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} PMC data with requested relations
 */
export async function getPMCManagedData(prisma, pmcId, options = {}) {
  const {
    includeProperties = true,
    includeUnits = true,
    includeLeases = true,
    includeTenants = true,
    autoCreateUnits = true,
    includeDocuments = false,
    includeMaintenanceRequests = false,
    includeMaintenanceComments = false,
  } = options;

  // Get all active PMC-Landlord relationships
  const pmcLandlords = await prisma.pMCLandlord.findMany({
    where: {
      pmcId: pmcId,
      status: 'active',
      OR: [
        { endedAt: null },
        { endedAt: { gt: new Date() } },
      ],
    },
    include: {
      landlord: {
        include: {},
      },
    },
  });

  const landlordIds = pmcLandlords.map(pl => pl.landlord.id);

  if (landlordIds.length === 0) {
    return {
      pmcLandlords: [],
      landlords: [],
      properties: [],
      landlordIds: [],
    };
  }

  // Build include object for properties
  const propertyInclude = {};
  
  if (includeUnits) {
    propertyInclude.units = {
      include: {},
    };
    
    if (includeLeases) {
      propertyInclude.units.include.leases = {
        include: {},
      };
      
      if (includeTenants) {
        propertyInclude.units.include.leases.include.leaseTenants = {
          include: {
            tenant: true,
          },
        };
      }
    }
  }

  // Get all properties for managed landlords
  const properties = includeProperties ? await prisma.property.findMany({
    where: {
      landlordId: { in: landlordIds },
    },
    include: propertyInclude,
    orderBy: { createdAt: 'desc' },
  }) : [];

  // Get all landlords with their basic info
  const landlords = await prisma.landlord.findMany({
    where: {
      id: { in: landlordIds },
    },
    select: {
      id: true,
      landlordId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      approvalStatus: true,
    },
  });

  return {
    pmcLandlords,
    landlords,
    properties,
    landlordIds,
  };
}

