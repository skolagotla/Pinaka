/**
 * RBAC Permission Checking Functions
 * Phase 2: Permission Checking Logic
 * 
 * Core functions for checking user permissions and access control
 */

import { PrismaClient, RBACRole, ResourceCategory, PermissionAction, ScopeType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Check if a user has a specific permission
 * @param userId - User ID
 * @param userType - User type ('admin', 'landlord', 'tenant', 'pmc', 'vendor')
 * @param resource - Resource name (e.g., 'properties', 'tenants', 'maintenance')
 * @param action - Permission action (e.g., 'CREATE', 'READ', 'UPDATE')
 * @param category - Resource category
 * @param scope - Optional scope context (portfolioId, propertyId, unitId)
 * @returns Promise<boolean> - True if user has permission
 */
export async function hasPermission(
  userId: string,
  userType: string,
  resource: string,
  action: PermissionAction,
  category: ResourceCategory,
  scope?: {
    portfolioId?: string;
    propertyId?: string;
    unitId?: string;
    pmcId?: string;
    landlordId?: string;
  }
): Promise<boolean> {
  try {
    // Get all active user roles for this user
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        userType,
        isActive: true,
        // Scope filtering
        ...(scope?.portfolioId ? { portfolioId: scope.portfolioId } : {}),
        ...(scope?.propertyId ? { propertyId: scope.propertyId } : {}),
        ...(scope?.unitId ? { unitId: scope.unitId } : {}),
        ...(scope?.pmcId ? { pmcId: scope.pmcId } : {}),
        ...(scope?.landlordId ? { landlordId: scope.landlordId } : {}),
      },
      include: {
        role: {
          include: {
            defaultPermissions: true,
          },
        },
        customPermissions: true,
      },
    });

    if (userRoles.length === 0) {
      return false;
    }

    // Check each role for permission
    for (const userRole of userRoles) {
      // First check custom permissions (overrides)
      const customPermission = userRole.customPermissions.find(
        (p) =>
          p.category === category &&
          p.resource === resource &&
          p.action === action
      );

      if (customPermission) {
        // Custom permission found - return its grant/deny status
        return customPermission.isGranted;
      }

      // Check role's default permissions
      const rolePermission = userRole.role.defaultPermissions.find(
        (p) =>
          p.category === category &&
          p.resource === resource &&
          p.action === action
      );

      if (rolePermission) {
        // Check conditions if any
        if (rolePermission.conditions) {
          const conditionsMet = await checkConditions(
            rolePermission.conditions,
            userId,
            userType,
            scope
          );
          if (conditionsMet) {
            return true;
          }
        } else {
          return true;
        }
      }
    }

    return false;
  } catch (error: any) {
    // If there's an error (e.g., tables don't exist, RBAC not initialized), return false
    // This allows the system to work even if RBAC isn't fully set up
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error checking permission (RBAC may not be initialized):', error.message);
    }
    return false;
  }
}

/**
 * Check if user can access a specific resource
 * @param userId - User ID
 * @param userType - User type
 * @param resourceId - ID of the resource
 * @param resourceType - Type of resource ('property', 'tenant', 'maintenance', etc.)
 * @returns Promise<boolean> - True if user can access
 */
export async function canAccess(
  userId: string,
  userType: string,
  resourceId: string,
  resourceType: string
): Promise<boolean> {
  try {
    // Get user's scopes
    const scopes = await getUserScopes(userId, userType);

    // Check if resource is within user's scope
    switch (resourceType) {
      case 'property':
        return scopes.some(
          (s) => s.propertyId === resourceId || s.portfolioId !== null
        );
      case 'unit':
        return scopes.some(
          (s) =>
            s.unitId === resourceId ||
            s.propertyId !== null ||
            s.portfolioId !== null
        );
      case 'tenant':
        // Tenants can only access their own data
        if (userType === 'tenant') {
          return userId === resourceId;
        }
        // PM/PMC can access tenants in their managed properties
        return scopes.length > 0;
      case 'maintenance':
        // Check if maintenance request is for a property/unit in user's scope
        const maintenance = await prisma.maintenanceRequest.findUnique({
          where: { id: resourceId },
          select: { propertyId: true },
        });
        if (maintenance) {
          return scopes.some(
            (s) =>
              s.propertyId === maintenance.propertyId ||
              s.portfolioId !== null
          );
        }
        return false;
      default:
        // For other resources, check if user has any scope
        return scopes.length > 0;
    }
  } catch (error) {
    console.error('Error checking access:', error);
    return false;
  }
}

/**
 * Get all scopes for a user
 * @param userId - User ID
 * @param userType - User type
 * @returns Promise<Array> - Array of user scopes
 */
export async function getUserScopes(
  userId: string,
  userType: string
): Promise<
  Array<{
    portfolioId: string | null;
    propertyId: string | null;
    unitId: string | null;
    pmcId: string | null;
    landlordId: string | null;
  }>
> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        userType,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      select: {
        portfolioId: true,
        propertyId: true,
        unitId: true,
        pmcId: true,
        landlordId: true,
      },
      distinct: ['portfolioId', 'propertyId', 'unitId', 'pmcId', 'landlordId'],
    });

    return userRoles;
  } catch (error) {
    console.error('Error getting user scopes:', error);
    return [];
  }
}

