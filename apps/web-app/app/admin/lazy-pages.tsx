/**
 * Lazy-loaded Admin Pages
 * Route-level code splitting for admin pages
 * Reduces initial bundle size by ~30-40%
 */

"use client";

import dynamic from 'next/dynamic';
import { Spin } from 'antd';

const LoadingComponent = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: 400,
    padding: 40 
  }}>
    <Spin size="large" />
  </div>
);

// Lazy load admin pages
export const AdminDashboardPage = dynamic(
  () => import('./dashboard/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminUsersPage = dynamic(
  () => import('./users/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminRBACPage = dynamic(
  () => import('./rbac/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminVerificationsPage = dynamic(
  () => import('./verifications/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminSystemPage = dynamic(
  () => import('./system/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminAuditLogsPage = dynamic(
  () => import('./audit-logs/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminSettingsPage = dynamic(
  () => import('./settings/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminAnalyticsPage = dynamic(
  () => import('./analytics/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminSupportTicketsPage = dynamic(
  () => import('./support-tickets/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminSecurityPage = dynamic(
  () => import('./security/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminDataExportPage = dynamic(
  () => import('./data-export/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminNotificationsPage = dynamic(
  () => import('./notifications/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminUserActivityPage = dynamic(
  () => import('./user-activity/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminContentPage = dynamic(
  () => import('./content/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminApiKeysPage = dynamic(
  () => import('./api-keys/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export const AdminDatabasePage = dynamic(
  () => import('./database/page'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

