/**
 * Notification Read All API v1
 * PUT /api/v1/notifications/read-all
 * Mark all notifications as read for the current user
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { notificationService } from '@/lib/domains/notification';

async function markAllAsRead(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    await notificationService.markAllAsRead(user.userId);
    
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    console.error('[Notification Read All] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to mark all notifications as read',
    });
  }
}

export default withAuth(markAllAsRead, {
  requireRole: ['landlord', 'pmc', 'admin'],
  allowedMethods: ['PUT'],
});