/**
 * Filter a Prisma query by user's scope
 * @param query - Prisma query object
 * @param userId - User ID
 * @param userType - User type
 * @param resourceType - Type of resource being queried
 * @returns Promise<object> - Filtered query with scope conditions
 */
export async function filterByScope(
  query: any,
  userId: string,
  userType: string,
  resourceType: string
): Promise<any> {
  try {
    const scopes = await getUserScopes(userId, userType);

    if (scopes.length === 0) {
      // No scopes = no access
      return { ...query, where: { ...query.where, id: 'no-access' } };
    }

    // Build scope filter based on resource type
    const scopeFilter: any = { OR: [] };

    switch (resourceType) {
      case 'property':
        // User can see properties in their portfolio or assigned properties
        for (const scope of scopes) {
          if (scope.portfolioId) {
            // Portfolio scope - need to get all properties in portfolio
            // This would require a Portfolio model or property-portfolio relationship
            scopeFilter.OR.push({ id: { in: [] } }); // Placeholder
          }
          if (scope.propertyId) {
            scopeFilter.OR.push({ id: scope.propertyId });
          }
        }
        break;

      case 'unit':
        // User can see units in their assigned properties or portfolios
        for (const scope of scopes) {
          if (scope.unitId) {
            scopeFilter.OR.push({ id: scope.unitId });
          }
          if (scope.propertyId) {
            scopeFilter.OR.push({ propertyId: scope.propertyId });
          }
        }
        break;

      case 'tenant':
        // Tenants can only see themselves
        if (userType === 'tenant') {
          return { ...query, where: { ...query.where, id: userId } };
        }
        // PM/PMC can see tenants in their managed properties
        for (const scope of scopes) {
          if (scope.propertyId) {
            // Get tenants for properties in scope
            scopeFilter.OR.push({ id: { in: [] } }); // Placeholder - would need lease lookup
          }
        }
        break;

      case 'maintenance':
        // User can see maintenance requests for properties in their scope
        for (const scope of scopes) {
          if (scope.propertyId) {
            scopeFilter.OR.push({ propertyId: scope.propertyId });
          }
          if (scope.unitId) {
            // Maintenance requests are property-level, but we can filter by property
            scopeFilter.OR.push({ propertyId: { in: [] } }); // Placeholder
          }
        }
        break;

      default:
        // For other resources, apply basic scope filtering
        return query;
    }

    return {
      ...query,
      where: {
        ...query.where,
        ...scopeFilter,
      },
    };
  } catch (error) {
    console.error('Error filtering by scope:', error);
    return query;
  }
}

/**
 * Check permission conditions
 * @param conditions - JSON conditions object
 * @param userId - User ID
 * @param userType - User type
 * @param scope - Scope context
 * @returns Promise<boolean> - True if conditions are met
 */
async function checkConditions(
  conditions: any,
  userId: string,
  userType: string,
  scope?: {
    portfolioId?: string;
    propertyId?: string;
    unitId?: string;
    pmcId?: string;
    landlordId?: string;
  }
): Promise<boolean> {
  // Example conditions:
  // { "onlyOwnRegion": true }
  // { "minRole": "PROPERTY_MANAGER" }
  // { "scopeRestriction": "property" }

  if (!conditions || typeof conditions !== 'object') {
    return true; // No conditions = always allowed
  }

  // Check scope restrictions
  if (conditions.scopeRestriction) {
    switch (conditions.scopeRestriction) {
      case 'portfolio':
        return scope?.portfolioId !== null && scope?.portfolioId !== undefined;
      case 'property':
        return scope?.propertyId !== null && scope?.propertyId !== undefined;
      case 'unit':
        return scope?.unitId !== null && scope?.unitId !== undefined;
      default:
        return true;
    }
  }

  // Check role restrictions
  if (conditions.minRole) {
    // Would need to check user's role hierarchy
    // This is a simplified version
    return true; // Placeholder
  }

  // Check PMC restrictions
  if (conditions.onlyOwnPMC && scope?.pmcId) {
    // User must be in the same PMC
    const userRoles = await prisma.userRole.findFirst({
      where: {
        userId,
        userType,
        pmcId: scope.pmcId,
        isActive: true,
      },
    });
    return userRoles !== null;
  }

  // Default: conditions met
  return true;
}

/**
 * Log permission check to audit log
 * @param userId - User ID
 * @param userType - User type
 * @param action - Action attempted
 * @param resource - Resource accessed
 * @param resourceId - Resource ID
 * @param allowed - Whether access was allowed
 */
export async function logPermissionCheck(
  userId: string,
  userType: string,
  action: string,
  resource: string,
  resourceId: string,
  allowed: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    // Get user info
    let userEmail = '';
    let userName = '';

    // This would need to be implemented based on user type
    // For now, we'll log what we have

    await prisma.rBACAuditLog.create({
      data: {
        userId,
        userType,
        userEmail,
        userName,
        action: `permission_check_${action}`,
        resource,
        resourceId,
        details: {
          allowed,
          timestamp: new Date().toISOString(),
        },
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Error logging permission check:', error);
    // Don't throw - logging failures shouldn't break the app
  }
}

