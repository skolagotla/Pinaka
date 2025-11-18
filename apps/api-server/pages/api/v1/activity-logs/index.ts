/**
 * Activity Logs API v1
 * GET /api/v1/activity-logs
 * 
 * Domain-Driven, API-First implementation
 * Uses domain service instead of direct Prisma access
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { activityLogQuerySchema } from '@/lib/schemas';
import { z } from 'zod';
import { activityLogService } from '@/lib/domains/activity-log';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
          const query = activityLogQuerySchema.parse(req.query);

    // Build query object for service
    const serviceQuery: any = {
      page: query.page,
      limit: query.limit,
      ...(query.type && { type: query.type }),
      ...(query.entityType && { entityType: query.entityType }),
      ...(query.action && { action: query.action }),
      ...(query.userId && { userId: query.userId }),
      ...(query.startDate && { startDate: new Date(query.startDate) }),
      ...(query.endDate && { endDate: new Date(query.endDate) }),
    };

    // Use domain service
    const result = await activityLogService.list(serviceQuery, {
      userId: user.userId,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      data: result.activities,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Activity Logs v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch activity logs',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc', 'admin'], allowedMethods: ['GET'] });

