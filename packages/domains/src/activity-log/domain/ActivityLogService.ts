/**
 * Activity Log Service
 * 
 * Domain logic for ActivityLog domain (infrastructure/audit concern)
 */

import { ActivityLogRepository, ActivityLogQuery } from './ActivityLogRepository';

export class ActivityLogService {
  constructor(private repository: ActivityLogRepository) {}

  /**
   * List activity logs with pagination and filters
   */
  async list(query: ActivityLogQuery, userContext?: { userId: string; role: string }) {
    // Build role-based where clause
    const where: any = {};

    // Role-based filtering
    if (userContext) {
      if (userContext.role === 'landlord' || userContext.role === 'tenant' || userContext.role === 'pmc') {
        where.userId = userContext.userId;
      }
      // Admin can see all (no filter)
    }

    return this.repository.findMany(query, where);
  }
}

