"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Alert,
  Badge,
  Progress,
  Spinner,
} from 'flowbite-react';
import {
  HiUserGroup,
  HiHome,
  HiUser,
  HiDatabase,
  HiCode,
  HiExclamationTriangle,
  HiCheckCircle,
  HiClock,
  HiRefresh,
  HiBanknotes,
} from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { PageLayout, LoadingWrapper } from '@/components/shared';
import { useLoading } from '@/lib/hooks/useLoading';

export default function OrganizationClient({ user }) {
  const router = useRouter();
  const { loading, withLoading } = useLoading();
  const [organization, setOrganization] = useState(null);
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    await withLoading(async () => {
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
      }
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { color: 'success', text: 'Active' },
      SUSPENDED: { color: 'failure', text: 'Suspended' },
      CANCELLED: { color: 'gray', text: 'Cancelled' },
      TRIAL: { color: 'warning', text: 'Trial' },
    };
    const config = statusConfig[status] || { color: 'gray', text: status };
    return <Badge color={config.color}config.text}</Badge>;
  };

  const getPlanBadge = (plan) => {
    const planColors = {
      FREE: 'gray',
      STARTER: 'blue',
      PROFESSIONAL: 'purple',
      ENTERPRISE: 'yellow',
      CUSTOM: 'cyan',
    };
    return <Badge color={planColors[plan] || 'gray'}plan}</Badge>;
  };

  if (loading) {
    return (
      <PageLayout headerTitle={<><HiBanknotes className="inline mr-2" /> Organization Settings</>}>
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner size="xl" />
        </div>
      </PageLayout>
    );
  }

  if (error || !organization) {
    return (
      <PageLayout headerTitle={<><HiBanknotes className="inline mr-2" /> Organization Settings</>}>
        <Alert color="info">
          <div>
            <div className="font-semibold mb-2">Organization Not Found</div>
            <div>{error || 'You are not associated with an organization. This is normal for shared resources (PMCs, Vendors, Contractors).'}</div>
          </div>
        </Alert>
      </PageLayout>
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
        icon={HiExclamationTriangle}
        className="mb-4"
      >
        <div>
          <div className="font-semibold mb-2">Account Suspended</div>
          <div>Your organization account has been suspended. Please contact support for assistance.</div>
        </div>
      </Alert>
    );
  } else if (organization.status === 'CANCELLED') {
    statusAlerts.push(
      <Alert
        key="cancelled"
        color="warning"
        icon={HiExclamationTriangle}
        className="mb-4"
      >
        <div>
          <div className="font-semibold mb-2">Account Cancelled</div>
          <div>Your organization account has been cancelled. Please contact support to reactivate.</div>
        </div>
      </Alert>
    );
  } else if (trialStatus?.hasTrial && trialStatus.isExpired) {
    statusAlerts.push(
      <Alert
        key="trial-expired"
        color="failure"
        icon={HiExclamationTriangle}
        className="mb-4"
      >
        <div>
          <div className="font-semibold mb-2">Trial Expired</div>
          <div>Your trial period has ended. Please upgrade to a paid plan to continue using the service.</div>
        </div>
      </Alert>
    );
  } else if (trialStatus?.hasTrial && trialStatus.daysRemaining !== null && trialStatus.daysRemaining <= 3) {
    statusAlerts.push(
      <Alert
        key="trial-warning"
        color="warning"
        icon={HiClock}
        className="mb-4"
      >
        <div>
          <div className="font-semibold mb-2">Trial Ending Soon - {trialStatus.daysRemaining} days remaining</div>
          <div>Your trial period ends on {trialStatus.expiresAt?.toLocaleDateString()}. Please upgrade to a paid plan to avoid service interruption.</div>
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
        icon={HiExclamationTriangle}
        className="mb-4"
      >
        <div>
          <div className="font-semibold mb-2">Usage Limits Exceeded</div>
          <div>You have exceeded the following limits: {limits.exceededLimits.join(', ')}. Please upgrade your plan to continue.</div>
        </div>
      </Alert>
    );
  }

  return (
    <PageLayout
      headerTitle={<><HiBanknotes className="inline mr-2" /> Organization Settings</>}
      headerActions={
        <Button key="refresh" onClick={fetchOrganizationData} disabled={loading}>
          {loading ? <Spinner size="sm" className="mr-2" /> : <HiRefresh className="mr-2 h-5 w-5" />}
          Refresh
        </Button>
      }
      contentStyle={{ maxWidth: 1200, margin: '0 auto' }}
    >
      {statusAlerts}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Organization Info */}
        <Card>
          <h5 className="text-xl font-semibold mb-4">Organization Information</h5>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span>{organization.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Subdomain:</span>
              {organization.subdomain ? (
                <code className="px-2 py-1 bg-gray-100 rounded">{organization.subdomain}.pinaka.com</code>
              ) : (
                <span className="text-gray-500">Not set</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Plan:</span>
              {getPlanBadge(organization.plan)}
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              {getStatusBadge(organization.status)}
            </div>
            {organization.subscriptionStatus && (
              <div className="flex justify-between">
                <span className="font-medium">Subscription Status:</span>
                <Badge>{organization.subscriptionStatus}</Badge>
              </div>
            )}
            {organization.currentPeriodEnd && (
              <div className="flex justify-between">
                <span className="font-medium">Billing Period Ends:</span>
                <span>{new Date(organization.currentPeriodEnd).toLocaleDateString()}</span>
              </div>
            )}
            {trialStatus?.hasTrial && trialStatus.expiresAt && (
              <div className="flex justify-between">
                <span className="font-medium">Trial Expires:</span>
                <div>
                  <span>{new Date(trialStatus.expiresAt).toLocaleDateString()}</span>
                  {trialStatus.daysRemaining !== null && (
                    <span className="text-gray-500 ml-2">({trialStatus.daysRemaining} days remaining)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <h5 className="text-xl font-semibold mb-4">Usage Statistics</h5>
          <div className="space-y-4">
            {/* Properties */}
            {organization.limits.maxProperties !== null && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <HiHome className="h-4 w-4" /> Properties
                  </span>
                  <span>
                    {usageData?.propertyCount || 0} / {organization.limits.maxProperties}
                  </span>
                </div>
                <Progress
                  progress={Math.min(100, ((usageData?.propertyCount || 0) / organization.limits.maxProperties) * 100)}
                  color={limits?.exceededLimits?.includes('properties') ? 'failure' : 'blue'}
                />
              </div>
            )}

            {/* Tenants */}
            {organization.limits.maxTenants !== null && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <HiUserGroup className="h-4 w-4" /> Tenants
                  </span>
                  <span>
                    {usageData?.tenantCount || 0} / {organization.limits.maxTenants}
                  </span>
                </div>
                <Progress
                  progress={Math.min(100, ((usageData?.tenantCount || 0) / organization.limits.maxTenants) * 100)}
                  color={limits?.exceededLimits?.includes('tenants') ? 'failure' : 'blue'}
                />
              </div>
            )}

            {/* Users */}
            {organization.limits.maxUsers !== null && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <HiUser className="h-4 w-4" /> Users
                  </span>
                  <span>
                    {usageData?.userCount || 0} / {organization.limits.maxUsers}
                  </span>
                </div>
                <Progress
                  progress={Math.min(100, ((usageData?.userCount || 0) / organization.limits.maxUsers) * 100)}
                  color={limits?.exceededLimits?.includes('users') ? 'failure' : 'blue'}
                />
              </div>
            )}

            {/* Storage */}
            {organization.limits.maxStorageGB !== null && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <HiDatabase className="h-4 w-4" /> Storage
                  </span>
                  <span>
                    {usageData?.storageGB?.toFixed(2) || 0} GB / {organization.limits.maxStorageGB} GB
                  </span>
                </div>
                <Progress
                  progress={Math.min(100, ((usageData?.storageGB || 0) / organization.limits.maxStorageGB) * 100)}
                  color={limits?.exceededLimits?.includes('storage') ? 'failure' : 'blue'}
                />
              </div>
            )}

            {/* API Calls */}
            {organization.limits.maxApiCallsPerMonth !== null && apiStats && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <HiCode className="h-4 w-4" /> API Calls (Monthly)
                  </span>
                  <span>
                    {apiStats.count} / {organization.limits.maxApiCallsPerMonth}
                  </span>
                </div>
                <Progress
                  progress={Math.min(100, (apiStats.count / organization.limits.maxApiCallsPerMonth) * 100)}
                  color={apiStats.remaining === 0 ? 'failure' : 'blue'}
                />
                {apiStats.resetAt && (
                  <div className="text-sm text-gray-500 mt-1">
                    Resets on {new Date(apiStats.resetAt).toLocaleDateString()}
                  </div>
                )}
                {apiStats.remaining !== null && (
                  <div className="text-sm text-gray-500 mt-1">
                    {apiStats.remaining} calls remaining this month
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Plan Limits */}
      <Card>
        <h5 className="text-xl font-semibold mb-4">Plan Limits</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <HiHome className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">Max Properties</span>
            </div>
            <div className="text-2xl font-semibold">
              {organization.limits.maxProperties ?? 'Unlimited'}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <HiUserGroup className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">Max Tenants</span>
            </div>
            <div className="text-2xl font-semibold">
              {organization.limits.maxTenants ?? 'Unlimited'}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <HiUser className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">Max Users</span>
            </div>
            <div className="text-2xl font-semibold">
              {organization.limits.maxUsers ?? 'Unlimited'}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <HiDatabase className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">Max Storage</span>
            </div>
            <div className="text-2xl font-semibold">
              {organization.limits.maxStorageGB ? `${organization.limits.maxStorageGB} GB` : 'Unlimited'}
            </div>
          </div>
        </div>
      </Card>
    </PageLayout>
  );
}
