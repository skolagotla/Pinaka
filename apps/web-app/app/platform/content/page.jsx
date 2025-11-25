/**
 * Platform Content Page - Super Admin Only
 * Migrated from /admin/content
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminContentPage from '@/app/admin/content/page';

export default withRoleGuard(AdminContentPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

