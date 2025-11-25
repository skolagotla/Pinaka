/**
 * Platform Data Export Page - Super Admin Only
 * Migrated from /admin/data-export
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminDataExportPage from '@/app/admin/data-export/page';

export default withRoleGuard(AdminDataExportPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

