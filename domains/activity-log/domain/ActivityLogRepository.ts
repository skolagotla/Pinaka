/**
 * Activity Log Repository
 * 
 * Data access layer for ActivityLog domain (infrastructure/audit concern)
 */

import { PrismaClient } from '@prisma/client';

export interface ActivityLogQuery {
  page: number;
  limit: number;
  type?: string;
  entityType?: string;
  action?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class ActivityLogRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find activity logs with filters and pagination
   */
  async findMany(query: ActivityLogQuery, where?: any) {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      ...where,
      ...(filters.type && { entityType: filters.type }),
      ...(filters.entityType && { entityType: filters.entityType }),
      ...(filters.action && { action: filters.action }),
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.startDate || filters.endDate ? {
        createdAt: {
          ...(filters.startDate && { gte: filters.startDate }),
          ...(filters.endDate && { lte: filters.endDate }),
        }
      } : {}),
    };

    const [activities, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        // Note: ActivityLog doesn't have a user relation in Prisma schema
        // User info is stored directly in the ActivityLog model (userId, userEmail, userName, userRole)
      }),
      this.prisma.activityLog.count({ where: whereClause })
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

