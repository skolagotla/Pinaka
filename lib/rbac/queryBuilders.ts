/**
 * RBAC Query Builders
 * Phase 3: Data Isolation & Multi-Tenancy
 * 
 * Prisma query builders that automatically apply data isolation
 */

import { PrismaClient } from '@prisma/client';
import {
  applyDataIsolation,
  canAccessResource,
  getIsolationContext,
} from './dataIsolation';

const prisma = new PrismaClient();

/**
 * RBAC-aware Prisma query builder
 * Automatically applies data isolation to all queries
 */
export class RBACQueryBuilder {
  private userId: string;
  private userType: string;

  constructor(userId: string, userType: string) {
    this.userId = userId;
    this.userType = userType;
  }

  /**
   * Query properties with automatic isolation
   */
  async findProperties(query: any = {}) {
    const isolatedQuery = await applyDataIsolation(
      query,
      this.userId,
      this.userType,
      'property'
    );

    return prisma.property.findMany(isolatedQuery);
  }

  /**
   * Find a single property with access check
   */
  async findProperty(id: string, query: any = {}) {
    const canAccess = await canAccessResource(
      this.userId,
      this.userType,
      id,
      'property'
    );

    if (!canAccess) {
      throw new Error('Access denied to this property');
    }

    return prisma.property.findUnique({
      ...query,
      where: { ...query.where, id },
    });
  }

  /**
   * Query units with automatic isolation
   */
  async findUnits(query: any = {}) {
    const isolatedQuery = await applyDataIsolation(
      query,
      this.userId,
      this.userType,
      'unit'
    );

    return prisma.unit.findMany(isolatedQuery);
  }

  /**
   * Find a single unit with access check
   */
  async findUnit(id: string, query: any = {}) {
    const canAccess = await canAccessResource(
      this.userId,
      this.userType,
      id,
      'unit'
    );

    if (!canAccess) {
      throw new Error('Access denied to this unit');
    }

    return prisma.unit.findUnique({
      ...query,
      where: { ...query.where, id },
    });
  }

  /**
   * Query tenants with automatic isolation
   */
  async findTenants(query: any = {}) {
    const isolatedQuery = await applyDataIsolation(
      query,
      this.userId,
      this.userType,
      'tenant'
    );

    return prisma.tenant.findMany(isolatedQuery);
  }

  /**
   * Find a single tenant with access check
   */
  async findTenant(id: string, query: any = {}) {
    const canAccess = await canAccessResource(
      this.userId,
      this.userType,
      id,
      'tenant'
    );

    if (!canAccess) {
      throw new Error('Access denied to this tenant');
    }

    return prisma.tenant.findUnique({
      ...query,
      where: { ...query.where, id },
    });
  }

  /**
   * Query maintenance requests with automatic isolation
   */
  async findMaintenanceRequests(query: any = {}) {
    const isolatedQuery = await applyDataIsolation(
      query,
      this.userId,
      this.userType,
      'maintenance'
    );

    return prisma.maintenanceRequest.findMany(isolatedQuery);
  }

  /**
   * Find a single maintenance request with access check
   */
  async findMaintenanceRequest(id: string, query: any = {}) {
    const canAccess = await canAccessResource(
      this.userId,
      this.userType,
      id,
      'maintenance'
    );

    if (!canAccess) {
      throw new Error('Access denied to this maintenance request');
    }

    return prisma.maintenanceRequest.findUnique({
      ...query,
      where: { ...query.where, id },
    });
  }

  /**
   * Query documents with automatic isolation
   */
  async findDocuments(query: any = {}) {
    const isolatedQuery = await applyDataIsolation(
      query,
      this.userId,
      this.userType,
      'document'
    );

    return prisma.document.findMany(isolatedQuery);
  }

