/**
 * RBAC Roles API
 * GET /api/rbac/roles - List all roles
 * POST /api/rbac/roles - Create a new role
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
// Auto-initialize RBAC on first API call
import '@/lib/rbac/autoInitialize';
// Note: hasPermission import removed for now - will use RBAC permissions after initialization
// import { hasPermission } from '@/lib/rbac';
// import { ResourceCategory, PermissionAction } from '@prisma/client';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method === 'GET') {
    try {
      // Allow admins and PMC users to view roles
      // This allows the UI to work even if RBAC isn't initialized yet
      // After initialization, you can add RBAC permission checks here
      if (user.role !== 'admin' && user.role !== 'pmc') {
        return res.status(403).json({ success: false, error: 'Only admins and PMC users can view roles' });
      }

      // Filter roles based on user type
      let roleFilter: any = {};
      
      if (user.role === 'admin') {
        // Admins see ALL roles (no filter)
        roleFilter = {};
      } else if (user.role === 'pmc') {
        // PMC users see only PMC-related roles and user roles (landlord, tenant, vendor)
        roleFilter = {
          name: {
            in: [
              // PMC roles
              'PMC_ADMIN', 
              'PROPERTY_MANAGER', 
              'LEASING_AGENT', 
              'MAINTENANCE_TECH', 
              'ACCOUNTANT',
              // User roles that PMC can assign
              'OWNER_LANDLORD',
              'TENANT',
              'VENDOR_SERVICE_PROVIDER'
            ]
          }
        };
      } else {
        // Other user types shouldn't access this endpoint
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const roles = await prisma.role.findMany({
        where: Object.keys(roleFilter).length > 0 ? roleFilter : undefined,
        include: {
          defaultPermissions: {
            select: {
              category: true,
              resource: true,
              action: true,
            },
          },
        },
        orderBy: {
          displayName: 'asc',
        },
      });

      return res.status(200).json({ success: true, data: roles });
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to fetch roles' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Allow admins and PMC users to create roles (for now, until RBAC is fully initialized)
      if (user.role !== 'admin' && user.role !== 'pmc') {
        return res.status(403).json({ success: false, error: 'Only admins and PMC users can create roles' });
      }

      const { name, displayName, description, isActive } = req.body;

      if (!name || !displayName) {
        return res.status(400).json({ success: false, error: 'name and displayName are required' });
      }

      // Verify user can only create roles for their allowed types
      if (user.role === 'admin') {
        // Admins can create any role (no restriction)
      } else if (user.role === 'pmc') {
        // PMC users can only create PMC roles and user roles
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
        if (!allowedPMCRoles.includes(name)) {
          return res.status(403).json({ success: false, error: 'Access denied: PMC users can only create PMC-related roles or user roles' });
        }
      }

      const role = await prisma.role.create({
        data: {
          name,
          displayName,
          description: description || null,
          isActive: isActive !== false,
          createdBy: user.userId,
          createdByType: user.role,
        },
        include: {
          defaultPermissions: true,
        },
      });

      return res.status(201).json({ success: true, data: role });
    } catch (error: any) {
      console.error('Error creating role:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to create role' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
});

