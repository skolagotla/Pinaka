/**
 * Platform Applications Page - Super Admin Only
 * Migrated from /admin/applications
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminApplicationsPage from '@/app/admin/applications/page';

export default withRoleGuard(AdminApplicationsPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

