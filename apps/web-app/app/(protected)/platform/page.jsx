/**
 * Platform Dashboard - Super Admin Only
 * Unified platform management dashboard
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import { Card, Button, Spinner, Badge } from 'flowbite-react';
import {
  HiOfficeBuilding,
  HiUser,
  HiLockClosed,
  HiDocumentText,
  HiCog,
  HiChartBar,
  HiShieldCheck,
  HiArrowRight,
  HiDatabase,
} from 'react-icons/hi';
import Link from 'next/link';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useOrganizations, useUsers } from '@/lib/hooks/useV2Data';

function PlatformDashboardContent() {
  const { user, hasRole } = useV2Auth();
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();
  const { data: users, isLoading: usersLoading } = useUsers();

  const stats = [
    {
      label: 'Organizations',
      value: organizations?.length || 0,
      icon: HiOfficeBuilding,
      color: 'blue',
      link: '/platform/organizations',
    },
    {
      label: 'Users',
      value: users?.length || 0,
      icon: HiUser,
      color: 'green',
      link: '/platform/users',
    },
  ];

  const quickLinks = [
    { label: 'Organizations', icon: HiOfficeBuilding, link: '/platform/organizations', color: 'blue' },
    { label: 'Users', icon: HiUser, link: '/platform/users', color: 'green' },
    { label: 'RBAC Settings', icon: HiLockClosed, link: '/platform/rbac', color: 'purple' },
    { label: 'Audit Logs', icon: HiDocumentText, link: '/platform/audit-logs', color: 'yellow' },
    { label: 'Verifications', icon: HiShieldCheck, link: '/platform/verifications', color: 'purple' },
    { label: 'System', icon: HiDatabase, link: '/platform/system', color: 'blue' },
    { label: 'Security', icon: HiShieldCheck, link: '/platform/security', color: 'red' },
    { label: 'Analytics', icon: HiChartBar, link: '/platform/analytics', color: 'green' },
    { label: 'Platform Settings', icon: HiCog, link: '/platform/settings', color: 'gray' },
  ];

  if (orgsLoading || usersLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Platform Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage organizations, users, and platform-wide settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Links
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.label} href={link.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-${link.color}-100 dark:bg-${link.color}-900`}>
                      <Icon className={`h-6 w-6 text-${link.color}-600 dark:text-${link.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {link.label}
                      </h3>
                    </div>
                    <HiArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default withRoleGuard(PlatformDashboardContent, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

