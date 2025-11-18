/**
 * PMC Permission Utilities
 * 
 * Handles permission checks for PMC-managed landlords and PMC users
 */

/**
 * Check if a landlord is managed by a PMC
 * @param {Object} prisma - Prisma client instance
 * @param {string} landlordId - Landlord ID
 * @returns {Promise<Object|null>} PMC relationship if managed, null otherwise
 */
export async function getLandlordPMC(prisma, landlordId) {
  const pmcRelationship = await prisma.pMCLandlord.findFirst({
    where: {
      landlordId,
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
          companyName: true,
          email: true,
        },
      },
    },
  });

  return pmcRelationship;
}

/**
 * Check if a landlord is managed by a specific PMC
 * @param {Object} prisma - Prisma client instance
 * @param {string} landlordId - Landlord ID
 * @param {string} pmcId - PMC ID
 * @returns {Promise<boolean>} True if landlord is managed by this PMC
 */
export async function isLandlordManagedByPMC(prisma, landlordId, pmcId) {
  const relationship = await prisma.pMCLandlord.findFirst({
    where: {
      landlordId,
      pmcId,
      status: 'active',
      OR: [
        { endedAt: null },
        { endedAt: { gt: new Date() } },
      ],
    },
  });

  return !!relationship;
}

/**
 * Get permission context for a user
 * @param {Object} prisma - Prisma client instance
 * @param {Object} user - User object with role and userId
 * @returns {Promise<Object>} Permission context
 */
export async function getPermissionContext(prisma, user) {
  const context = {
    userRole: user.role,
    userId: user.userId,
    isPMC: user.role === 'pmc',
    isLandlord: user.role === 'landlord',
    isPMCManaged: false,
    managingPMC: null,
    canEdit: true,
    canAddProperties: true,
    canEditProperties: true,
    canEditTenants: true,
    canEditLeases: true,
    canEditMaintenance: true,
  };

  if (user.role === 'pmc') {
    // PMC users can view but not edit
    context.canEdit = false;
    context.canAddProperties = false;
    context.canEditProperties = false;
    context.canEditTenants = false;
    context.canEditLeases = false;
    context.canEditMaintenance = false;
  } else if (user.role === 'landlord') {
    // Check if landlord is managed by PMC
    const pmcRelationship = await getLandlordPMC(prisma, user.userId);
    if (pmcRelationship) {
      context.isPMCManaged = true;
      context.managingPMC = pmcRelationship.pmc;
      // PMC-managed landlords can only add properties, not edit others
      context.canEditProperties = false;
      context.canEditTenants = false;
      context.canEditLeases = false;
      context.canEditMaintenance = false;
      // But they can still add properties
      context.canAddProperties = true;
    }
  }

  return context;
}

/**
 * Check if user can edit a specific property
 * @param {Object} prisma - Prisma client instance
 * @param {Object} user - User object
 * @param {string} propertyId - Property ID
 * @returns {Promise<boolean>} True if user can edit the property
 */
export async function canEditProperty(prisma, user, propertyId) {
  if (user.role === 'pmc') {
    return false; // PMCs cannot edit properties
  }

  if (user.role === 'landlord') {
    // Check if property belongs to this landlord
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { landlordId: true },
    });

    if (!property || property.landlordId !== user.userId) {
      return false;
    }

    // Check if landlord is managed by PMC
    const pmcRelationship = await getLandlordPMC(prisma, user.userId);
    if (pmcRelationship) {
      // PMC-managed landlords cannot edit properties (only add)
      return false;
    }

    return true;
  }

  return false;
}

/**
 * Check if user can add properties
 * @param {Object} prisma - Prisma client instance
 * @param {Object} user - User object
 * @returns {Promise<boolean>} True if user can add properties
 */
export async function canAddProperty(prisma, user) {
  if (user.role === 'pmc') {
    return false; // PMCs cannot add properties
  }

  if (user.role === 'landlord') {
    // Landlords can always add properties, even if managed by PMC
    return true;
  }

  return false;
}

/**
 * Check if a landlord is managed by PMC (quick check)
 * @param {Object} prisma - Prisma client instance
 * @param {string} landlordId - Landlord ID
 * @returns {Promise<boolean>} True if landlord is managed by PMC
 */
export async function isLandlordPMCManaged(prisma, landlordId) {
  const pmcRelationship = await prisma.pMCLandlord.findFirst({
    where: {
      landlordId,
      status: 'active',
      OR: [
        { endedAt: null },
        { endedAt: { gt: new Date() } },
      ],
    },
  });
  return !!pmcRelationship;
}

