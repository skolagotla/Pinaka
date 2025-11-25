/**
 * Platform API Keys Page - Super Admin Only
 * Migrated from /admin/api-keys
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminApiKeysPage from '@/app/admin/api-keys/page';

export default withRoleGuard(AdminApiKeysPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

