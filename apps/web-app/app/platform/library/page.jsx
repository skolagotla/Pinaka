/**
 * Platform Library Page - Super Admin Only
 * Migrated from /admin/library
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminLibraryPage from '@/app/admin/library/page';

export default withRoleGuard(AdminLibraryPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

