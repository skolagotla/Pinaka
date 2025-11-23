/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN AUDIT LOGS API
 * ═══════════════════════════════════════════════════════════════
 * GET /api/admin/audit-logs - List audit logs with filters
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');

async function listAuditLogs(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const {
      adminId,
      action,
      resource,
      success,
      startDate,
      endDate,
      page = 1,
      limit = 100,
      search,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    // Validate pagination parameters
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: 'Invalid page parameter. Must be a positive number.' });
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({ error: 'Invalid limit parameter. Must be a number between 1 and 1000.' });
    }
    
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (adminId) {
      where.adminId = adminId as string;
    }

    if (action) {
      where.action = action as string;
    }

    if (resource) {
      where.resource = resource as string;
    }

    if (success !== undefined) {
      where.success = success === 'true';
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    if (search) {
      where.OR = [
        { googleEmail: { contains: search as string, mode: 'insensitive' } },
        { ipAddress: { contains: search as string, mode: 'insensitive' } },
        { action: { contains: search as string, mode: 'insensitive' } },
        { resource: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    // Enrich logs with user information for non-admin logins
    // OPTIMIZED: Batch fetch users instead of N+1 queries
    // For landlord/tenant/pmc logins, adminId is null but targetUserId has the user ID
    const logsNeedingEnrichment = logs.filter(log => !log.adminId && log.targetUserId && log.targetUserRole);
    
    // Collect unique IDs by role for batch fetching
    const landlordIds = [...new Set(logsNeedingEnrichment.filter(l => l.targetUserRole === 'landlord').map(l => l.targetUserId))];
    const tenantIds = [...new Set(logsNeedingEnrichment.filter(l => l.targetUserRole === 'tenant').map(l => l.targetUserId))];
    const pmcIds = [...new Set(logsNeedingEnrichment.filter(l => l.targetUserRole === 'pmc').map(l => l.targetUserId))];
    
    // Batch fetch all users in parallel
    const [landlords, tenants, pmcs] = await Promise.all([
      landlordIds.length > 0 ? prisma.landlord.findMany({
        where: { id: { in: landlordIds } },
        select: { id: true, email: true, firstName: true, lastName: true },
      }) : [],
      tenantIds.length > 0 ? prisma.tenant.findMany({
        where: { id: { in: tenantIds } },
        select: { id: true, email: true, firstName: true, lastName: true },
      }) : [],
      pmcIds.length > 0 ? prisma.propertyManagementCompany.findMany({
        where: { id: { in: pmcIds } },
        select: { id: true, email: true, companyName: true },
      }) : [],
    ]);
    
    // Create lookup maps for O(1) access
    type UserInfo = { email: string; firstName: string; lastName: string | null };
    const landlordMap = new Map<string, UserInfo>(landlords.map(l => [l.id, {
      email: l.email,
      firstName: l.firstName,
      lastName: l.lastName,
    }]));
    const tenantMap = new Map<string, UserInfo>(tenants.map(t => [t.id, {
      email: t.email,
      firstName: t.firstName,
      lastName: t.lastName,
    }]));
    const pmcMap = new Map<string, UserInfo>(pmcs.map(p => [p.id, {
      email: p.email,
      firstName: p.companyName,
      lastName: null,
    }]));
    
    // Enrich logs using maps (O(1) lookup)
    const enrichedLogs = logs.map((log) => {
      if (!log.adminId && log.targetUserId && log.targetUserRole) {
        let userInfo: UserInfo | null = null;
        try {
          if (log.targetUserRole === 'landlord') {
            userInfo = landlordMap.get(log.targetUserId) || null;
          } else if (log.targetUserRole === 'tenant') {
            userInfo = tenantMap.get(log.targetUserId) || null;
          } else if (log.targetUserRole === 'pmc') {
            userInfo = pmcMap.get(log.targetUserId) || null;
          }
        } catch (error) {
          console.error('[Admin Audit Logs] Error enriching log:', error);
        }

        return {
          ...log,
          admin: userInfo, // Use admin field to display user info in UI
        };
      }
      return log;
    });

    return res.status(200).json({
      success: true,
      data: enrichedLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[Admin Audit Logs] Error listing logs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs',
      message: error.message,
    });
  }
}

export default withAdminAuth(listAuditLogs, { requireRole: 'super_admin' });

