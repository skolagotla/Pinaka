/**
 * Platform Settings Page - Super Admin Only
 * Migrated from /admin/settings
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminSettingsPage from '@/app/admin/settings/page';

// Re-export the admin settings page with role guard
export default withRoleGuard(AdminSettingsPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

