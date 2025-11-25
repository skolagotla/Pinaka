/**
 * Platform Support Tickets Page - Super Admin Only
 * Migrated from /admin/support-tickets
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import AdminSupportTicketsPage from '@/app/admin/support-tickets/page';

export default withRoleGuard(AdminSupportTicketsPage, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

