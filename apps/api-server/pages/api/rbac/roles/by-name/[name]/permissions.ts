/**
 * RBAC Role Permissions API (by role name)
 * GET /api/rbac/roles/by-name/[name]/permissions - Get permissions for a role by name
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { getRolePermissions } from '@/lib/rbac/permissionMatrix';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  const { name } = req.query;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ success: false, error: 'Role name is required' });
  }

  if (req.method === 'GET') {
    try {
      // Only require admin authentication (not RBAC permissions)
      // This allows the UI to work even if RBAC isn't initialized yet
      if (user.role !== 'admin' && user.role !== 'pmc') {
        return res.status(403).json({ success: false, error: 'Only admins and PMC users can view role permissions' });
      }

      // Get role by name
      const role = await prisma.role.findUnique({
        where: { name: name },
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
        where: { roleId: role.id },
        select: {
          category: true,
          resource: true,
          action: true,
        },
      });

      return res.status(200).json({
        success: true,
        data: permissions,
        dbPermissions,
        role: {
          id: role.id,
          name: role.name,
          displayName: role.displayName,
        },
      });
    } catch (error: any) {
      console.error('Error fetching role permissions:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to fetch role permissions' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
});

