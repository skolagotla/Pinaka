/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN LOGOUT
 * ═══════════════════════════════════════════════════════════════
 * POST /api/admin/auth/logout
 * 
 * Logs out admin and revokes session
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { validateSession, revokeSession } from '@/lib/admin/session';
import { prisma } from '@/lib/prisma';

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : req.socket.remoteAddress;
  return ip || 'unknown';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session token from cookie
    const sessionToken = req.cookies.admin_session;

    if (sessionToken) {
      // Validate session to get admin ID
      const sessionData = await validateSession(sessionToken);
      
      if (sessionData) {
        // Log logout
        await prisma.adminAuditLog.create({
          data: {
            id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            adminId: sessionData.admin.id,
            action: 'logout',
            resource: 'admin',
            resourceId: sessionData.admin.id,
            ipAddress: getClientIp(req),
            userAgent: req.headers['user-agent'] || 'Unknown',
            success: true,
          },
        });

        // Revoke session
        await revokeSession(sessionToken);
      }
    }

    // Clear session cookie
    res.setHeader('Set-Cookie', 'admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');

    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('[Admin Auth] Error during logout:', error);
    return res.status(500).json({ error: 'Failed to logout', message: error.message });
  }
}

