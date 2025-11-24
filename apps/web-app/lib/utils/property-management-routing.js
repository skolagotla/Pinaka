/**
 * Property Management Routing Utility
 * Determines who manages a property (Landlord or PMC) for routing support tickets and maintenance requests
 */

const { prisma } = require('../prisma');

/**
 * Get the managing entity for a property
 * @param {string} propertyId - Property ID
 * @returns {Promise<{type: 'landlord' | 'pmc', id: string, entity: any}>}
 */
async function getPropertyManager(propertyId) {
  try {
    // Get property with landlord
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        landlordId: true,
        landlord: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!property) {
      throw new Error(`Property ${propertyId} not found`);
    }

    // Check if landlord is managed by PMC
    const pmcRelationship = await prisma.pMCLandlord.findFirst({
      where: {
        landlordId: property.landlordId,
        status: 'active',
        OR: [
          { endedAt: null },
          { endedAt: { gt: new Date() } },
        ],
      },
      include: {
        pmc: {
          select: {
            id: true,
            companyId: true,
            companyName: true,
            email: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc', // Get most recent active relationship
      },
    });

    if (pmcRelationship && pmcRelationship.pmc) {
      // Property is managed by PMC
      return {
        type: 'pmc',
        id: pmcRelationship.pmc.id,
        entity: pmcRelationship.pmc,
        pmcRelationshipId: pmcRelationship.id,
      };
    } else {
      // Property is managed by landlord directly
      return {
        type: 'landlord',
        id: property.landlordId,
        entity: property.landlord,
      };
    }
  } catch (error) {
    console.error('[Property Management Routing] Error:', error);
    throw error;
  }
}

/**
 * Route a support ticket or maintenance request based on property management
 * @param {string} propertyId - Property ID (optional)
 * @returns {Promise<{assignedToLandlordId: string | null, assignedToPMCId: string | null, assignedToAdminId: string | null}>}
 */
async function routeToPropertyManager(propertyId) {
  if (!propertyId) {
    // No property - route to admin for general support
    return {
      assignedToLandlordId: null,
      assignedToPMCId: null,
      assignedToAdminId: null, // Will be set by caller if needed
    };
  }

  try {
    const manager = await getPropertyManager(propertyId);

    if (manager.type === 'pmc') {
      return {
        assignedToLandlordId: null,
        assignedToPMCId: manager.id,
        assignedToAdminId: null,
      };
    } else {
      return {
        assignedToLandlordId: manager.id,
        assignedToPMCId: null,
        assignedToAdminId: null,
      };
    }
  } catch (error) {
    console.error('[Property Management Routing] Error routing:', error);
    // On error, don't route (let caller handle)
    return {
      assignedToLandlordId: null,
      assignedToPMCId: null,
      assignedToAdminId: null,
    };
  }
}

/**
 * Get all properties managed by a PMC
 * @param {string} pmcId - PMC ID
 * @returns {Promise<string[]>} Array of property IDs
 */
async function getPMCManagedProperties(pmcId) {
  try {
    // Get all active PMC-Landlord relationships
    const pmcRelationships = await prisma.pMCLandlord.findMany({
      where: {
        pmcId: pmcId,
        status: 'active',
        OR: [
          { endedAt: null },
          { endedAt: { gt: new Date() } },
        ],
      },
      select: {
        landlordId: true,
      },
    });

    const landlordIds = pmcRelationships.map(r => r.landlordId);

    if (landlordIds.length === 0) {
      return [];
    }

    // Get all properties for these landlords
    const properties = await prisma.property.findMany({
      where: {
        landlordId: { in: landlordIds },
      },
      select: {
        id: true,
      },
    });

    return properties.map(p => p.id);
  } catch (error) {
    console.error('[Property Management Routing] Error getting PMC properties:', error);
    return [];
  }
}

/**
 * Get all properties managed by a landlord (directly, not via PMC)
 * @param {string} landlordId - Landlord ID
 * @returns {Promise<string[]>} Array of property IDs
 */
async function getLandlordManagedProperties(landlordId) {
  try {
    // Check if landlord is managed by PMC
    const pmcRelationship = await prisma.pMCLandlord.findFirst({
      where: {
        landlordId: landlordId,
        status: 'active',
        OR: [
          { endedAt: null },
          { endedAt: { gt: new Date() } },
        ],
      },
    });

    if (pmcRelationship) {
      // Landlord is managed by PMC, so they don't directly manage properties
      return [];
    }

    // Get all properties for this landlord
    const properties = await prisma.property.findMany({
      where: {
        landlordId: landlordId,
      },
      select: {
        id: true,
      },
    });

    return properties.map(p => p.id);
  } catch (error) {
    console.error('[Property Management Routing] Error getting landlord properties:', error);
    return [];
  }
}

module.exports = {
  getPropertyManager,
  routeToPropertyManager,
  getPMCManagedProperties,
  getLandlordManagedProperties,
};

