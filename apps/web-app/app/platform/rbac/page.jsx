/**
 * Platform RBAC Page - Super Admin Only
 * Migrated from /admin/rbac
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminRBACPage from '@/app/admin/rbac/page';

// Re-export the admin RBAC page with role guard
export default withRoleGuard(AdminRBACPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

