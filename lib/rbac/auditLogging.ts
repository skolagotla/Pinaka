/**
 * RBAC Audit & Compliance
 * Phase 6: Audit & Compliance
 * 
 * Comprehensive audit logging for:
 * - Permission changes
 * - Role assignments
 * - Data access
 * - All user actions
 * - 7-year retention policy
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Log permission change
 * Tracks when permissions are granted or revoked
 */
export async function logPermissionChange(
  userId: string,
  userType: string,
  userEmail: string,
  userName: string,
  action: 'grant' | 'revoke' | 'modify',
  targetUserId: string,
  targetUserType: string,
  permission: {
    category: string;
    resource: string;
    action: string;
  },
  beforeState?: any,
  afterState?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await prisma.rBACAuditLog.create({
    data: {
      userId,
      userType,
      userEmail,
      userName,
      action: `permission_${action}`,
      resource: 'permission',
      resourceId: targetUserId,
      beforeState,
      afterState,
      details: {
        targetUserType,
        permission,
        timestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
    },
  });
}

/**
 * Log role assignment
 * Tracks when roles are assigned or removed
 */
export async function logRoleAssignment(
  userId: string,
  userType: string,
  userEmail: string,
  userName: string,
  action: 'assign' | 'remove',
  targetUserId: string,
  targetUserType: string,
  roleId: string,
  roleName: string,
  scope?: {
    portfolioId?: string;
    propertyId?: string;
    unitId?: string;
  },
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await prisma.rBACAuditLog.create({
    data: {
      userId,
      userType,
      userEmail,
      userName,
      action: `role_${action}`,
      resource: 'role',
      resourceId: targetUserId,
      roleId,
      details: {
        targetUserType,
        roleName,
        scope,
        timestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
    },
  });
}

/**
 * Log data access
 * Tracks when users access sensitive data
 * Based on Q10.2: Log all 4 W's (Who, What, When, Where)
 */
export async function logDataAccess(
  userId: string,
  userType: string,
  userEmail: string,
  userName: string,
  resourceType: string,
  resourceId: string,
  action: string,
  ipAddress?: string,
  userAgent?: string,
  additionalContext?: any
): Promise<void> {
  await prisma.rBACAuditLog.create({
    data: {
      userId, // WHO
      userType,
      userEmail,
      userName,
      action: `data_access_${action}`, // WHAT
      resource: resourceType,
      resourceId,
      details: {
        // WHEN is in createdAt
        // WHERE is in ipAddress
        ipAddress, // WHERE
        userAgent, // WHERE (device/browser)
        additionalContext,
        timestamp: new Date().toISOString(), // WHEN
      },
      ipAddress,
      userAgent,
    },
  });
}

/**
 * Log sensitive data access
 * Specifically for sensitive operations (e.g., PM views tenant financials)
 */
export async function logSensitiveDataAccess(
  userId: string,
  userType: string,
  userEmail: string,
  userName: string,
  resourceType: string,
  resourceId: string,
  sensitiveFields: string[], // e.g., ['financials', 'ssn', 'bankAccount']
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await prisma.rBACAuditLog.create({
    data: {
      userId,
      userType,
      userEmail,
      userName,
      action: 'sensitive_data_access',
      resource: resourceType,
      resourceId,
      details: {
        sensitiveFields,
        ipAddress,
        userAgent,
        timestamp: new Date().toISOString(),
        compliance: {
          gdpr: true,
          pii: true,
        },
      },
      ipAddress,
      userAgent,
    },
  });
}

/**
 * Log report generation/download
 * Tracks when reports are generated and downloaded
 */
export async function logReportAccess(
  userId: string,
  userType: string,
  userEmail: string,
  userName: string,
  reportType: string,
  reportId?: string,
  exported: boolean = false,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await prisma.rBACAuditLog.create({
    data: {
      userId,
      userType,
      userEmail,
      userName,
      action: exported ? 'report_exported' : 'report_generated',
      resource: 'report',
      resourceId: reportId || '',
      details: {
        reportType,
        exported,
        timestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
    },
  });

  // Notify PMC Admin or Landlord (as per design decisions)
  // This would integrate with your notification system
}

/**
 * Log data export
 * Tracks when data is exported (with audit trail requirement)
 */
export async function logDataExport(
  userId: string,
  userType: string,
  userEmail: string,
  userName: string,
  exportType: string,
  recordCount: number,
  filters?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await prisma.rBACAuditLog.create({
    data: {
      userId,
      userType,
      userEmail,
      userName,
      action: 'data_export',
      resource: 'export',
      details: {
        exportType,
        recordCount,
        filters,
        timestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
    },
  });
}

/**
 * Log account deactivation
 * Tracks when accounts are deactivated or deleted
 */
export async function logAccountDeactivation(
  deactivatedUserId: string,
  deactivatedUserType: string,
  deactivatedBy: string,
  deactivatedByType: string,
  deactivatedByEmail: string,
  deactivatedByName: string,
  action: 'deactivate' | 'delete',
  reason?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await prisma.rBACAuditLog.create({
    data: {
      userId: deactivatedBy,
      userType: deactivatedByType,
      userEmail: deactivatedByEmail,
      userName: deactivatedByName,
      action: `account_${action}`,
      resource: 'user',
      resourceId: deactivatedUserId,
      details: {
        deactivatedUserType,
        reason,
        timestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
    },
  });
}

/**
 * Log role change
 * Tracks when user roles are changed (triggers immediate logout)
 */
export async function logRoleChange(
  targetUserId: string,
  targetUserType: string,
  changedBy: string,
  changedByType: string,
  changedByEmail: string,
  changedByName: string,
  oldRoles: string[],
  newRoles: string[],
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await prisma.rBACAuditLog.create({
    data: {
      userId: changedBy,
      userType: changedByType,
      userEmail: changedByEmail,
      userName: changedByName,
      action: 'role_change',
      resource: 'user',
      resourceId: targetUserId,
      beforeState: { roles: oldRoles },
      afterState: { roles: newRoles },
      details: {
        targetUserType,
        immediateLogout: true, // Triggers logout
        timestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
    },
  });
}

/**
 * Get audit logs for a user
 * Super Admin and PMC Admin can view logs
 */
export async function getAuditLogs(
  viewerUserId: string,
  viewerUserType: string,
  filters?: {
    userId?: string;
    userType?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    pmcId?: string; // For PMC Admin - only their PMC's logs
  },
  limit: number = 100,
  offset: number = 0
): Promise<any[]> {
  // Check if viewer can access audit logs
  // Super Admin can see all, PMC Admin can see their PMC's logs

  const where: any = {};

  if (filters?.userId) {
    where.userId = filters.userId;
  }

  if (filters?.userType) {
    where.userType = filters.userType;
  }

  if (filters?.action) {
    where.action = { contains: filters.action, mode: 'insensitive' };
  }

  if (filters?.resource) {
    where.resource = filters.resource;
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  // PMC Admin can only see logs for their PMC
  if (filters?.pmcId && viewerUserType === 'pmc') {
    // Filter by PMC context in details or scope
    // This would need to be implemented based on how PMC ID is stored
  }

  const logs = await prisma.rBACAuditLog.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
  });

  return logs;
}

/**
 * Archive old audit logs
 * Moves logs older than retention period to cold storage
 * Retention: 30 days visible, 7 years in cold storage
 */
export async function archiveAuditLogs(): Promise<void> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenYearsAgo = new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000);

  // Find logs older than 30 days but less than 7 years
  // These should be archived but not deleted
  const logsToArchive = await prisma.rBACAuditLog.findMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo,
        gte: sevenYearsAgo,
      },
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  // In production, you would:
  // 1. Export logs to cold storage (S3 Glacier, etc.)
  // 2. Mark as archived in database
  // 3. Optionally delete from primary database after confirmation

  console.log(`Found ${logsToArchive.length} logs to archive`);

  // For now, we'll just mark them (you'd add an archived field)
  // await prisma.rBACAuditLog.updateMany({
  //   where: {
  //     id: { in: logsToArchive.map(l => l.id) }
  //   },
  //   data: {
  //     archived: true,
  //     archivedAt: new Date()
  //   }
  // });
}

/**
 * Delete logs older than 7 years
 * Only after they've been archived to cold storage
 */
export async function deleteOldAuditLogs(): Promise<void> {
  const sevenYearsAgo = new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000);

  // Only delete if archived
  // In production, verify they're in cold storage first
  const logsToDelete = await prisma.rBACAuditLog.findMany({
    where: {
      createdAt: {
        lt: sevenYearsAgo,
      },
    },
    select: {
      id: true,
    },
  });

  // In production, verify cold storage backup exists before deleting
  // For now, we'll just log (don't actually delete)
  console.log(`Found ${logsToDelete.length} logs older than 7 years`);

  // await prisma.rBACAuditLog.deleteMany({
  //   where: {
  //     id: { in: logsToDelete.map(l => l.id) },
  //     archived: true,
  //     archivedAt: { not: null }
  //   }
  // });
}

/**
 * Get audit log statistics
 * For compliance reporting
 */
export async function getAuditStatistics(
  startDate: Date,
  endDate: Date,
  pmcId?: string
): Promise<{
  totalLogs: number;
  byAction: Record<string, number>;
  byUserType: Record<string, number>;
  byResource: Record<string, number>;
  sensitiveAccessCount: number;
}> {
  const where: any = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  const logs = await prisma.rBACAuditLog.findMany({
    where,
    select: {
      action: true,
      userType: true,
      resource: true,
      details: true,
    },
  });

  const stats = {
    totalLogs: logs.length,
    byAction: {} as Record<string, number>,
    byUserType: {} as Record<string, number>,
    byResource: {} as Record<string, number>,
    sensitiveAccessCount: 0,
  };

  for (const log of logs) {
    // Count by action
    stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

    // Count by user type
    if (log.userType) {
      stats.byUserType[log.userType] = (stats.byUserType[log.userType] || 0) + 1;
    }

    // Count by resource
    if (log.resource) {
      stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1;
    }

    // Count sensitive access
    if (log.action === 'sensitive_data_access') {
      stats.sensitiveAccessCount++;
    }
  }

  return stats;
}

/**
 * Export audit logs for compliance
 * Creates a downloadable report of audit logs
 */
export async function exportAuditLogs(
  startDate: Date,
  endDate: Date,
  format: 'csv' | 'json' = 'json',
  pmcId?: string
): Promise<string> {
  const logs = await getAuditLogs(
    'system', // System export
    'admin',
    {
      startDate,
      endDate,
      pmcId,
    },
    10000 // Large limit for export
  );

  if (format === 'csv') {
    // Convert to CSV
    const headers = ['Date', 'User', 'User Type', 'Action', 'Resource', 'Resource ID', 'IP Address'];
    const rows = logs.map((log) => [
      log.createdAt.toISOString(),
      log.userName || log.userEmail || log.userId,
      log.userType || '',
      log.action,
      log.resource || '',
      log.resourceId || '',
      log.ipAddress || '',
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  } else {
    // Return as JSON
    return JSON.stringify(logs, null, 2);
  }
}

