/**
 * Platform Notifications Page - Super Admin Only
 * Migrated from /admin/notifications
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminNotificationsPage from '@/app/admin/notifications/page';

export default withRoleGuard(AdminNotificationsPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