  /**
   * Find a single document with access check
   */
  async findDocument(id: string, query: any = {}) {
    const canAccess = await canAccessResource(
      this.userId,
      this.userType,
      id,
      'document'
    );

    if (!canAccess) {
      throw new Error('Access denied to this document');
    }

    return prisma.document.findUnique({
      ...query,
      where: { ...query.where, id },
    });
  }

  /**
   * Query expenses with automatic isolation
   */
  async findExpenses(query: any = {}) {
    const isolatedQuery = await applyDataIsolation(
      query,
      this.userId,
      this.userType,
      'expense'
    );

    return prisma.expense.findMany(isolatedQuery);
  }

  /**
   * Find a single expense with access check
   */
  async findExpense(id: string, query: any = {}) {
    const canAccess = await canAccessResource(
      this.userId,
      this.userType,
      id,
      'expense'
    );

    if (!canAccess) {
      throw new Error('Access denied to this expense');
    }

    return prisma.expense.findUnique({
      ...query,
      where: { ...query.where, id },
    });
  }

  /**
   * Query leases with automatic isolation
   */
  async findLeases(query: any = {}) {
    const context = await getIsolationContext(this.userId, this.userType);

    // Build lease filter based on scope
    const leaseFilter: any = { OR: [] };

    for (const scope of context.scopes) {
      if (scope.propertyId) {
        // Get units for this property
        const units = await prisma.unit.findMany({
          where: { propertyId: scope.propertyId },
          select: { id: true },
        });

        if (units.length > 0) {
          leaseFilter.OR.push({
            unitId: { in: units.map((u) => u.id) },
          });
        }
      }
      if (scope.unitId) {
        leaseFilter.OR.push({ unitId: scope.unitId });
      }
    }

    // Tenant can only see their own leases
    if (this.userType === 'tenant') {
      const userLeases = await prisma.leaseTenant.findMany({
        where: { tenantId: this.userId },
        select: { leaseId: true },
      });

      leaseFilter.OR.push({
        id: { in: userLeases.map((ul) => ul.leaseId) },
      });
    }

    if (leaseFilter.OR.length === 0) {
      // No access
      return [];
    }

    return prisma.lease.findMany({
      ...query,
      where: {
        ...query.where,
        ...leaseFilter,
      },
    });
  }

  /**
   * Query rent payments with automatic isolation
   */
  async findRentPayments(query: any = {}) {
    // Rent payments are linked to leases
    const leases = await this.findLeases({ select: { id: true } });

    if (leases.length === 0) {
      return [];
    }

    return prisma.rentPayment.findMany({
      ...query,
      where: {
        ...query.where,
        leaseId: { in: leases.map((l) => l.id) },
      },
    });
  }
}

/**
 * Create an RBAC-aware query builder for a user
 */
export function createRBACQueryBuilder(userId: string, userType: string) {
  return new RBACQueryBuilder(userId, userType);
}

/**
 * Helper to get RBAC query builder from request
 * (Assumes you have a way to get user from request)
 */
export function getRBACQueryBuilder(req: any): RBACQueryBuilder {
  // TODO: Implement based on your auth system
  const user = getUserFromRequest(req);
  if (!user) {
    throw new Error('User not authenticated');
  }
  return createRBACQueryBuilder(user.userId, user.userType);
}

// Helper function (implement based on your auth system)
function getUserFromRequest(req: any): {
  userId: string;
  userType: string;
} | null {
  // Use existing authentication system (Auth0 via apiMiddleware)
  // The withAuth middleware sets req.user with UserContext
  const userContext = req.user;
  if (userContext) {
    return {
      userId: userContext.userId,
      userType: userContext.role, // Map role to userType
    };
  }
  
  // Fallback: Try to get from session
  try {
    const session = (req as any).session;
    if (session?.user) {
      return {
        userId: session.user.id || session.user.sub || session.user.email,
        userType: session.user.type || session.user.role || 'tenant',
      };
    }
  } catch (error) {
    // Session check failed
  }
  
  return null;
}

