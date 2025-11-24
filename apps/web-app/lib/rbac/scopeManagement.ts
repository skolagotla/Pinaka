/**
 * RBAC Scope Management
 * Phase 3: Data Isolation & Multi-Tenancy
 * 
 * Utilities for managing user scopes (Portfolio → Property → Unit)
 */

import { RBACRole } from '@prisma/client';
import { logPermissionCheck } from './permissions';

// Use shared Prisma instance instead of creating a new one
// Only import on server-side to avoid bundling fs module in client
let prisma: any;
function getPrisma() {
  if (typeof window === 'undefined') {
    // Server-side only
    if (!prisma) {
      const prismaModule = require('../prisma');
      prisma = prismaModule.prisma || prismaModule.default?.prisma || prismaModule;
    }
    return prisma;
  }
  throw new Error('assignScope can only be called server-side');
}

/**
 * Assign a scope to a user role
 */
export async function assignScope(
  userId: string,
  userType: string,
  roleId: string,
  scope: {
    portfolioId?: string;
    propertyId?: string;
    unitId?: string;
    pmcId?: string;
    landlordId?: string;
  },
  assignedBy: string
): Promise<void> {
  // Validate scope hierarchy
  if (scope.unitId && !scope.propertyId) {
    throw new Error('Unit scope requires property scope');
  }
  if (scope.propertyId && !scope.portfolioId) {
    // Portfolio is optional, but if property is set, we might want portfolio
    // This is flexible based on your requirements
  }

  // Check if role already exists
  // For roles without portfolio/property/unit scopes, we need to check by roleId and userId only
  // For roles with scopes, we need to match the exact scope
  const whereClause: any = {
    userId,
    roleId,
    isActive: true, // Only check active roles
  };
  
  // If scope has portfolio/property/unit, include them in the check
  if (scope.portfolioId || scope.propertyId || scope.unitId) {
    whereClause.portfolioId = scope.portfolioId || null;
    whereClause.propertyId = scope.propertyId || null;
    whereClause.unitId = scope.unitId || null;
  } else {
    // For roles without portfolio/property/unit scopes (like SUPER_ADMIN),
    // check if there's already an active role with this roleId for this user
    // regardless of pmcId/landlordId (those can be updated)
    whereClause.portfolioId = null;
    whereClause.propertyId = null;
    whereClause.unitId = null;
  }
  
  const prismaClient = getPrisma();
  const existingRole = await prismaClient.userRole.findFirst({
    where: whereClause,
  });

  if (existingRole) {
    // Update existing role (including pmcId and landlordId if provided)
    await prismaClient.userRole.update({
      where: { id: existingRole.id },
      data: {
        isActive: true,
        assignedBy,
        assignedAt: new Date(),
        // Update pmcId and landlordId if provided in scope
        ...(scope.pmcId !== undefined && { pmcId: scope.pmcId || null }),
        ...(scope.landlordId !== undefined && { landlordId: scope.landlordId || null }),
      },
    });
    console.log('[assignScope] Updated existing role:', existingRole.id, 'for user:', userId);
  } else {
    // Create new role
    const newUserRole = await prismaClient.userRole.create({
      data: {
        userId,
        userType,
        roleId,
        portfolioId: scope.portfolioId || null,
        propertyId: scope.propertyId || null,
        unitId: scope.unitId || null,
        pmcId: scope.pmcId || null,
        landlordId: scope.landlordId || null,
        isActive: true,
        assignedBy,
      },
    });
    console.log('[assignScope] Created new role:', {
      userRoleId: newUserRole.id,
      userId,
      userType,
      roleId,
      pmcId: scope.pmcId || null,
      landlordId: scope.landlordId || null,
    });
  }

  // Log scope assignment (don't fail if audit logging fails)
  try {
    await prismaClient.rBACAuditLog.create({
      data: {
        userId: assignedBy,
        userType: 'admin', // Or get from context
        action: 'assign_scope',
        resource: 'user_role',
        resourceId: userId,
        details: {
          scope,
          roleId,
        },
      },
    });
  } catch (auditError) {
    // Don't fail the role assignment if audit logging fails
    console.warn('[assignScope] Failed to log audit entry:', auditError?.message);
  }
}

/**
 * Remove a scope from a user role
 */
export async function removeScope(
  userId: string,
  roleId: string,
  scope: {
    portfolioId?: string;
    propertyId?: string;
    unitId?: string;
  },
  removedBy: string
): Promise<void> {
  const prismaClient = getPrisma();
  await prismaClient.userRole.updateMany({
    where: {
      userId,
      roleId,
      portfolioId: scope.portfolioId || null,
      propertyId: scope.propertyId || null,
      unitId: scope.unitId || null,
    },
    data: {
      isActive: false,
    },
  });

  // Log scope removal
  await prismaClient.rBACAuditLog.create({
    data: {
      userId: removedBy,
      userType: 'admin',
      action: 'remove_scope',
      resource: 'user_role',
      resourceId: userId,
      details: {
        scope,
        roleId,
      },
    },
  });
}

/**
 * Assign property to PM
 * PMC Admin can assign properties to Property Managers
 */
