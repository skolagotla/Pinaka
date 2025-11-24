/**
 * RBAC Edge Cases & Special Scenarios
 * Phase 9: Edge Cases & Special Scenarios
 * 
 * Handles:
 * - Multiple roles per user
 * - Role changes (immediate logout)
 * - Emergency access
 * - Property transfer
 */

import { PrismaClient } from '@prisma/client';
import { hasPermission, getUserScopes } from './permissions';
import { logRoleChange, logDataAccess } from './auditLogging';
import { ResourceCategory, PermissionAction } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handle multiple roles for a user
 * Returns union of all permissions from all roles
 */
export async function checkMultipleRoles(
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
  // Get all active roles for user
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId,
      userType,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
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

  // Check each role - if ANY role has permission, return true (union)
  for (const userRole of userRoles) {
    // Check custom permissions first (overrides)
    const customPermission = userRole.customPermissions.find(
      (p) =>
        p.category === category &&
        p.resource === resource &&
        p.action === action
    );

    if (customPermission) {
      if (customPermission.isGranted) {
        return true; // Granted by custom permission
      }
      // If explicitly denied, continue checking other roles
      continue;
    }

    // Check role's default permissions
    const rolePermission = userRole.role.defaultPermissions.find(
      (p) =>
        p.category === category &&
        p.resource === resource &&
        p.action === action
    );

    if (rolePermission) {
      // Check scope if needed
      if (scope) {
        // Verify scope matches
        const scopeMatches =
          (!scope.portfolioId || userRole.portfolioId === scope.portfolioId) &&
          (!scope.propertyId || userRole.propertyId === scope.propertyId) &&
          (!scope.unitId || userRole.unitId === scope.unitId) &&
          (!scope.pmcId || userRole.pmcId === scope.pmcId) &&
          (!scope.landlordId || userRole.landlordId === scope.landlordId);

        if (scopeMatches) {
          return true;
        }
      } else {
        // No scope required, permission granted
        return true;
      }
    }
  }

  return false; // No role has permission
}

/**
 * Change user role and trigger immediate logout
 * Phase 9.2: Role Changes
 */
export async function changeUserRole(
  targetUserId: string,
  targetUserType: string,
  oldRoleIds: string[],
  newRoleIds: string[],
  changedBy: string,
  changedByType: string,
  changedByEmail: string,
  changedByName: string,
  reason?: string
): Promise<void> {
  // Deactivate old roles
  await prisma.userRole.updateMany({
    where: {
      userId: targetUserId,
      userType: targetUserType,
      roleId: { in: oldRoleIds },
    },
    data: {
      isActive: false,
    },
  });

  // Activate new roles (they should already exist, just activate them)
  await prisma.userRole.updateMany({
    where: {
      userId: targetUserId,
      userType: targetUserType,
      roleId: { in: newRoleIds },
    },
    data: {
      isActive: true,
    },
  });

  // Log role change (triggers immediate logout)
  await logRoleChange(
    targetUserId,
    targetUserType,
    changedBy,
    changedByType,
    changedByEmail,
    changedByName,
    oldRoleIds,
    newRoleIds
  );

  // Invalidate all sessions for this user (trigger logout)
  // This would integrate with your session management system
  // For example, if using JWT, you'd add the user to a blacklist
  // If using sessions, you'd delete all sessions
  await invalidateUserSessions(targetUserId);
}

/**
 * Invalidate all user sessions (trigger logout)
 */
async function invalidateUserSessions(userId: string): Promise<void> {
  // This is a placeholder - implement based on your session management
  // Examples:
  // - Add to JWT blacklist
  // - Delete session records from database
  // - Send logout signal to all active devices
  
  console.log(`Invalidating all sessions for user ${userId}`);
  
  // Example: If using Prisma for sessions
  // await prisma.session.deleteMany({
  //   where: { userId }
  // });
}

/**
 * Grant emergency access
 * Phase 9.3: Emergency Access
 * Super Admin can grant temporary emergency permissions
 */
