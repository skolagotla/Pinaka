/**
 * RBAC Role Permissions API
 * GET /api/rbac/roles/[id]/permissions - Get permissions for a role
 * PUT /api/rbac/roles/[id]/permissions - Update permissions for a role
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { getRolePermissions } from '@/lib/rbac/permissionMatrix';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Role ID is required' });
  }

  if (req.method === 'GET') {
    try {
      // Only require admin authentication (not RBAC permissions)
      // This allows the UI to work even if RBAC isn't initialized yet
      if (user.role !== 'admin' && user.role !== 'pmc') {
        return res.status(403).json({ success: false, error: 'Only admins and PMC users can view role permissions' });
      }

      // Get role
      const role = await prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        return res.status(404).json({ success: false, error: 'Role not found' });
      }

      // Verify user has access to this role
      if (user.role === 'admin') {
        // Admins can view permissions for all roles (no restriction)
      } else if (user.role === 'pmc') {
        // PMC users can only view permissions for PMC roles and user roles
        const allowedPMCRoles = [
          'PMC_ADMIN', 
          'PROPERTY_MANAGER', 
          'LEASING_AGENT', 
          'MAINTENANCE_TECH', 
          'ACCOUNTANT',
          'OWNER_LANDLORD',
          'TENANT',
          'VENDOR_SERVICE_PROVIDER'
        ];
        if (!allowedPMCRoles.includes(role.name)) {
          return res.status(403).json({ success: false, error: 'Access denied: You can only view permissions for PMC-related roles or user roles' });
        }
      }

      // Get permissions using permission matrix
      const permissions = await getRolePermissions(role.name as any);

      // Also get permissions from database
      const dbPermissions = await prisma.rolePermission.findMany({
        where: { roleId: id },
        select: {
          id: true,
          category: true,
          resource: true,
          action: true,
        },
      });

      return res.status(200).json({
        success: true,
        data: permissions,
        dbPermissions,
      });
    } catch (error: any) {
      console.error('Error fetching role permissions:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to fetch role permissions' });
    }
  }

  if (req.method === 'PUT') {
    try {
      // Only allow admins to update permissions
      if (user.role !== 'admin' && user.role !== 'pmc') {
        return res.status(403).json({ success: false, error: 'Only admins and PMC users can update role permissions' });
      }

      // Get role
      const role = await prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        return res.status(404).json({ success: false, error: 'Role not found' });
      }

      // Verify user has access to this role
      if (user.role === 'admin') {
        // Admins can update permissions for all roles (no restriction)
      } else if (user.role === 'pmc') {
        // PMC users can only update permissions for PMC roles and user roles
        const allowedPMCRoles = [
          'PMC_ADMIN', 
          'PROPERTY_MANAGER', 
          'LEASING_AGENT', 
          'MAINTENANCE_TECH', 
          'ACCOUNTANT',
          'OWNER_LANDLORD',
          'TENANT',
          'VENDOR_SERVICE_PROVIDER'
        ];
        if (!allowedPMCRoles.includes(role.name)) {
          return res.status(403).json({ success: false, error: 'Access denied: You can only update permissions for PMC-related roles or user roles' });
        }
      }

      const { permissions: permissionsToUpdate } = req.body;

      if (!Array.isArray(permissionsToUpdate)) {
        return res.status(400).json({ success: false, error: 'Permissions must be an array' });
      }

      // Delete all existing permissions for this role
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Create new permissions
      const createdPermissions = await Promise.all(
        permissionsToUpdate.map((perm: any) =>
          prisma.rolePermission.create({
            data: {
              roleId: id,
              category: perm.category,
              resource: perm.resource,
              action: perm.action,
              conditions: perm.conditions || null,
            },
          })
        )
      );

      // Log the permission change
      try {
        const { logPermissionChange } = require('@/lib/rbac/auditLogging');
        await logPermissionChange(
          user.userId,
          user.role,
          id,
          role.name,
          'updated',
          {
            permissionsCount: createdPermissions.length,
            updatedBy: user.userId,
            updatedAt: new Date().toISOString(),
          }
        );
      } catch (auditError) {
        // Don't fail if audit logging fails
        console.warn('Failed to log permission change:', auditError);
      }

      return res.status(200).json({
        success: true,
        message: 'Permissions updated successfully',
        data: {
          roleId: id,
          permissionsCount: createdPermissions.length,
          permissions: createdPermissions,
        },
      });
    } catch (error: any) {
      console.error('Error updating role permissions:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to update role permissions' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
});
