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
// Google OAuth disabled - google-auth-library removed
// import { getAuthUrl } from '@/lib/admin/google-oauth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Google OAuth disabled
  return res.status(503).json({
    error: 'Google OAuth is disabled',
    message: 'Google authentication has been disabled. Please use password-based authentication.',
  });
}

