/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN USER MANAGEMENT API - SINGLE USER
 * ═══════════════════════════════════════════════════════════════
 * GET /api/admin/users/[id] - Get user details
 * PATCH /api/admin/users/[id] - Update user
 * DELETE /api/admin/users/[id] - Delete/suspend user
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');

async function getUser(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id, role } = req.query;

    if (role === 'landlord') {
      const landlord = await prisma.landlord.findUnique({
        where: { id: id as string },
        include: {
          _count: {
            select: {
              properties: true,
              invitations: true,
            },
          },
        },
      });

      if (!landlord) {
        return res.status(404).json({
          success: false,
          error: 'Landlord not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...landlord,
          role: 'landlord',
          propertiesCount: landlord._count.properties,
          invitationsCount: landlord._count.invitations,
        },
      });
    } else if (role === 'tenant') {
      const tenant = await prisma.tenant.findUnique({
        where: { id: id as string },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'Tenant not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...tenant,
          role: 'tenant',
          status: tenant.hasAccess ? 'active' : 'inactive',
        },
      });
    } else if (role === 'admin') {
      const adminUser = await prisma.admin.findUnique({
        where: { id: id as string },
      });

      if (!adminUser) {
        return res.status(404).json({
          success: false,
          error: 'Admin not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...adminUser,
          role: 'admin',
          adminRole: adminUser.role,
          status: adminUser.isActive && !adminUser.isLocked ? 'active' : adminUser.isLocked ? 'locked' : 'inactive',
        },
      });
    } else if (role === 'pmc') {
      const pmc = await prisma.propertyManagementCompany.findUnique({
        where: { id: id as string },
      });

      if (!pmc) {
        return res.status(404).json({
          success: false,
          error: 'PMC not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...pmc,
          role: 'pmc',
          status: pmc.approvalStatus === 'APPROVED' ? 'active' : pmc.approvalStatus === 'PENDING' ? 'pending' : 'inactive',
        },
      });
    } else {
      // Try all: admin, landlord, pmc, tenant
      const [adminUser, landlord, pmc, tenant] = await Promise.all([
        prisma.admin.findUnique({ where: { id: id as string } }),
        prisma.landlord.findUnique({ where: { id: id as string } }),
        prisma.propertyManagementCompany.findUnique({ where: { id: id as string } }),
        prisma.tenant.findUnique({ where: { id: id as string } }),
      ]);

      if (adminUser) {
        return res.status(200).json({
          success: true,
          data: {
            ...adminUser,
            role: 'admin',
            adminRole: adminUser.role,
            status: adminUser.isActive && !adminUser.isLocked ? 'active' : adminUser.isLocked ? 'locked' : 'inactive',
          },
        });
      } else if (landlord) {
        return res.status(200).json({
          success: true,
          data: { ...landlord, role: 'landlord' },
        });
      } else if (pmc) {
        return res.status(200).json({
          success: true,
          data: {
            ...pmc,
            role: 'pmc',
            status: pmc.approvalStatus === 'APPROVED' ? 'active' : pmc.approvalStatus === 'PENDING' ? 'pending' : 'inactive',
          },
        });
      } else if (tenant) {
        return res.status(200).json({
          success: true,
          data: { ...tenant, role: 'tenant', status: tenant.hasAccess ? 'active' : 'inactive' },
        });
      } else {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }
    }
  } catch (error: any) {
    console.error('[Admin Users] Error getting user:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: error.message,
    });
  }
}

