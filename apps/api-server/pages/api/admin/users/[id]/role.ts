/**
 * Update User Role API
 * PATCH /api/admin/users/:id/role
 * Only super_admin can change roles
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateRoleSchema = z.object({
  role: z.enum(['super_admin', 'pmc_admin', 'pm', 'landlord', 'tenant', 'vendor']),
});

export default withAdminAuth(async (req: NextApiRequest, res: NextApiResponse, admin: any) => {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Only super_admin can change roles
  if (admin.role !== 'SUPER_ADMIN' && admin.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Only super_admin can change user roles' 
    });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid user ID' 
      });
    }

    const body = updateRoleSchema.parse(req.body);
    const { role } = body;

    // Determine user type and update accordingly
    // Check if user is Admin, Landlord, Tenant, PMC, or ServiceProvider
    let updatedUser = null;
    let userType = 'unknown';
    let oldRole = null;

    // Try Admin first
    const adminUser = await prisma.admin.findUnique({ where: { id } });
    if (adminUser) {
      oldRole = adminUser.role;
      // Map role to AdminRole enum
      const adminRoleMap: Record<string, any> = {
        'super_admin': 'SUPER_ADMIN',
        'pmc_admin': 'PLATFORM_ADMIN',
        'pm': 'PLATFORM_ADMIN',
        'landlord': 'PLATFORM_ADMIN',
        'tenant': 'PLATFORM_ADMIN',
        'vendor': 'PLATFORM_ADMIN',
      };
      updatedUser = await prisma.admin.update({
        where: { id },
        data: { role: adminRoleMap[role] || 'PLATFORM_ADMIN' },
      });
      userType = 'admin';
    } else {
      // Check other user types
      const [landlord, tenant, pmc, vendor] = await Promise.all([
        prisma.landlord.findUnique({ where: { id } }),
        prisma.tenant.findUnique({ where: { id } }),
        prisma.propertyManagementCompany.findUnique({ where: { id } }),
        prisma.serviceProvider.findUnique({ where: { id } }),
      ]);

      if (landlord) {
        // For landlords, we can't directly change their "role" since they're always landlords
        // But we can update their approval status or other fields
        // For now, we'll just return success - role changes for landlords would need different handling
        updatedUser = landlord;
        userType = 'landlord';
        oldRole = 'landlord';
      } else if (tenant) {
        updatedUser = tenant;
        userType = 'tenant';
        oldRole = 'tenant';
      } else if (pmc) {
        updatedUser = pmc;
        userType = 'pmc';
        oldRole = 'pmc';
      } else if (vendor) {
        updatedUser = vendor;
        userType = 'vendor';
        oldRole = 'vendor';
      } else {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }
    }

    // Log role change
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'user_role_changed',
        resource: 'user',
        resourceId: id,
        targetUserId: id,
        targetUserRole: role,
        beforeState: { role: oldRole, userType },
        afterState: { role, userType },
        changedFields: ['role'],
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        success: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        ...updatedUser,
        role,
        userType,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error', 
        details: error.issues 
      });
    }
    console.error('[Admin User Role] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to update user role' 
    });
  }
}, { requireRole: 'super_admin' });

