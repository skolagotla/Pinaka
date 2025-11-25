/**
 * Platform Security Page - Super Admin Only
 * Migrated from /admin/security
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminSecurityPage from '@/app/admin/security/page';

export default withRoleGuard(AdminSecurityPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