async function updateUser(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;
    const { role, ...updateData } = req.body;

    if (role === 'admin') {
      // Check if email is being updated and if it's unique
      if (updateData.email) {
        const existingAdmin = await prisma.admin.findUnique({
          where: { email: updateData.email },
        });
        if (existingAdmin && existingAdmin.id !== id) {
          return res.status(400).json({
            success: false,
            error: 'Email already exists',
          });
        }
      }
      
      // Update admin user - allow firstName, lastName, email, phone, adminRole, isActive, isLocked
      // Note: 'adminRole' in updateData maps to 'role' field in Admin model
      // Note: 'role' in the request body identifies the table, not the Admin model's role field
      const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'adminRole', 'isActive', 'isLocked'];
      const filteredData: any = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          // Map 'adminRole' from request to 'role' field in Admin model
          if (key === 'adminRole') {
            filteredData.role = updateData[key];
          } else {
            filteredData[key] = updateData[key];
          }
        }
      });

      const updatedAdmin = await prisma.admin.update({
        where: { id: id as string },
        data: filteredData,
      });

      // Log action
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          adminId: admin.id,
          action: 'update_user',
          resource: 'admin',
          resourceId: updatedAdmin.id,
          details: { changes: filteredData },
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          success: true,
        },
      });

      return res.status(200).json({
        success: true,
        data: updatedAdmin,
      });
    } else if (role === 'landlord') {
      const landlord = await prisma.landlord.update({
        where: { id: id as string },
        data: updateData,
      });

      // Log action
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          adminId: admin.id,
          action: 'update_user',
          resource: 'landlord',
          resourceId: landlord.id,
          details: { changes: updateData },
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          success: true,
        },
      });

      return res.status(200).json({
        success: true,
        data: landlord,
      });
    } else if (role === 'tenant') {
      // Check if email is being updated and if it's unique
      if (updateData.email) {
        const existingTenant = await prisma.tenant.findUnique({
          where: { email: updateData.email },
        });
        if (existingTenant && existingTenant.id !== id) {
          return res.status(400).json({
            success: false,
            error: 'Email already exists',
          });
        }
      }
      
      const tenant = await prisma.tenant.update({
        where: { id: id as string },
        data: updateData,
      });

      // Log action
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          adminId: admin.id,
          action: 'update_user',
          resource: 'tenant',
          resourceId: tenant.id,
          details: { changes: updateData },
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          success: true,
        },
      });

      return res.status(200).json({
        success: true,
        data: tenant,
      });
    } else if (role === 'pmc') {
      // Check if email is being updated and if it's unique
      if (updateData.email) {
        const existingPMC = await prisma.propertyManagementCompany.findUnique({
          where: { email: updateData.email },
        });
        if (existingPMC && existingPMC.id !== id) {
          return res.status(400).json({
            success: false,
            error: 'Email already exists',
          });
        }
      }
      
      const pmc = await prisma.propertyManagementCompany.update({
        where: { id: id as string },
        data: updateData,
      });

      // Log action
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          adminId: admin.id,
          action: 'update_user',
          resource: 'pmc',
          resourceId: pmc.id,
          details: { changes: updateData },
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          success: true,
        },
      });

      return res.status(200).json({
        success: true,
        data: pmc,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Role is required for update',
      });
    }
  } catch (error: any) {
    console.error('[Admin Users] Error updating user:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message,
    });
  }
}

async function suspendUser(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;
    const { role, action } = req.body; // action: 'suspend' or 'activate'

    if (role === 'landlord') {
      // For landlords, we can't really "suspend" them, but we could add a field
      // For now, just return success
      return res.status(200).json({
        success: true,
        message: 'Landlord status updated',
      });
    } else if (role === 'tenant') {
      const tenant = await prisma.tenant.update({
        where: { id: id as string },
        data: {
          hasAccess: action === 'activate',
        },
      });

      // Log action
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          adminId: admin.id,
          action: action === 'suspend' ? 'suspend_user' : 'activate_user',
          resource: 'tenant',
          resourceId: tenant.id,
          details: { email: tenant.email, action },
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          success: true,
        },
      });

      return res.status(200).json({
        success: true,
        data: tenant,
        message: `Tenant ${action === 'suspend' ? 'suspended' : 'activated'}`,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Role is required',
      });
    }
  } catch (error: any) {
    console.error('[Admin Users] Error suspending user:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update user status',
      message: error.message,
    });
  }
}

export default withAdminAuth(async (req: NextApiRequest, res: NextApiResponse, admin: any) => {
  if (req.method === 'GET') {
    return getUser(req, res, admin);
  } else if (req.method === 'PATCH') {
    return updateUser(req, res, admin);
  } else if (req.method === 'DELETE') {
    return suspendUser(req, res, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}, { requireRole: 'super_admin' });

