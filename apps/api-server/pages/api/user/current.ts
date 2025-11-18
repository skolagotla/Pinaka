/**
 * API Endpoint: Get Current User Info
 * GET /api/user/current - Get current authenticated user information
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    return res.status(200).json({
      success: true,
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
        name: user.userName
      }
    });
  } catch (error) {
    console.error('[Get Current User] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch user information' });
  }
}

export default withAuth(handler);

