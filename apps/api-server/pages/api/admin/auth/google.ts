/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN GOOGLE OAUTH - INITIATE LOGIN
 * ═══════════════════════════════════════════════════════════════
 * GET /api/admin/auth/google
 * 
 * Initiates Google OAuth flow for admin login
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthUrl } from '@/lib/admin/google-oauth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate state for CSRF protection (optional)
    const state = (req.query.state as string) || (null as any);

    // Get Google OAuth authorization URL
    const authUrl = getAuthUrl(state);

    // Redirect to Google OAuth
    res.redirect(authUrl);
  } catch (error: any) {
    console.error('[Admin Auth] Error initiating Google OAuth:', error);
    return res.status(500).json({
      error: 'Failed to initiate authentication',
      message: error.message,
    });
  }
}

