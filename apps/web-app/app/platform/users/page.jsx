/**
 * Platform Users Page - Super Admin Only
 * Migrated from /admin/users
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminUsersPage from '@/app/admin/users/page';

// Re-export the admin users page with role guard
export default withRoleGuard(AdminUsersPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

