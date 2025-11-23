/**
 * Impersonation API
 * POST /api/admin/impersonate - Start impersonation
 * DELETE /api/admin/impersonate - Stop impersonation
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const impersonateSchema = z.object({
  userId: z.string(),
  userType: z.enum(['admin', 'landlord', 'tenant', 'pmc', 'vendor']),
});

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0].trim() 
    : forwarded?.[0] || req.socket.remoteAddress;
  return ip || 'unknown';
}

export default withAdminAuth(async (req: NextApiRequest, res: NextApiResponse, admin: any) => {
  // Only super_admin can impersonate
  if (admin.role !== 'SUPER_ADMIN' && admin.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Only super_admin can impersonate users' 
    });
  }

  if (req.method === 'POST') {
    // Start impersonation
    try {
      const body = impersonateSchema.parse(req.body);
      const { userId, userType } = body;

      // Get user to impersonate
      let user = null;
      if (userType === 'admin') {
        user = await prisma.admin.findUnique({ where: { id: userId } });
      } else if (userType === 'landlord') {
        user = await prisma.landlord.findUnique({ where: { id: userId } });
      } else if (userType === 'tenant') {
        user = await prisma.tenant.findUnique({ where: { id: userId } });
      } else if (userType === 'pmc') {
        user = await prisma.propertyManagementCompany.findUnique({ where: { id: userId } });
      } else if (userType === 'vendor') {
        user = await prisma.serviceProvider.findUnique({ where: { id: userId } });
      }

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      // Store impersonation in session cookie
      const impersonationData = {
        originalAdminId: admin.id,
        impersonatedUserId: userId,
        impersonatedUserType: userType,
        startedAt: new Date().toISOString(),
      };

      // Log impersonation start
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          adminId: admin.id,
          action: 'impersonation_started',
          resource: 'user',
          resourceId: userId,
          targetUserId: userId,
          targetUserRole: userType,
          details: impersonationData,
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent'] || 'unknown',
          success: true,
        },
      });

      // Set impersonation cookie
      const cookieValue = JSON.stringify(impersonationData);
      const isProduction = process.env.NODE_ENV === 'production';
      res.setHeader('Set-Cookie', [
        `admin_impersonation=${encodeURIComponent(cookieValue)}; HttpOnly; Secure=${isProduction}; SameSite=Lax; Path=/; Max-Age=3600`,
      ]);

      return res.status(200).json({
        success: true,
        data: {
          impersonatedUser: {
            id: user.id,
            email: (user as any).email,
            name: `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || (user as any).name || 'Unknown',
            type: userType,
          },
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
      console.error('[Impersonation] Error:', error);
      return res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to start impersonation' 
      });
    }
  } else if (req.method === 'DELETE') {
    // Stop impersonation
    try {
      const impersonationCookie = req.cookies.admin_impersonation;
      if (!impersonationCookie) {
        return res.status(400).json({ 
          success: false,
          error: 'Not currently impersonating' 
        });
      }

      let impersonationData;
      try {
        impersonationData = JSON.parse(decodeURIComponent(impersonationCookie));
      } catch (e) {
        // If cookie is malformed, just clear it
        res.setHeader('Set-Cookie', 'admin_impersonation=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
        return res.status(200).json({ 
          success: true, 
          message: 'Impersonation stopped' 
        });
      }

      // Log impersonation end
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          adminId: admin.id,
          action: 'impersonation_ended',
          resource: 'user',
          resourceId: impersonationData.impersonatedUserId,
          targetUserId: impersonationData.impersonatedUserId,
          targetUserRole: impersonationData.impersonatedUserType,
          details: impersonationData,
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent'] || 'unknown',
          success: true,
        },
      });

      // Clear impersonation cookie
      res.setHeader('Set-Cookie', 'admin_impersonation=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');

      return res.status(200).json({ 
        success: true, 
        message: 'Impersonation stopped' 
      });
    } catch (error: any) {
      console.error('[Impersonation] Error:', error);
      return res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to stop impersonation' 
      });
    }
  } else {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }
}, { requireRole: 'super_admin' });

