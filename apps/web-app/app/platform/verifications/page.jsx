/**
 * Platform Verifications Page - Super Admin Only
 * Migrated from /admin/verifications
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminVerificationsPage from '@/app/admin/verifications/page';

export default withRoleGuard(AdminVerificationsPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

