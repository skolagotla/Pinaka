/**
 * Get User RBAC Roles API
 * GET /api/rbac/users/[userId]/roles - Get all RBAC roles assigned to a user
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  const { userId } = req.query;
  const { userType } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ success: false, error: 'User ID is required' });
  }

  if (!userType || typeof userType !== 'string') {
    return res.status(400).json({ success: false, error: 'User type is required' });
  }

  if (req.method === 'GET') {
    try {
      // Only allow admins to view user roles
      if (user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Only admins can view user roles' });
      }

      // Debug: Check all roles for this user (regardless of userType or isActive)
      const allUserRoles = await prisma.userRole.findMany({
        where: { userId },
        include: {
          role: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
      });
      
      console.log('[GET /api/rbac/users/[userId]/roles] ALL roles for user (debug):', {
        userId,
        requestedUserType: userType,
        allRolesCount: allUserRoles.length,
        allRoles: allUserRoles.map(ur => ({
          id: ur.id,
          roleId: ur.roleId,
          roleName: ur.role.name,
          userType: ur.userType,
          isActive: ur.isActive,
          portfolioId: ur.portfolioId,
          propertyId: ur.propertyId,
          unitId: ur.unitId,
        })),
      });

      // Get user roles with details
      // Note: We don't filter by expiresAt in the where clause since it's optional
      const userRoles = await prisma.userRole.findMany({
        where: {
          userId,
          userType,
          isActive: true,
          // Only include roles that haven't expired (if expiresAt is set)
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } },
          ],
        },
        include: {
          role: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
        orderBy: {
          assignedAt: 'desc',
        },
      });
      
      console.log('[GET /api/rbac/users/[userId]/roles] Found user roles (filtered):', {
        userId,
        userType,
        count: userRoles.length,
        roles: userRoles.map(ur => ({ id: ur.id, roleId: ur.roleId, roleName: ur.role.name, isActive: ur.isActive })),
      });

      const roles = userRoles.map((ur) => ({
        id: ur.id, // UserRole ID - needed for deletion
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

      return res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (error: any) {
      console.error('Error fetching user roles:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to fetch user roles' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Only allow admins to assign roles
      if (user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Only admins can assign roles' });
      }

      const { roleId, scope, assignedBy, assignedByType } = req.body;

      if (!roleId) {
        return res.status(400).json({ success: false, error: 'Role ID is required' });
      }

      console.log('[POST /api/rbac/users/[userId]/roles] Assigning role:', {
        userId,
        userType,
        roleId,
        scope,
        assignedBy: assignedBy || user.userId,
      });

      // Import assignScope function
      const { assignScope } = require('@/lib/rbac/scopeManagement');

      // Assign the role with scope
      await assignScope(
        userId,
        userType,
        roleId,
        scope || {},
        assignedBy || user.userId
      );

      // Verify the role was created by querying it back
      const verifyRole = await prisma.userRole.findFirst({
        where: {
          userId,
          userType,
          roleId,
          isActive: true,
        },
      });

      console.log('[POST /api/rbac/users/[userId]/roles] Role assignment verified:', {
        found: !!verifyRole,
        userRoleId: verifyRole?.id,
        userId: verifyRole?.userId,
        userType: verifyRole?.userType,
        roleId: verifyRole?.roleId,
        isActive: verifyRole?.isActive,
      });

      return res.status(200).json({
        success: true,
        message: 'Role assigned successfully',
      });
    } catch (error: any) {
      console.error('[POST /api/rbac/users/[userId]/roles] Error assigning role:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to assign role' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Only allow admins to remove roles
      if (user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Only admins can remove roles' });
      }

      const { userRoleId, roleId } = req.body;

      // Prefer userRoleId (specific UserRole record ID) over roleId (which could match multiple records)
      if (!userRoleId && !roleId) {
        return res.status(400).json({ success: false, error: 'UserRole ID or Role ID is required' });
      }

      let updated;
      
      if (userRoleId) {
        // Deactivate specific UserRole record by ID
        // First verify it belongs to this user
        const userRole = await prisma.userRole.findFirst({
          where: {
            id: userRoleId,
            userId,
            userType,
            isActive: true,
          },
        });

        if (!userRole) {
          return res.status(404).json({ success: false, error: 'Role not found or already inactive' });
        }

        // Update the specific record
        await prisma.userRole.update({
          where: { id: userRoleId },
          data: {
            isActive: false,
          },
        });
        
        updated = { count: 1 };
      } else {
        // Fallback: Deactivate all UserRole records with this roleId for this user
        // This handles cases where userRoleId wasn't provided
        updated = await prisma.userRole.updateMany({
          where: {
            userId,
            userType,
            roleId,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });

        if (updated.count === 0) {
          return res.status(404).json({ success: false, error: 'Role not found or already inactive' });
        }
      }

      // Log role removal
      try {
        await prisma.rBACAuditLog.create({
          data: {
            userId: user.userId,
            userType: user.role,
            action: 'remove_role',
            resource: 'user_role',
            resourceId: userId,
            details: {
              removedUserRoleId: userRoleId,
              removedRoleId: roleId,
              removedBy: user.userId,
            },
          },
        });
      } catch (auditError) {
        // Don't fail if audit logging fails
        console.warn('Failed to log role removal:', auditError);
      }

      return res.status(200).json({
        success: true,
        message: 'Role removed successfully',
      });
    } catch (error: any) {
      console.error('Error removing role:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to remove role' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
});

