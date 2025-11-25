/**
 * Platform Analytics Page - Super Admin Only
 * Migrated from /admin/analytics
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminAnalyticsPage from '@/app/admin/analytics/page';

export default withRoleGuard(AdminAnalyticsPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

