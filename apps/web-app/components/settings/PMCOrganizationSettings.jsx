"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Alert,
  Badge,
  Button,
  Spinner,
} from 'flowbite-react';
import {
  HiUserGroup,
  HiHome,
  HiUser,
} from 'react-icons/hi';
import FlowbiteStatistic from '../shared/FlowbiteStatistic';

export default function PMCOrganizationSettings({ pmcData }) {
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Debug: Log what we receive
    console.log('[PMCOrganizationSettings] Received pmcData:', pmcData);
    
    if (pmcData) {
      fetchUsageData();
    } else {
      console.warn('[PMCOrganizationSettings] pmcData is null or undefined');
    }
  }, [pmcData]);

  const fetchUsageData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch usage statistics for managed properties
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getOrganizationUsage();

      if (data.success) {
        setUsage(data.data);
      } else {
        // If API doesn't exist yet, set default usage
        setUsage({
          propertyCount: 0,
          tenantCount: 0,
          landlordCount: 0,
        });
      }
    } catch (err) {
      console.error('Error fetching usage data:', err);
      // Set default usage on error
      setUsage({
        propertyCount: 0,
        tenantCount: 0,
        landlordCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Create organization object from PMC data
  const organization = pmcData ? {
    name: pmcData.companyName,
    id: pmcData.id,
    companyId: pmcData.companyId,
    email: pmcData.email,
    phone: pmcData.phone,
    address: {
      addressLine1: pmcData.addressLine1,
      addressLine2: pmcData.addressLine2,
      city: pmcData.city,
      provinceState: pmcData.provinceState,
      postalZip: pmcData.postalZip,
      country: pmcData.country,
      countryCode: pmcData.countryCode,
      regionCode: pmcData.regionCode,
    },
    status: pmcData.isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: pmcData.createdAt,
    updatedAt: pmcData.updatedAt,
    plan: 'PMC', // PMC plan type
  } : null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { color: 'success', text: 'Active' },
      SUSPENDED: { color: 'failure', text: 'Suspended' },
      CANCELLED: { color: 'gray', text: 'Cancelled' },
      TRIAL: { color: 'warning', text: 'Trial' },
      INACTIVE: { color: 'gray', text: 'Inactive' },
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
      PMC: 'purple',
    };
    return <Badge color={planColors[plan] || 'gray'}>{plan}</Badge>;
  };

  if (loading && !pmcData) {
    return (
      <div className="text-center py-10">
        <Spinner size="xl" />
        <div className="mt-4 text-gray-600">Loading organization information...</div>
      </div>
    );
  }

  if (!organization || !pmcData) {
    return (
      <Alert
        color="failure"
        action={
          <Button size="sm" color="gray" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        }
      >
        <div>
          <h3 className="font-semibold">PMC Information Not Found</h3>
          <p className="text-sm mt-1">
            {error || 
              'Unable to load PMC company information. This may happen if the PMC record is not properly configured. Please contact support or refresh the page.'}
          </p>
        </div>
      </Alert>
    );
  }

  const usageData = usage || {};

  // Show status alerts
  const statusAlerts = [];
  if (organization.status === 'INACTIVE') {
    statusAlerts.push(
      <Alert
        key="inactive"
        color="warning"
        className="mb-4"
      >
        <div>
          <h3 className="font-semibold">PMC Account Inactive</h3>
          <p className="text-sm mt-1">Your PMC account is currently inactive. Please contact support for assistance.</p>
        </div>
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h4 className="text-lg font-semibold m-0">PMC Organization</h4>
          <p className="text-sm text-gray-500 mt-2">
            View your PMC company details and management statistics.
          </p>
        </div>
        <Button color="gray" onClick={fetchUsageData}>Refresh</Button>
      </div>

      {statusAlerts}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Organization Info */}
        <Card>
          <h5 className="text-lg font-semibold mb-4">Organization Information</h5>
          <div className="space-y-3">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Company Name</div>
              <div className="text-gray-900 dark:text-white">{organization.name}</div>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Company ID</div>
              <div>
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                  {organization.companyId}
                </code>
              </div>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</div>
              <div className="text-gray-900 dark:text-white">{organization.email}</div>
            </div>
            {organization.phone && (
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                <div className="text-gray-900 dark:text-white">{organization.phone}</div>
              </div>
            )}
            {organization.address?.addressLine1 && (
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</div>
                <div className="text-gray-900 dark:text-white">
                  <div>{organization.address.addressLine1}</div>
                  {organization.address.addressLine2 && (
                    <div>{organization.address.addressLine2}</div>
                  )}
                  <div>
                    {organization.address.city}
                    {organization.address.provinceState && `, ${organization.address.provinceState}`}
                    {organization.address.postalZip && ` ${organization.address.postalZip}`}
                  </div>
                  {organization.address.country && (
                    <div>{organization.address.country}</div>
                  )}
                </div>
              </div>
            )}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Plan</div>
              <div>{getPlanBadge(organization.plan)}</div>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
              <div>{getStatusBadge(organization.status)}</div>
            </div>
            {organization.createdAt && (
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created</div>
                <div className="text-gray-900 dark:text-white">
                  {typeof organization.createdAt === 'string' 
                    ? new Date(organization.createdAt).toLocaleDateString()
                    : organization.createdAt.toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Usage Statistics */}
        <div className="space-y-4">
          <Card>
            <h5 className="text-lg font-semibold mb-4">Usage Statistics</h5>
            <div className="space-y-6">
              {/* Managed Properties */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <HiHome className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Managed Properties</span>
                  </div>
                  <span className="text-sm font-semibold">{usageData?.propertyCount || 0}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Properties managed across all landlords
                </p>
              </div>

              {/* Managed Tenants */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <HiUserGroup className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Managed Tenants</span>
                  </div>
                  <span className="text-sm font-semibold">{usageData?.tenantCount || 0}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Tenants across all managed properties
                </p>
              </div>

              {/* Managed Landlords */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <HiUser className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Managed Landlords</span>
                  </div>
                  <span className="text-sm font-semibold">{usageData?.landlordCount || 0}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Landlords under management
                </p>
              </div>
            </div>
          </Card>

          {/* Management Overview */}
          <Card>
            <h5 className="text-lg font-semibold mb-4">Management Overview</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FlowbiteStatistic
                title="Properties Managed"
                value={usageData?.propertyCount || 0}
                prefix={<HiHome className="h-6 w-6" />}
              />
              <FlowbiteStatistic
                title="Tenants Managed"
                value={usageData?.tenantCount || 0}
                prefix={<HiUserGroup className="h-6 w-6" />}
              />
              <FlowbiteStatistic
                title="Landlords Managed"
                value={usageData?.landlordCount || 0}
                prefix={<HiUser className="h-6 w-6" />}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
