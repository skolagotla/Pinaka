/**
 * RBAC Role API (Single)
 * GET /api/rbac/roles/[id] - Get role
 * PUT /api/rbac/roles/[id] - Update role
 * DELETE /api/rbac/roles/[id] - Delete role
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
// Note: hasPermission import removed for now - will use RBAC permissions after initialization
// import { hasPermission } from '@/lib/rbac';
// import { ResourceCategory, PermissionAction } from '@prisma/client';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Role ID is required' });
  }

  if (req.method === 'GET') {
    try {
      // Allow viewing roles even if RBAC isn't fully initialized (for UI)
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          defaultPermissions: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                },
              },
            },
          },
        },
      });

      if (!role) {
        return res.status(404).json({ success: false, error: 'Role not found' });
      }

      // Verify user has access to this role
      if (user.role === 'admin') {
        // Admins can view all roles (no restriction)
      } else if (user.role === 'pmc') {
        // PMC users can only view PMC roles and user roles
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
          return res.status(403).json({ success: false, error: 'Access denied: You can only view PMC-related roles or user roles' });
        }
      }

      return res.status(200).json({ success: true, data: role });
    } catch (error: any) {
      console.error('Error fetching role:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to fetch role' });
    }
  }

  if (req.method === 'PUT') {
    try {
      // Only allow admins to update roles (for now)
      if (user.role !== 'admin' && user.role !== 'pmc') {
        return res.status(403).json({ success: false, error: 'Only admins and PMC users can update roles' });
      }

      const { displayName, description, isActive } = req.body;

      // First verify user has access to this role
      const role = await prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        return res.status(404).json({ success: false, error: 'Role not found' });
      }

      // Verify user has access to update this role
      if (user.role === 'admin') {
        // Admins can update all roles (no restriction)
      } else if (user.role === 'pmc') {
        // PMC users can only update PMC roles and user roles
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
          return res.status(403).json({ success: false, error: 'Access denied: You can only update PMC-related roles or user roles' });
        }
      }

      const updatedRole = await prisma.role.update({
        where: { id },
        data: {
          ...(displayName && { displayName }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          defaultPermissions: true,
        },
      });

      return res.status(200).json({ success: true, data: updatedRole });
    } catch (error: any) {
      console.error('Error updating role:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to update role' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Only allow admins to delete roles (for now)
      if (user.role !== 'admin' && user.role !== 'pmc') {
        return res.status(403).json({ success: false, error: 'Only admins and PMC users can delete roles' });
      }

      // First verify user has access to this role
      const role = await prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        return res.status(404).json({ success: false, error: 'Role not found' });
      }

      // Verify user has access to delete this role
      if (user.role === 'admin') {
        // Admins can delete all roles (no restriction)
      } else if (user.role === 'pmc') {
        // PMC users can only delete PMC roles and user roles
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
          return res.status(403).json({ success: false, error: 'Access denied: You can only delete PMC-related roles or user roles' });
        }
      }

      // Check if role is in use
      const userRoles = await prisma.userRole.findFirst({
        where: { roleId: id, isActive: true },
      });

      if (userRoles) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete role that is assigned to users. Deactivate it instead.',
        });
      }

      await prisma.role.delete({
        where: { id },
      });

      return res.status(200).json({ success: true, message: 'Role deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting role:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to delete role' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
});

