/**
 * Platform Database Page - Super Admin Only
 * Migrated from /admin/database
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminDatabasePage from '@/app/admin/database/page';

export default withRoleGuard(AdminDatabasePage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

