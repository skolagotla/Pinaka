/**
 * Platform User Activity Page - Super Admin Only
 * Migrated from /admin/user-activity
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminUserActivityPage from '@/app/admin/user-activity/page';

export default withRoleGuard(AdminUserActivityPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

