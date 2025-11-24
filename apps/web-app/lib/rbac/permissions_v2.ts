/**
 * RBAC Permission Checking Functions - V2 API Version
 * 
 * Migrated from Prisma to FastAPI v2 endpoints
 * Uses v2Api client for all permission checks
 */

import { v2Api } from '@/lib/api/v2-client';

// Type definitions (matching backend enums)
export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  SUBMIT = 'SUBMIT',
  VIEW = 'VIEW',
  MANAGE = 'MANAGE',
  ASSIGN = 'ASSIGN',
  EXPORT = 'EXPORT',
  SEND = 'SEND',
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
}

export enum ResourceCategory {
  PROPERTY_UNIT_MANAGEMENT = 'PROPERTY_UNIT_MANAGEMENT',
  TENANT_MANAGEMENT = 'TENANT_MANAGEMENT',
  LEASING_APPLICATIONS = 'LEASING_APPLICATIONS',
  RENT_PAYMENTS = 'RENT_PAYMENTS',
  ACCOUNTING = 'ACCOUNTING',
  REPORTING_OWNER_STATEMENTS = 'REPORTING_OWNER_STATEMENTS',
  MAINTENANCE = 'MAINTENANCE',
  VENDOR_MANAGEMENT = 'VENDOR_MANAGEMENT',
  COMMUNICATION_MESSAGING = 'COMMUNICATION_MESSAGING',
  DOCUMENT_MANAGEMENT = 'DOCUMENT_MANAGEMENT',
  MARKETING_LISTINGS = 'MARKETING_LISTINGS',
  TASK_WORKFLOW_MANAGEMENT = 'TASK_WORKFLOW_MANAGEMENT',
  USER_ROLE_MANAGEMENT = 'USER_ROLE_MANAGEMENT',
  PORTFOLIO_PROPERTY_ASSIGNMENT = 'PORTFOLIO_PROPERTY_ASSIGNMENT',
  SYSTEM_SETTINGS = 'SYSTEM_SETTINGS',
}

export interface Scope {
  portfolioId?: string;
  propertyId?: string;
  unitId?: string;
  pmcId?: string;
  landlordId?: string;
  organizationId?: string;
}

/**
 * Check if a user has a specific permission
 * Uses FastAPI v2 RBAC endpoint
 */
export async function hasPermission(
  userId: string,
  userType: string,
  resource: string,
  action: PermissionAction | string,
  category?: ResourceCategory | string,
  scope?: Scope
): Promise<boolean> {
  try {
    const actionStr = typeof action === 'string' ? action : String(action);
    const categoryStr = category ? (typeof category === 'string' ? category : String(category)) : undefined;
    
    const response = await v2Api.checkPermission(
      resource,
      actionStr,
      categoryStr,
      scope
    );
    return response.has_permission;
  } catch (error: any) {
    // If there's an error (e.g., endpoint not available, RBAC not initialized), return false
    // This allows the system to work even if RBAC isn't fully set up
    if (typeof window === 'undefined' && typeof process !== 'undefined' && (process as any).env && (process as any).env.NODE_ENV === 'development') {
      console.warn('Error checking permission (RBAC may not be initialized):', error.message);
    } else if (typeof window !== 'undefined' && (window as any).__DEV__) {
      console.warn('Error checking permission (RBAC may not be initialized):', error.message);
    }
    return false;
  }
}

/**
 * Get user scopes (portfolios, properties, units)
 * Uses FastAPI v2 RBAC endpoint
 */
export async function getUserScopes(
  userId: string,
  userType: string
): Promise<Scope[]> {
  try {
    const response = await v2Api.getUserScopes();
    return response.scopes.map(scope => ({
      portfolioId: scope.portfolio_id,
      propertyId: scope.property_id,
      unitId: scope.unit_id,
      organizationId: scope.organization_id,
    }));
  } catch (error: any) {
    console.error('Error getting user scopes:', error);
    return [];
  }
}

/**
 * Check if user can access a specific resource
 * Uses FastAPI v2 RBAC endpoint
 */
export async function canAccess(
  userId: string,
  userType: string,
  resourceId: string,
  resourceType: string
): Promise<boolean> {
  try {
    const response = await v2Api.checkResourceAccess(resourceId, resourceType);
    return response.has_access;
  } catch (error: any) {
    console.error('Error checking resource access:', error);
    return false;
  }
}

/**
 * Filter a query by user's scope
 * This is a simplified version - full implementation would require backend support
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
      // No scopes = no access (return empty result)
      return { ...query, where: { ...query.where, id: 'no-access' } };
    }

    // Build scope filter based on resource type
    const scopeFilter: any = { OR: [] };

    switch (resourceType) {
      case 'property':
        for (const scope of scopes) {
          if (scope.propertyId) {
            scopeFilter.OR.push({ id: scope.propertyId });
          }
          if (scope.organizationId) {
            scopeFilter.OR.push({ organization_id: scope.organizationId });
          }
        }
        break;

      case 'unit':
        for (const scope of scopes) {
          if (scope.unitId) {
            scopeFilter.OR.push({ id: scope.unitId });
          }
          if (scope.propertyId) {
            scopeFilter.OR.push({ property_id: scope.propertyId });
          }
        }
        break;

      case 'tenant':
        if (userType === 'tenant') {
          return { ...query, where: { ...query.where, id: userId } };
        }
        // For other users, filter by organization
        for (const scope of scopes) {
          if (scope.organizationId) {
            scopeFilter.OR.push({ organization_id: scope.organizationId });
          }
        }
        break;

      case 'maintenance':
      case 'work_orders':
        for (const scope of scopes) {
          if (scope.propertyId) {
            scopeFilter.OR.push({ property_id: scope.propertyId });
          }
          if (scope.organizationId) {
            scopeFilter.OR.push({ organization_id: scope.organizationId });
          }
        }
        break;

      default:
        // Default: filter by organization
        for (const scope of scopes) {
          if (scope.organizationId) {
            scopeFilter.OR.push({ organization_id: scope.organizationId });
          }
        }
    }

    if (scopeFilter.OR.length > 0) {
      return {
        ...query,
        where: {
          ...query.where,
          ...scopeFilter,
        },
      };
    }

    return query;
  } catch (error: any) {
    console.error('Error filtering by scope:', error);
    return query;
  }
}

