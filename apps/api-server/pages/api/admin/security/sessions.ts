/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN SECURITY - ACTIVE SESSIONS
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');

async function getSessions(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { adminId, activeOnly = 'true' } = req.query;

    const where: any = {};
    if (adminId) where.adminId = adminId;
    if (activeOnly === 'true') {
      where.isRevoked = false;
      where.expiresAt = { gt: new Date() };
    }

    const sessions = await prisma.adminSession.findMany({
      where,
      include: {
        admin: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { lastActivityAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error: any) {
    console.error('[Admin Security] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch sessions',
      message: error.message,
    });
  }
}

async function revokeSession(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;

    await prisma.adminSession.update({
      where: { id: id as string },
      data: { isRevoked: true },
    });

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'revoke_session',
        resource: 'admin_session',
        resourceId: id as string,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error: any) {
    console.error('[Admin Security] Error revoking session:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to revoke session',
      message: error.message,
    });
  }
}

export default withAdminAuth(async (req: NextApiRequest, res: NextApiResponse, admin: any) => {
  if (req.method === 'GET') {
    return getSessions(req, res, admin);
  } else if (req.method === 'POST' && req.query.action === 'revoke') {
    return revokeSession(req, res, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}, { requireRole: 'super_admin' });

