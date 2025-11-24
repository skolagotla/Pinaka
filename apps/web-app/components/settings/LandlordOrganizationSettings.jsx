"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Alert,
  Badge,
  Button,
  Progress,
  Spinner,
} from 'flowbite-react';
import {
  HiUserGroup,
  HiHome,
  HiUser,
  HiDatabase,
  HiServer,
  HiExclamation,
  HiCheckCircle,
  HiClock,
} from 'react-icons/hi';
import FlowbiteStatistic from '../shared/FlowbiteStatistic';

export default function LandlordOrganizationSettings() {
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getOrganization();

      if (data.success) {
        setOrganization(data.data?.organization);
        setUsage(data.data);
      } else {
        setError(data.error || 'Failed to fetch organization data');
      }
    } catch (err) {
      console.error('Error fetching organization data:', err);
      setError('Failed to fetch organization data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { color: 'success', text: 'Active' },
      SUSPENDED: { color: 'failure', text: 'Suspended' },
      CANCELLED: { color: 'gray', text: 'Cancelled' },
      TRIAL: { color: 'warning', text: 'Trial' },
    };
    const config = statusConfig[status] || { color: 'gray', text: status };
    return <Badge color={config.color}>{config.text}</Badge>;
  };

  const getPlanBadge = (plan) => {
    const planColors = {
      FREE: 'gray',
      STARTER: 'info',
      PROFESSIONAL: 'purple',
      ENTERPRISE: 'warning',
      CUSTOM: 'cyan',
    };
    return <Badge color={planColors[plan] || 'gray'}>{plan}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Spinner size="xl" />
        <div className="mt-4 text-gray-600">Loading organization information...</div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <Alert color="info">
        <div>
          <h3 className="font-semibold">Organization Not Found</h3>
          <p className="text-sm mt-1">
            {error || 'You are not associated with an organization. This is normal for shared resources (PMCs, Vendors, Contractors).'}
          </p>
        </div>
      </Alert>
    );
  }

  const { trialStatus, apiStats, limits, usage: usageData } = usage || {};

  // Show status alerts
  const statusAlerts = [];
  if (organization.status === 'SUSPENDED') {
    statusAlerts.push(
      <Alert
        key="suspended"
        color="failure"
        className="mb-4"
      >
        <div>
          <h3 className="font-semibold">Account Suspended</h3>
          <p className="text-sm mt-1">Your organization account has been suspended. Please contact support for assistance.</p>
        </div>
      </Alert>
    );
  } else if (organization.status === 'CANCELLED') {
    statusAlerts.push(
      <Alert
        key="cancelled"
        color="warning"
        className="mb-4"
      >
        <div>
          <h3 className="font-semibold">Account Cancelled</h3>
          <p className="text-sm mt-1">Your organization account has been cancelled. Please contact support to reactivate.</p>
        </div>
      </Alert>
    );
  } else if (trialStatus?.hasTrial && trialStatus.isExpired) {
    statusAlerts.push(
      <Alert
        key="trial-expired"
        color="failure"
        className="mb-4"
      >
        <div>
          <h3 className="font-semibold">Trial Expired</h3>
          <p className="text-sm mt-1">Your trial period has ended. Please upgrade to a paid plan to continue using the service.</p>
        </div>
      </Alert>
    );
  } else if (trialStatus?.hasTrial && trialStatus.daysRemaining !== null && trialStatus.daysRemaining <= 3) {
    statusAlerts.push(
      <Alert
        key="trial-warning"
        color="warning"
        className="mb-4"
      >
        <div>
          <h3 className="font-semibold">Trial Ending Soon - {trialStatus.daysRemaining} days remaining</h3>
          <p className="text-sm mt-1">
            Your trial period ends on {trialStatus.expiresAt?.toLocaleDateString()}. Please upgrade to a paid plan to avoid service interruption.
          </p>
        </div>
      </Alert>
    );
  }

  // Show limit warnings
  if (limits && !limits.withinLimits && limits.exceededLimits.length > 0) {
    statusAlerts.push(
      <Alert
        key="limits-exceeded"
        color="warning"
        className="mb-4"
      >
        <div>
          <h3 className="font-semibold">Usage Limits Exceeded</h3>
          <p className="text-sm mt-1">
            You have exceeded the following limits: {limits.exceededLimits.join(', ')}. Please upgrade your plan to continue.
          </p>
        </div>
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h4 className="text-lg font-semibold m-0">Organization Settings</h4>
          <p className="text-sm text-gray-500 mt-2">
            View your organization details, usage statistics, and plan limits.
          </p>
        </div>
        <Button color="gray" onClick={fetchOrganizationData}>Refresh</Button>
      </div>

      {statusAlerts}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Organization Info */}
        <Card>
          <h5 className="text-lg font-semibold mb-4">Organization Information</h5>
          <div className="space-y-3">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</div>
              <div className="text-gray-900 dark:text-white">{organization.name}</div>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Subdomain</div>
              <div>
                {organization.subdomain ? (
                  <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                    {organization.subdomain}.pinaka.com
                  </code>
                ) : (
                  <span className="text-gray-400">Not set</span>
                )}
              </div>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Plan</div>
              <div>{getPlanBadge(organization.plan)}</div>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
              <div>{getStatusBadge(organization.status)}</div>
            </div>
            {organization.subscriptionStatus && (
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Subscription Status</div>
                <div><Badge color="gray">{organization.subscriptionStatus}</Badge></div>
              </div>
            )}
            {organization.currentPeriodEnd && (
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Billing Period Ends</div>
                <div className="text-gray-900 dark:text-white">
                  {new Date(organization.currentPeriodEnd).toLocaleDateString()}
                </div>
              </div>
            )}
            {trialStatus?.hasTrial && trialStatus.expiresAt && (
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Trial Expires</div>
                <div className="text-gray-900 dark:text-white">
                  {new Date(trialStatus.expiresAt).toLocaleDateString()}
                  {trialStatus.daysRemaining !== null && (
                    <span className="ml-2 text-gray-500">
                      ({trialStatus.daysRemaining} days remaining)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <h5 className="text-lg font-semibold mb-4">Usage Statistics</h5>
          <div className="space-y-6">
            {/* Properties */}
            {organization.limits.maxProperties !== null && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <HiHome className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Properties</span>
                  </div>
                  <span className="text-sm font-medium">
                    {usageData?.propertyCount || 0} / {organization.limits.maxProperties}
                  </span>
                </div>
                <Progress
                  progress={Math.min(100, ((usageData?.propertyCount || 0) / organization.limits.maxProperties) * 100)}
                  color={limits?.exceededLimits?.includes('properties') ? 'failure' : 'blue'}
                  size="sm"
                />
              </div>
            )}

            {/* Tenants */}
            {organization.limits.maxTenants !== null && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <HiUserGroup className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Tenants</span>
                  </div>
                  <span className="text-sm font-medium">
                    {usageData?.tenantCount || 0} / {organization.limits.maxTenants}
                  </span>
                </div>
                <Progress
                  progress={Math.min(100, ((usageData?.tenantCount || 0) / organization.limits.maxTenants) * 100)}
                  color={limits?.exceededLimits?.includes('tenants') ? 'failure' : 'blue'}
                  size="sm"
                />
              </div>
            )}

            {/* Users */}
            {organization.limits.maxUsers !== null && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <HiUser className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Users</span>
                  </div>
                  <span className="text-sm font-medium">
                    {usageData?.userCount || 0} / {organization.limits.maxUsers}
                  </span>
                </div>
                <Progress
                  progress={Math.min(100, ((usageData?.userCount || 0) / organization.limits.maxUsers) * 100)}
                  color={limits?.exceededLimits?.includes('users') ? 'failure' : 'blue'}
                  size="sm"
                />
              </div>
            )}

            {/* Storage */}
            {organization.limits.maxStorageGB !== null && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <HiDatabase className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Storage</span>
                  </div>
                  <span className="text-sm font-medium">
                    {usageData?.storageGB?.toFixed(2) || 0} GB / {organization.limits.maxStorageGB} GB
                  </span>
                </div>
                <Progress
                  progress={Math.min(100, ((usageData?.storageGB || 0) / organization.limits.maxStorageGB) * 100)}
                  color={limits?.exceededLimits?.includes('storage') ? 'failure' : 'blue'}
                  size="sm"
                />
              </div>
            )}

            {/* API Calls */}
            {organization.limits.maxApiCallsPerMonth !== null && apiStats && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <HiServer className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">API Calls (Monthly)</span>
                  </div>
                  <span className="text-sm font-medium">
                    {apiStats.count} / {organization.limits.maxApiCallsPerMonth}
                  </span>
                </div>
                <Progress
                  progress={Math.min(100, (apiStats.count / organization.limits.maxApiCallsPerMonth) * 100)}
                  color={apiStats.remaining === 0 ? 'failure' : 'blue'}
                  size="sm"
                />
                {apiStats.resetAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Resets on {new Date(apiStats.resetAt).toLocaleDateString()}
                  </p>
                )}
                {apiStats.remaining !== null && (
                  <p className="text-xs text-gray-500 mt-1">
                    {apiStats.remaining} calls remaining this month
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Plan Limits */}
      <Card className="mt-4">
        <h5 className="text-lg font-semibold mb-4">Plan Limits</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <FlowbiteStatistic
            title="Max Properties"
            value={organization.limits.maxProperties ?? 'Unlimited'}
            prefix={<HiHome className="h-6 w-6" />}
          />
          <FlowbiteStatistic
            title="Max Tenants"
            value={organization.limits.maxTenants ?? 'Unlimited'}
            prefix={<HiUserGroup className="h-6 w-6" />}
          />
          <FlowbiteStatistic
            title="Max Users"
            value={organization.limits.maxUsers ?? 'Unlimited'}
            prefix={<HiUser className="h-6 w-6" />}
          />
          <FlowbiteStatistic
            title="Max Storage"
            value={organization.limits.maxStorageGB ? `${organization.limits.maxStorageGB} GB` : 'Unlimited'}
            prefix={<HiDatabase className="h-6 w-6" />}
          />
        </div>
      </Card>
    </div>
  );
}
