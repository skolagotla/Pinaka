/**
 * Platform System Page - Super Admin Only
 * Migrated from /admin/system
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminSystemPage from '@/app/admin/system/page';

export default withRoleGuard(AdminSystemPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

