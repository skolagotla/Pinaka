/**
 * RBAC API Integration Helper
 * Helper functions to integrate RBAC into existing API routes
 */

import { hasPermission, canAccess } from './permissions';
import { ResourceCategory, PermissionAction } from '@prisma/client';

/**
 * Check if user has permission for an action on a resource
 * Use this in existing API routes to add RBAC checks
 */
export async function checkRBACPermission(
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
  return await hasPermission(userId, userType, resource, action, category, scope);
}

/**
 * Check if user can access a specific resource
 * Use this to verify property/unit/tenant access
 */
export async function checkResourceAccess(
  userId: string,
  userType: string,
  resourceId: string,
  resourceType: 'property' | 'unit' | 'tenant' | 'lease' | 'maintenance' | 'document'
): Promise<boolean> {
  return await canAccess(userId, userType, resourceId, resourceType);
}

/**
 * Apply RBAC filtering to a Prisma query
 * Automatically filters based on user's scopes
 */
export async function applyRBACFilter(
  userId: string,
  userType: string,
  baseWhere: any,
  resourceType: 'property' | 'unit' | 'tenant' | 'lease' | 'maintenance'
): Promise<any> {
  // Get user scopes
  const { getUserScopes } = require('./permissions');
  const scopes = await getUserScopes(userId, userType);

  // Apply scope filtering
  if (scopes.length === 0) {
    // No scopes = no access (unless super admin)
    return { id: 'no-access' }; // This will return no results
  }

  // Build filter based on scopes
  const scopeFilters: any[] = [];

  for (const scope of scopes) {
    if (resourceType === 'property') {
      if (scope.propertyId) {
        scopeFilters.push({ id: scope.propertyId });
      } else if (scope.portfolioId) {
        // Portfolio scope - would need to get all properties in portfolio
        // For now, return baseWhere
      }
    } else if (resourceType === 'unit') {
      if (scope.unitId) {
        scopeFilters.push({ id: scope.unitId });
      } else if (scope.propertyId) {
        // Property scope - get all units in property
        scopeFilters.push({ propertyId: scope.propertyId });
      }
    }
    // Add more resource types as needed
  }

  if (scopeFilters.length > 0) {
    return {
      ...baseWhere,
      OR: scopeFilters,
    };
  }

  return baseWhere;
}