export async function grantEmergencyAccess(
  userId: string,
  userType: string,
  resource: string,
  action: PermissionAction,
  category: ResourceCategory,
  grantedBy: string,
  grantedByType: string,
  grantedByEmail: string,
  grantedByName: string,
  durationMinutes: number = 60,
  reason: string
): Promise<string> {
  // Verify grantor is Super Admin
  const canGrant = await hasPermission(
    grantedBy,
    grantedByType,
    'system',
    PermissionAction.MANAGE,
    ResourceCategory.SYSTEM_SETTINGS
  );

  if (!canGrant) {
    throw new Error('Only Super Admin can grant emergency access');
  }

  // Get user's role (or create temporary role assignment)
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      userType,
      isActive: true,
    },
  });

  if (!userRole) {
    throw new Error('User does not have an active role');
  }

  // Create temporary permission override
  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

  const emergencyPermission = await prisma.userPermission.create({
    data: {
      userRoleId: userRole.id,
      category,
      resource,
      action,
      isGranted: true,
      conditions: {
        emergency: true,
        grantedBy,
        reason,
        expiresAt: expiresAt.toISOString(),
      },
    },
  });

  // Log emergency access (different from regular access)
  await prisma.rBACAuditLog.create({
    data: {
      userId: grantedBy,
      userType: grantedByType,
      userEmail: grantedByEmail,
      userName: grantedByName,
      action: 'emergency_access_granted',
      resource: 'permission',
      resourceId: emergencyPermission.id,
      details: {
        targetUserId: userId,
        targetUserType: userType,
        resource,
        action,
        category,
        reason,
        expiresAt: expiresAt.toISOString(),
        durationMinutes,
      },
    },
  });

  return emergencyPermission.id;
}

/**
 * Handle property transfer
 * Phase 9.4: Property Transfer
 * When property moves from Landlord A to Landlord B
 */
export async function transferProperty(
  propertyId: string,
  fromLandlordId: string,
  toLandlordId: string,
  transferredBy: string,
  transferredByType: string,
  transferredByEmail: string,
  transferredByName: string,
  reason?: string
): Promise<void> {
  // Update property ownership
  await prisma.property.update({
    where: { id: propertyId },
    data: {
      landlordId: toLandlordId,
    },
  });

  // Update PM assignments (if any)
  // PMs assigned to this property should be notified
  const pmRoles = await prisma.userRole.findMany({
    where: {
      propertyId,
      role: {
        name: {
          in: ['PROPERTY_MANAGER', 'LEASING_AGENT'],
        },
      },
      isActive: true,
    },
  });

  // Update landlord context in user roles
  await prisma.userRole.updateMany({
    where: {
      propertyId,
      landlordId: fromLandlordId,
    },
    data: {
      landlordId: toLandlordId,
    },
  });

  // Log property transfer
  await prisma.rBACAuditLog.create({
    data: {
      userId: transferredBy,
      userType: transferredByType,
      userEmail: transferredByEmail,
      userName: transferredByName,
      action: 'property_transferred',
      resource: 'property',
      resourceId: propertyId,
      details: {
        fromLandlordId,
        toLandlordId,
        reason,
        affectedPMs: pmRoles.map((r) => r.userId),
      },
    },
  });

  // Notify affected PMs (implementation depends on your notification system)
  for (const pmRole of pmRoles) {
    // Send notification to PM about property transfer
    console.log(`Notifying PM ${pmRole.userId} about property transfer`);
  }
}

/**
 * Check if user has emergency access
 */
export async function hasEmergencyAccess(
  userId: string,
  userType: string,
  resource: string,
  action: PermissionAction,
  category: ResourceCategory
): Promise<boolean> {
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      userType,
      isActive: true,
    },
    include: {
      customPermissions: true,
    },
  });

  if (!userRole) return false;

  const emergencyPermission = userRole.customPermissions.find(
    (p) =>
      p.category === category &&
      p.resource === resource &&
      p.action === action &&
      (p.conditions as any)?.emergency === true
  );

  if (!emergencyPermission) return false;

  // Check if emergency access has expired
  const expiresAt = (emergencyPermission.conditions as any)?.expiresAt;
  if (expiresAt && new Date(expiresAt) < new Date()) {
    // Emergency access expired, remove it
    await prisma.userPermission.delete({
      where: { id: emergencyPermission.id },
    });
    return false;
  }

  return true;
}

/**
 * Get all active roles for a user (with details)
 */
export async function getUserActiveRoles(
  userId: string,
  userType: string
): Promise<any[]> {
  const userRoles = await prisma.userRole.findMany({
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
          description: true,
        },
      },
    },
    orderBy: {
      assignedAt: 'desc',
    },
  });

  return userRoles.map((ur) => ({
    id: ur.id,
    roleId: ur.roleId,
    roleName: ur.role.name,
    roleDisplayName: ur.role.displayName,
    portfolioId: ur.portfolioId,
    propertyId: ur.propertyId,
    unitId: ur.unitId,
    pmcId: ur.pmcId,
    landlordId: ur.landlordId,
    assignedAt: ur.assignedAt,
    expiresAt: ur.expiresAt,
  }));
}

