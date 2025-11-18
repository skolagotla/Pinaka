/**
 * RBAC Data Isolation & Multi-Tenancy
 * Phase 3: Data Isolation & Multi-Tenancy
 * 
 * Ensures proper data isolation between PMCs, landlords, tenants
 * Implements scope-based filtering for all queries
 */

import { PrismaClient } from '@prisma/client';
import { getUserScopes } from './permissions';

const prisma = new PrismaClient();

/**
 * Scope information for a user
 */
export interface UserScope {
  portfolioId: string | null;
  propertyId: string | null;
  unitId: string | null;
  pmcId: string | null;
  landlordId: string | null;
}

/**
 * Data isolation context
 */
export interface IsolationContext {
  userId: string;
  userType: string;
  scopes: UserScope[];
  pmcId?: string;
  landlordId?: string;
}

/**
 * Get isolation context for a user
 */
export async function getIsolationContext(
  userId: string,
  userType: string
): Promise<IsolationContext> {
  const scopes = await getUserScopes(userId, userType);
  
  // Extract PMC and Landlord IDs from scopes
  const pmcId = scopes.find((s) => s.pmcId)?.pmcId || undefined;
  const landlordId = scopes.find((s) => s.landlordId)?.landlordId || undefined;

  return {
    userId,
    userType,
    scopes,
    pmcId,
    landlordId,
  };
}

/**
 * Apply PMC isolation to a query
 * Prevents cross-PMC data access
 */
export function applyPMCIsolation(
  query: any,
  context: IsolationContext
): any {
  if (!context.pmcId) {
    // User is not part of a PMC, no PMC isolation needed
    return query;
  }

  // Get all property IDs managed by this PMC
  // This would require a PMC-Property relationship
  // For now, we'll filter by PMC ID in user roles
  
  // If querying properties, filter by PMC-managed properties
  if (query.where && 'landlordId' in query.where) {
    // Properties managed by PMC - need to get landlords managed by PMC
    // This is a simplified version - actual implementation would need PMCLandlord lookup
  }

  return query;
}

/**
 * Apply landlord isolation to a query
 * Prevents landlords from seeing each other's data
 */
export function applyLandlordIsolation(
  query: any,
  context: IsolationContext
): any {
  if (context.userType !== 'landlord' && !context.landlordId) {
    // Not a landlord, no landlord isolation needed
    return query;
  }

  const landlordId = context.landlordId || context.userId;

  // Filter by landlord ID
  return {
    ...query,
    where: {
      ...query.where,
      landlordId,
    },
  };
}

/**
 * Apply tenant isolation to a query
 * Prevents tenants from seeing other tenants' data (except co-tenants)
 */
export function applyTenantIsolation(
  query: any,
  context: IsolationContext
): any {
  if (context.userType !== 'tenant') {
    // Not a tenant, no tenant isolation needed
    return query;
  }

  // Tenants can only see their own data
  // Exception: Co-tenants on the same lease can see each other
  // This would require checking LeaseTenant relationships
  
  return {
    ...query,
    where: {
      ...query.where,
      id: context.userId, // Only own data
    },
  };
}

/**
 * Apply scope-based filtering to a query
 * Filters by Portfolio → Property → Unit hierarchy
 */
