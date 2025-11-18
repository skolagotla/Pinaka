/**
 * ═══════════════════════════════════════════════════════════════
 * GET CURRENT ADMIN USER
 * ═══════════════════════════════════════════════════════════════
 * GET /api/admin/auth/me
 * 
 * Returns current authenticated admin user
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '@/lib/admin/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session token from cookie
    const sessionToken = req.cookies.admin_session;

    if (!sessionToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate session
    const sessionData = await validateSession(sessionToken);

    if (!sessionData) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Return admin info (without sensitive data)
    return res.status(200).json({
      success: true,
      user: {
        id: sessionData.admin.id,
        email: sessionData.admin.email,
        firstName: sessionData.admin.firstName,
        lastName: sessionData.admin.lastName,
        role: sessionData.admin.role,
        isActive: sessionData.admin.isActive,
      },
    });
  } catch (error: any) {
    console.error('[Admin Auth] Error getting admin user:', error);
    return res.status(500).json({ error: 'Failed to get admin user', message: error.message });
  }
}

