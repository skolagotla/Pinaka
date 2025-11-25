/**
 * Platform Audit Logs Page - Super Admin Only
 * Migrated from /admin/audit-logs
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminAuditLogsPage from '@/app/admin/audit-logs/page';

// Re-export the admin audit logs page with role guard
export default withRoleGuard(AdminAuditLogsPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

