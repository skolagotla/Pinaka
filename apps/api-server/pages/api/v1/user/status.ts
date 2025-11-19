/**
 * User Status API v1
 * GET /api/v1/user/status - Get current user's approval status
 * 
 * Domain-Driven, API-First, Shared-Schema implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { userService } from '@/lib/domains/users';
import { userStatusResponseSchema } from '@/lib/schemas';
import { z } from 'zod';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use domain service to get user status (Domain-Driven Design)
    const userStatus = await userService.getUserStatusByEmail(user.email);

    if (!userStatus) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Validate response with shared schema (SSOT)
    const response = userStatusResponseSchema.parse({
      success: true,
      role: userStatus.role,
      approvalStatus: userStatus.approvalStatus,
      rejectionReason: userStatus.rejectionReason || null,
      rejectedAt: userStatus.rejectedAt ? userStatus.rejectedAt.toISOString() : null,
    });

    return res.status(200).json(response);
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(500).json({
        success: false,
        error: 'Response validation error',
        details: error.issues,
      });
    }

    console.error('[User Status v1] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user status',
    });
  }
}, { skipAuth: false });

