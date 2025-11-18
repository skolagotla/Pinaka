/**
 * Get Current Admin User
 * GET /api/admin/me - Get the currently logged-in admin user
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';

export default withAdminAuth(async (req: NextApiRequest, res: NextApiResponse, admin: any) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    return res.status(200).json({
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        isActive: admin.isActive,
      },
    });
  } catch (error: any) {
    console.error('Error fetching current admin:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch current admin' });
  }
});