export async function assignPropertyToPM(
  propertyId: string,
  pmUserId: string,
  pmcId: string,
  assignedBy: string
): Promise<void> {
  // Get PROPERTY_MANAGER role
  const prismaClient = getPrisma();
  const pmRole = await prismaClient.role.findUnique({
    where: { name: RBACRole.PROPERTY_MANAGER },
  });

  if (!pmRole) {
    throw new Error('Property Manager role not found');
  }

  // Get property to find portfolio
  const property = await prismaClient.property.findUnique({
    where: { id: propertyId },
    select: { id: true, landlordId: true },
  });

  if (!property) {
    throw new Error('Property not found');
  }

  // Assign scope with property
  await assignScope(
    pmUserId,
    'pmc',
    pmRole.id,
    {
      propertyId,
      pmcId,
      landlordId: property.landlordId,
    },
    assignedBy
  );
}

/**
 * Assign unit to Leasing Agent
 * PMC Admin or PM can assign units to Leasing Agents
 */
export async function assignUnitToLeasingAgent(
  unitId: string,
  leasingAgentUserId: string,
  pmcId: string,
  assignedBy: string
): Promise<void> {
  // Get LEASING_AGENT role
  const prismaClient = getPrisma();
  const leasingRole = await prismaClient.role.findUnique({
    where: { name: RBACRole.LEASING_AGENT },
  });

  if (!leasingRole) {
    throw new Error('Leasing Agent role not found');
  }

  // Get unit to find property
  const unit = await prismaClient.unit.findUnique({
    where: { id: unitId },
    select: { id: true, propertyId: true },
  });

  if (!unit) {
    throw new Error('Unit not found');
  }

  // Get property to find landlord
  const property = await prismaClient.property.findUnique({
    where: { id: unit.propertyId },
    select: { landlordId: true },
  });

  // Assign scope with unit
  await assignScope(
    leasingAgentUserId,
    'pmc',
    leasingRole.id,
    {
      propertyId: unit.propertyId,
      unitId,
      pmcId,
      landlordId: property?.landlordId,
    },
    assignedBy
  );
}

/**
 * Assign property/unit to Maintenance Tech
 * PMC Admin or PM can assign Maintenance Techs to properties/units
 */
export async function assignToMaintenanceTech(
  maintenanceTechUserId: string,
  scope: {
    propertyId?: string;
    unitId?: string;
  },
  pmcId: string,
  assignedBy: string
): Promise<void> {
  // Get MAINTENANCE_TECH role
  const prismaClient = getPrisma();
  const techRole = await prismaClient.role.findUnique({
    where: { name: RBACRole.MAINTENANCE_TECH },
  });

  if (!techRole) {
    throw new Error('Maintenance Tech role not found');
  }

  // Get landlord ID if property is specified
  let landlordId: string | undefined;
  if (scope.propertyId) {
    const property = await prismaClient.property.findUnique({
      where: { id: scope.propertyId },
      select: { landlordId: true },
    });
    landlordId = property?.landlordId;
  }

  // Assign scope
  await assignScope(
    maintenanceTechUserId,
    'pmc',
    techRole.id,
    {
      ...scope,
      pmcId,
      landlordId,
    },
    assignedBy
  );
}

/**
 * Create portfolio and assign properties to it
 * PMC Admin can create portfolios and assign properties
 */
export async function createPortfolioAndAssignProperties(
  portfolioName: string,
  propertyIds: string[],
  pmcId: string,
  createdBy: string
): Promise<string> {
  // Create portfolio scope
  const prismaClient = getPrisma();
  const portfolioScope = await prismaClient.scope.create({
    data: {
      type: 'PORTFOLIO',
      name: portfolioName,
      pmcId,
      isActive: true,
    },
  });

  // Create property scopes and link to portfolio
  for (const propertyId of propertyIds) {
    await prismaClient.scope.upsert({
      where: {
        // Would need a unique constraint
        id: propertyId, // This is a placeholder
      },
      update: {
        parentId: portfolioScope.id,
      },
      create: {
        type: 'PROPERTY',
        name: `Property ${propertyId}`,
        propertyId,
        parentId: portfolioScope.id,
        pmcId,
        isActive: true,
      },
    });
  }

  // Log portfolio creation
  await prismaClient.rBACAuditLog.create({
    data: {
      userId: createdBy,
      userType: 'admin',
      action: 'create_portfolio',
      resource: 'portfolio',
      resourceId: portfolioScope.id,
      details: {
        portfolioName,
        propertyIds,
      },
    },
  });

  return portfolioScope.id;
}

/**
 * Get all scopes for a user with details
 */
export async function getUserScopesWithDetails(
  userId: string,
  userType: string
) {
  const prismaClient = getPrisma();
  const userRoles = await prismaClient.userRole.findMany({
    where: {
      userId,
      userType,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
    include: {
      role: {
        select: {
          name: true,
          displayName: true,
        },
      },
    },
  });

  return userRoles.map((ur) => ({
    role: ur.role.displayName,
    portfolioId: ur.portfolioId,
    propertyId: ur.propertyId,
    unitId: ur.unitId,
    pmcId: ur.pmcId,
    landlordId: ur.landlordId,
    assignedAt: ur.assignedAt,
    expiresAt: ur.expiresAt,
  }));
}

/**
 * Check if user has access to a specific scope
 */
export async function hasScopeAccess(
  userId: string,
  userType: string,
  scope: {
    portfolioId?: string;
    propertyId?: string;
    unitId?: string;
  }
): Promise<boolean> {
  const prismaClient = getPrisma();
  const userRoles = await prismaClient.userRole.findMany({
    where: {
      userId,
      userType,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      ...(scope.portfolioId && { portfolioId: scope.portfolioId }),
      ...(scope.propertyId && { propertyId: scope.propertyId }),
      ...(scope.unitId && { unitId: scope.unitId }),
    },
  });

  return userRoles.length > 0;
}