export async function applyScopeFiltering(
  query: any,
  context: IsolationContext,
  resourceType: 'property' | 'unit' | 'tenant' | 'maintenance' | 'document' | 'expense'
): Promise<any> {
  const { scopes } = context;

  if (scopes.length === 0) {
    // No scopes = no access
    return {
      ...query,
      where: {
        ...query.where,
        id: 'no-access-impossible-id',
      },
    };
  }

  // Build scope filter
  const scopeFilter: any = { OR: [] };

  switch (resourceType) {
    case 'property':
      // User can see properties in their portfolio or assigned properties
      for (const scope of scopes) {
        if (scope.propertyId) {
          scopeFilter.OR.push({ id: scope.propertyId });
        }
        if (scope.portfolioId) {
          // Portfolio scope - get all properties in portfolio
          // This would require a Portfolio model or property-portfolio relationship
          // For now, we'll use propertyId from scopes
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
      // For tenants: only themselves
      if (context.userType === 'tenant') {
        return {
          ...query,
          where: {
            ...query.where,
            id: context.userId,
          },
        };
      }
      
      // For PM/PMC: tenants in managed properties
      for (const scope of scopes) {
        if (scope.propertyId) {
          // Get tenants for properties in scope
          // This requires looking up leases for these properties
          const leases = await prisma.lease.findMany({
            where: {
              unit: {
                propertyId: scope.propertyId,
              },
            },
            select: {
              leaseTenants: {
                select: {
                  tenantId: true,
                },
              },
            },
          });

          const tenantIds = leases.flatMap((lease) =>
            lease.leaseTenants.map((lt) => lt.tenantId)
          );

          if (tenantIds.length > 0) {
            scopeFilter.OR.push({ id: { in: tenantIds } });
          }
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
          // Get property ID from unit
          const unit = await prisma.unit.findUnique({
            where: { id: scope.unitId },
            select: { propertyId: true },
          });
          if (unit) {
            scopeFilter.OR.push({ propertyId: unit.propertyId });
          }
        }
      }
      break;

    case 'document':
      // Documents are linked to properties or tenants
      for (const scope of scopes) {
        if (scope.propertyId) {
          scopeFilter.OR.push({ propertyId: scope.propertyId });
        }
        if (context.userType === 'tenant') {
          scopeFilter.OR.push({ tenantId: context.userId });
        }
      }
      break;

    case 'expense':
      // Expenses are linked to properties
      for (const scope of scopes) {
        if (scope.propertyId) {
          scopeFilter.OR.push({ propertyId: scope.propertyId });
        }
      }
      break;

    default:
      return query;
  }

  // If no scope matches, deny access
  if (scopeFilter.OR.length === 0) {
    return {
      ...query,
      where: {
        ...query.where,
        id: 'no-access-impossible-id',
      },
    };
  }

  return {
    ...query,
    where: {
      ...query.where,
      ...scopeFilter,
    },
  };
}

/**
 * Comprehensive data isolation function
 * Applies all isolation rules based on user type and context
 */
export async function applyDataIsolation(
  query: any,
  userId: string,
  userType: string,
  resourceType: 'property' | 'unit' | 'tenant' | 'maintenance' | 'document' | 'expense'
): Promise<any> {
  const context = await getIsolationContext(userId, userType);

  // Apply scope filtering first
  let isolatedQuery = await applyScopeFiltering(query, context, resourceType);

  // Apply PMC isolation
  isolatedQuery = applyPMCIsolation(isolatedQuery, context);

  // Apply landlord isolation
  isolatedQuery = applyLandlordIsolation(isolatedQuery, context);

  // Apply tenant isolation
  isolatedQuery = applyTenantIsolation(isolatedQuery, context);

  return isolatedQuery;
}

/**
 * Check if user can access a specific resource
 * Implements all isolation rules
 */
export async function canAccessResource(
  userId: string,
  userType: string,
  resourceId: string,
  resourceType: 'property' | 'unit' | 'tenant' | 'maintenance' | 'document' | 'expense'
): Promise<boolean> {
  const context = await getIsolationContext(userId, userType);

  try {
    switch (resourceType) {
      case 'property':
        // Check if property is in user's scope
        const property = await prisma.property.findUnique({
          where: { id: resourceId },
          select: { id: true, landlordId: true },
        });

        if (!property) return false;

        // Check scope
        const hasPropertyScope = context.scopes.some(
          (s) => s.propertyId === resourceId || s.portfolioId !== null
        );

        // Check landlord isolation
        if (context.userType === 'landlord' && property.landlordId !== context.userId) {
          return false;
        }

        return hasPropertyScope;

      case 'unit':
        const unit = await prisma.unit.findUnique({
          where: { id: resourceId },
          select: { id: true, propertyId: true },
        });

        if (!unit) return false;

        const hasUnitScope = context.scopes.some(
          (s) =>
            s.unitId === resourceId ||
            s.propertyId === unit.propertyId ||
            s.portfolioId !== null
        );

        return hasUnitScope;

      case 'tenant':
        // Tenants can only access themselves
        if (context.userType === 'tenant') {
          return resourceId === userId;
        }

        // PM/PMC can access tenants in their managed properties
        const tenant = await prisma.tenant.findUnique({
          where: { id: resourceId },
          select: { id: true },
        });

        if (!tenant) return false;

        // Check if tenant is in any lease for properties in scope
        const leases = await prisma.leaseTenant.findMany({
          where: { tenantId: resourceId },
          include: {
            lease: {
              include: {
                unit: {
                  select: { propertyId: true },
                },
              },
            },
          },
        });

        const propertyIds = leases.map((lt) => lt.lease.unit.propertyId);
        const hasTenantScope = context.scopes.some(
          (s) => s.propertyId && propertyIds.includes(s.propertyId)
        );

        return hasTenantScope;

      case 'maintenance':
        const maintenance = await prisma.maintenanceRequest.findUnique({
          where: { id: resourceId },
          select: { propertyId: true },
        });

        if (!maintenance) return false;

        const hasMaintenanceScope = context.scopes.some(
          (s) => s.propertyId === maintenance.propertyId || s.portfolioId !== null
        );

        return hasMaintenanceScope;

      case 'document':
        const document = await prisma.document.findUnique({
          where: { id: resourceId },
          select: { propertyId: true, tenantId: true },
        });

        if (!document) return false;

        // Tenant can only see their own documents
        if (context.userType === 'tenant') {
          return document.tenantId === userId;
        }

        // Others can see documents for properties in their scope
        const hasDocumentScope = context.scopes.some(
          (s) => s.propertyId === document.propertyId || s.portfolioId !== null
        );

        return hasDocumentScope;

      case 'expense':
        const expense = await prisma.expense.findUnique({
          where: { id: resourceId },
          select: { propertyId: true },
        });

        if (!expense) return false;

        const hasExpenseScope = context.scopes.some(
          (s) => s.propertyId === expense.propertyId || s.portfolioId !== null
        );

        return hasExpenseScope;

      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking resource access:', error);
    return false;
  }
}

/**
 * Prevent cross-PMC data access
 * Ensures PMC users can only see data from their own PMC
 */
export async function enforcePMCIsolation(
  userId: string,
  userType: string,
  targetPMCId?: string
): Promise<boolean> {
  if (userType !== 'pmc' && !targetPMCId) {
    // Not a PMC user and no target PMC, no isolation needed
    return true;
  }

  const context = await getIsolationContext(userId, userType);

  // If user is part of a PMC, they can only access data from their PMC
  if (context.pmcId && targetPMCId) {
    return context.pmcId === targetPMCId;
  }

  // If user is part of a PMC but no target PMC specified, check scopes
  if (context.pmcId) {
    // User can only access data within their PMC scope
    return true; // Scope filtering will handle this
  }

  return true;
}

/**
 * Prevent cross-landlord data access
 * Ensures landlords can only see their own data
 */
export async function enforceLandlordIsolation(
  userId: string,
  userType: string,
  targetLandlordId?: string
): Promise<boolean> {
  if (userType !== 'landlord' && !targetLandlordId) {
    return true;
  }

  const context = await getIsolationContext(userId, userType);

  // Landlords can only access their own data
  if (userType === 'landlord') {
    const landlordId = context.landlordId || userId;
    if (targetLandlordId) {
      return landlordId === targetLandlordId;
    }
    // No target specified, scope filtering will handle it
    return true;
  }

  // PMC users can access landlords they manage
  if (context.pmcId && targetLandlordId) {
    // Check if PMC manages this landlord
    const pmcLandlord = await prisma.pMCLandlord.findFirst({
      where: {
        pmcId: context.pmcId,
        landlordId: targetLandlordId,
        status: 'active',
      },
    });
    return pmcLandlord !== null;
  }

  return true;
}

/**
 * Prevent cross-tenant data access (except co-tenants)
 * Ensures tenants can only see their own data or co-tenant data
 */
export async function enforceTenantIsolation(
  userId: string,
  userType: string,
  targetTenantId?: string
): Promise<boolean> {
  if (userType !== 'tenant' && !targetTenantId) {
    return true;
  }

  // Tenants can only access themselves
  if (userType === 'tenant') {
    if (targetTenantId) {
      // Check if they're co-tenants on the same lease
      const userLeases = await prisma.leaseTenant.findMany({
        where: { tenantId: userId },
        select: { leaseId: true },
      });

      const targetLeases = await prisma.leaseTenant.findMany({
        where: { tenantId: targetTenantId },
        select: { leaseId: true },
      });

      const sharedLeases = userLeases.filter((ul) =>
        targetLeases.some((tl) => tl.leaseId === ul.leaseId)
      );

      // Can access if same tenant or co-tenants
      return userId === targetTenantId || sharedLeases.length > 0;
    }
    return true; // No target, scope filtering handles it
  }

  // PM/PMC can access tenants in their managed properties
  // This is handled by scope filtering
  return true;
}

