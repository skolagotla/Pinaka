/**
 * Landlord Data Loader Utility
 * 
 * Consolidates all landlord data fetching patterns into a single, reusable utility.
 * Eliminates ~500 lines of duplicated code across 7+ pages.
 * 
 * @example
 * const { landlord, leases, units, tenants } = await getLandlordWithFullRelations(
 *   prisma,
 *   email,
 *   {
 *     includeLeases: true,
 *     includeTenants: true,
 *     autoCreateUnits: true
 *   }
 * );
 */

/**
 * Get landlord with full relations (properties, units, leases, tenants)
 * @param {Object} prisma - Prisma client instance
 * @param {string} email - Landlord email
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Landlord data with requested relations
 */
export async function getLandlordWithFullRelations(prisma, email, options = {}) {
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

  // Build include object dynamically
  const include = {};
  
  if (includeProperties) {
    include.properties = {
      include: {}
    };
    
    // Add maintenance requests to properties if requested
    if (includeMaintenanceRequests) {
      include.properties.include.maintenanceRequests = {
        include: {
          tenant: true,
          property: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      };
      
      // Include comments if requested
      if (includeMaintenanceComments) {
        include.properties.include.maintenanceRequests.include.comments = {
          orderBy: {
            createdAt: "asc",
          },
        };
      }
    }
    
    if (includeUnits) {
      include.properties.include.units = {
        include: {}
      };
      
      if (includeLeases) {
        const leaseInclude = {
          unit: {
            include: {
              property: true
            }
          }
        };
        
        if (includeTenants) {
          const tenantInclude = {};
          
          if (includeDocuments) {
            tenantInclude.documents = {
              where: { isDeleted: false },
              orderBy: [
                { isRequired: "desc" },
                { category: "asc" },
                { uploadedAt: "desc" },
              ],
            };
          }
          
          if (includeMaintenanceRequests) {
            tenantInclude.maintenanceRequests = {
              orderBy: { createdAt: "desc" }
            };
          }
          
          leaseInclude.leaseTenants = {
            include: {
              tenant: Object.keys(tenantInclude).length > 0 ? {
                include: tenantInclude
              } : true
            }
          };
        } else {
          leaseInclude.leaseTenants = true;
        }
        
        include.properties.include.units.include.leases = {
          include: leaseInclude,
          orderBy: { createdAt: "desc" }
        };
      }
    }
  }

  // Fetch landlord
  const landlord = await prisma.landlord.findUnique({
    where: { email },
    include: Object.keys(include).length > 0 ? include : undefined
  });

  if (!landlord) {
    return null;
  }

  // Auto-create units for single-unit properties if requested
  if (autoCreateUnits && includeProperties && landlord.properties) {
    // OPTIMIZED: Batch check all unit counts in parallel instead of sequential queries
    const propertyIds = landlord.properties.map(p => p.id);
    const unitCounts = await Promise.all(
      propertyIds.map(propertyId =>
        prisma.unit.count({ where: { propertyId } })
      )
    );
    
    // Create map of propertyId -> unitCount for O(1) lookup
    const unitCountMap = new Map(
      propertyIds.map((id, index) => [id, unitCounts[index]])
    );
    
    // Find properties that need units
    const propertiesNeedingUnits = landlord.properties.filter(
      property => property.unitCount === 1 && unitCountMap.get(property.id) === 0
    );
    
    if (propertiesNeedingUnits.length > 0) {
      // Re-fetch properties with units in parallel
      const updatedProperties = await Promise.all(
        propertiesNeedingUnits.map(property =>
          prisma.property.findUnique({
            where: { id: property.id },
            select: {
              id: true,
              unitCount: true,
              units: {
                select: {
                  id: true,
                },
              },
            },
          })
        )
      );
      
      // Filter to only those that still need units
      const propertiesToCreate = updatedProperties.filter(
        prop => prop && (!prop.units || prop.units.length === 0)
      );
      
      if (propertiesToCreate.length > 0) {
        await ensureUnitsForProperties(prisma, propertiesToCreate);
        
        // Check if any property still needs units (batch check)
        const finalCounts = await Promise.all(
          propertiesToCreate.map(prop =>
            prisma.unit.count({ where: { propertyId: prop.id } })
          )
        );
        
        const needsRefetch = finalCounts.some(count => count === 0);
        
        if (needsRefetch) {
          return await getLandlordWithFullRelations(prisma, email, {
            ...options,
            autoCreateUnits: false // Prevent infinite loop
          });
        }
      }
    }
  }

  return landlord;
}

/**
 * Ensure units exist for properties that need them
 * Auto-creates units for single-unit properties that don't have units yet
 * 
 * @param {Object} prisma - Prisma client instance
 * @param {Array} properties - Array of property objects
 * @returns {Promise<void>}
 */
export async function ensureUnitsForProperties(prisma, properties) {
  const createPromises = [];
  const crypto = require('crypto');
  
  for (const property of properties) {
    // Only create unit if property has unitCount === 1 AND no units exist
    // Also check actual unit count in database to prevent duplicates
    const actualUnitCount = await prisma.unit.count({
      where: { propertyId: property.id }
    });
    
    if (property.unitCount === 1 && actualUnitCount === 0 && (!property.units || property.units.length === 0)) {
      const unitId = crypto.randomBytes(8).toString('hex');
      createPromises.push(
        prisma.unit.create({
          data: {
            id: unitId,
            propertyId: property.id,
            unitName: "Unit 1",
            status: "Vacant",
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        })
      );
    }
  }
  
  if (createPromises.length > 0) {
    await Promise.all(createPromises);
  }
}

/**
 * Get landlord with minimal data (just basic info)
 * @param {Object} prisma - Prisma client instance
 * @param {string} email - Landlord email
 * @returns {Promise<Object>} Landlord basic data
 */
export async function getLandlordBasic(prisma, email) {
  return await prisma.landlord.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      country: true,
      provinceState: true
    }
  });
}

/**
 * Get landlord statistics (counts for dashboard)
 * @param {Object} prisma - Prisma client instance
 * @param {string} landlordId - Landlord ID
 * @returns {Promise<Object>} Statistics object
 */
export async function getLandlordStats(prisma, landlordId) {
  const [
    totalProperties,
    totalUnits,
    totalTenants,
    activeLeases,
  ] = await Promise.all([
    prisma.property.count({
      where: { landlordId },
    }),
    prisma.unit.count({
      where: {
        property: {
          landlordId,
        },
      },
    }),
    prisma.tenant.count({
      where: {
        invitedBy: (await prisma.landlord.findUnique({
          where: { id: landlordId },
          select: { email: true }
        }))?.email,
      },
    }),
    prisma.lease.count({
      where: {
        unit: {
          property: {
            landlordId,
          },
        },
        status: "Active",
      },
    }),
  ]);

  return {
    totalProperties,
    totalUnits,
    totalTenants,
    activeLeases,
  };
}

