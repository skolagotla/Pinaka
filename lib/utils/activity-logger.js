/**
 * Activity Logger for PMC Actions
 * 
 * Logs all PMC actions for transparency and audit purposes
 */

const { prisma } = require('../prisma');
const { generateCUID } = require('./id-generator');

/**
 * Log a PMC action
 * @param {Object} options
 * @param {string} options.pmcId - PMC ID
 * @param {string} options.action - Action type (view, edit_attempt, approval_request, etc.)
 * @param {string} options.entityType - Entity type (property, tenant, lease, etc.)
 * @param {string} options.entityId - Entity ID
 * @param {string} options.propertyId - Property ID (if applicable)
 * @param {string} options.landlordId - Landlord ID (if applicable)
 * @param {string} options.description - Description of the action
 * @param {Object} options.metadata - Additional metadata
 * @returns {Promise<Object>} Created activity log
 */
async function logPMCAction({
  pmcId,
  action,
  entityType,
  entityId,
  propertyId = null,
  landlordId = null,
  description,
  metadata = {},
}) {
  try {
    const activityLog = await prisma.activityLog.create({
      data: {
        userId: pmcId,
        userType: 'pmc',
        action,
        entityType,
        entityId,
        propertyId,
        description,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return activityLog;
  } catch (error) {
    console.error('[Activity Logger] Error logging PMC action:', error);
    // Don't throw - logging failures shouldn't break the app
    return null;
  }
}

/**
 * Get activity logs for a property
 * @param {string} propertyId - Property ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of activity logs
 */
async function getPropertyActivityLogs(propertyId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    action = null,
    userType = null,
  } = options;

  const where = {
    propertyId,
  };

  if (action) {
    where.action = action;
  }

  if (userType) {
    where.userType = userType;
  }

  const logs = await prisma.activityLog.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
    include: {
      property: {
        select: {
          id: true,
          propertyName: true,
          addressLine1: true,
        },
      },
    },
  });

  return logs;
}

/**
 * Get activity logs for a landlord (PMC actions on their properties)
 * @param {string} landlordId - Landlord ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of activity logs
 */
async function getLandlordActivityLogs(landlordId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    action = null,
    pmcId = null,
  } = options;

  // Get all properties for this landlord
  const properties = await prisma.property.findMany({
    where: { landlordId },
    select: { id: true },
  });

  const propertyIds = properties.map(p => p.id);

  if (propertyIds.length === 0) {
    return [];
  }

  const where = {
    propertyId: { in: propertyIds },
    userType: 'pmc',
  };

  if (action) {
    where.action = action;
  }

  if (pmcId) {
    where.userId = pmcId;
  }

  const logs = await prisma.activityLog.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
    include: {
      property: {
        select: {
          id: true,
          propertyName: true,
          addressLine1: true,
        },
      },
    },
  });

  return logs;
}

/**
 * Get activity logs for a PMC
 * @param {string} pmcId - PMC ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of activity logs
 */
async function getPMCActivityLogs(pmcId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    action = null,
    propertyId = null,
  } = options;

  const where = {
    userId: pmcId,
    userType: 'pmc',
  };

  if (action) {
    where.action = action;
  }

  if (propertyId) {
    where.propertyId = propertyId;
  }

  const logs = await prisma.activityLog.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
    include: {
      property: {
        select: {
          id: true,
          propertyName: true,
          addressLine1: true,
          landlord: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return logs;
}

/**
 * Log an update action
 * @param {Object} user - User object with userId, firstName, lastName, email, role
 * @param {string} entityType - Entity type (property, unit, tenant, etc.)
 * @param {string} entityId - Entity ID
 * @param {string} entityName - Entity name for display
 * @param {string} description - Description of the update
 * @param {Object} metadata - Additional metadata (changedFields, fieldChanges, etc.)
 * @returns {Promise<Object>} Created activity log
 */
async function logUpdate(user, entityType, entityId, entityName, description, metadata = {}) {
  try {
    const activityLog = await prisma.activityLog.create({
      data: {
        id: generateCUID(),
        userId: user.userId || user.id,
        userEmail: user.email,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        userRole: user.role,
        userType: user.userType || user.role,
        action: 'update',
        entityType,
        entityId,
        entityName,
        description,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
        propertyId: metadata.propertyId || null,
        landlordId: metadata.landlordId || (user.role === 'landlord' ? user.userId : null),
        tenantId: metadata.tenantId || null,
        pmcId: metadata.pmcId || (user.role === 'pmc' ? user.userId : null),
      },
    });

    return activityLog;
  } catch (error) {
    console.error('[Activity Logger] Error logging update:', error);
    // Don't throw - logging failures shouldn't break the app
    return null;
  }
}

/**
 * Log a create action
 * @param {Object} user - User object with userId, firstName, lastName, email, role
 * @param {string} entityType - Entity type (property, unit, tenant, etc.)
 * @param {string} entityId - Entity ID
 * @param {string} entityName - Entity name for display
 * @param {string} description - Description of the creation
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Created activity log
 */
async function logCreate(user, entityType, entityId, entityName, description, metadata = {}) {
  try {
    const activityLog = await prisma.activityLog.create({
      data: {
        id: generateCUID(),
        userId: user.userId || user.id,
        userEmail: user.email,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        userRole: user.role,
        userType: user.userType || user.role,
        action: 'create',
        entityType,
        entityId,
        entityName,
        description,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
        propertyId: metadata.propertyId || null,
        landlordId: metadata.landlordId || (user.role === 'landlord' ? user.userId : null),
        tenantId: metadata.tenantId || null,
        pmcId: metadata.pmcId || (user.role === 'pmc' ? user.userId : null),
      },
    });

    return activityLog;
  } catch (error) {
    console.error('[Activity Logger] Error logging create:', error);
    // Don't throw - logging failures shouldn't break the app
    return null;
  }
}

/**
 * Log a delete action
 * @param {Object} user - User object with userId, firstName, lastName, email, role
 * @param {string} entityType - Entity type (property, unit, tenant, etc.)
 * @param {string} entityId - Entity ID
 * @param {string} entityName - Entity name for display
 * @param {string} description - Description of the deletion
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Created activity log
 */
async function logDelete(user, entityType, entityId, entityName, description, metadata = {}) {
  try {
    const activityLog = await prisma.activityLog.create({
      data: {
        id: generateCUID(),
        userId: user.userId || user.id,
        userEmail: user.email,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        userRole: user.role,
        userType: user.userType || user.role,
        action: 'delete',
        entityType,
        entityId,
        entityName,
        description,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
        propertyId: metadata.propertyId || null,
        landlordId: metadata.landlordId || (user.role === 'landlord' ? user.userId : null),
        tenantId: metadata.tenantId || null,
        pmcId: metadata.pmcId || (user.role === 'pmc' ? user.userId : null),
      },
    });

    return activityLog;
  } catch (error) {
    console.error('[Activity Logger] Error logging delete:', error);
    // Don't throw - logging failures shouldn't break the app
    return null;
  }
}

// Export all functions for CommonJS require()
module.exports = {
  logPMCAction,
  getPropertyActivityLogs,
  getLandlordActivityLogs,
  getPMCActivityLogs,
  logUpdate,
  logCreate,
  logDelete,
};
