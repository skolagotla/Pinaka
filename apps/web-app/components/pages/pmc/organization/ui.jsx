"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Alert,
  Badge,
  Spinner,
} from 'flowbite-react';
import {
  HiUserGroup,
  HiHome,
  HiUser,
  HiRefresh,
  HiBanknotes,
  HiExclamationTriangle,
} from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { safeJsonParse } from '@/lib/utils/safe-json-parser';
import { PageLayout, LoadingWrapper } from '@/components/shared';
import { useLoading } from '@/lib/hooks/useLoading';

export default function PMCOrganizationClient({ user, pmcData }) {
  const router = useRouter();
  const { loading, withLoading } = useLoading();
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pmcData) {
      fetchUsageData();
    }
  }, [pmcData]);

  const fetchUsageData = async () => {
    await withLoading(async () => {
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
      }
    });
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
    // PMC-specific limits (can be customized later)
    limits: {
      maxProperties: null, // Unlimited for PMCs
      maxTenants: null,
      maxUsers: null,
      maxStorageGB: null,
      maxApiCallsPerMonth: null,
    },
    plan: 'PMC', // PMC plan type
  } : null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { color: 'success', text: 'Active' },
      SUSPENDED: { color: 'failure', text: 'Suspended' },
      CANCELLED: { color: 'gray', text: 'Cancelled' },
      TRIAL: { color: 'warning', text: 'Trial' },
      INACTIVE: { color: 'warning', text: 'Inactive' },
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
      PMC: 'blue',
    };
    return <Badge color={planColors[plan] || 'gray'}plan}</Badge>;
  };

  if (loading) {
    return (
      <PageLayout headerTitle={<><HiBanknotes className="inline mr-2" /> PMC Organization</>}>
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner size="xl" />
        </div>
      </PageLayout>
    );
  }

  if (!organization || !pmcData) {
    return (
      <PageLayout headerTitle={<><HiBanknotes className="inline mr-2" /> PMC Organization</>}>
        <Alert color="failure">
          <div>
            <div className="font-semibold mb-2">PMC Information Not Found</div>
            <div>{error || 'Unable to load PMC company information. Please contact support.'}</div>
          </div>
        </Alert>
      </PageLayout>
    );
  }

  const usageData = usage || {};
  const limits = { withinLimits: true, exceededLimits: [] };

  // Show status alerts
  const statusAlerts = [];
  if (organization.status === 'INACTIVE') {
    statusAlerts.push(
      <Alert
        key="inactive"
        color="warning"
        icon={HiExclamationTriangle}
        className="mb-4"
      >
        <div>
          <div className="font-semibold mb-2">PMC Account Inactive</div>
          <div>Your PMC account is currently inactive. Please contact support for assistance.</div>
        </div>
      </Alert>
    );
  }

  return (
    <PageLayout
      headerTitle={<><HiBanknotes className="inline mr-2" /> PMC Organization</>}
      headerActions={
        <Button key="refresh" onClick={fetchUsageData} disabled={loading}>
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
              <span className="font-medium">Company Name:</span>
              <span>{organization.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Company ID:</span>
              <code className="px-2 py-1 bg-gray-100 rounded">{organization.companyId}</code>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{organization.email}</span>
            </div>
            {organization.phone && (
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <span>{organization.phone}</span>
              </div>
            )}
            {organization.address?.addressLine1 && (
              <div className="flex justify-between">
                <span className="font-medium">Address:</span>
                <div className="text-right">
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
            <div className="flex justify-between">
              <span className="font-medium">Plan:</span>
              {getPlanBadge(organization.plan)}
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              {getStatusBadge(organization.status)}
            </div>
            {organization.createdAt && (
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span>
                  {typeof organization.createdAt === 'string' 
                    ? new Date(organization.createdAt).toLocaleDateString()
                    : organization.createdAt.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <h5 className="text-xl font-semibold mb-4">Usage Statistics</h5>
          <div className="space-y-4">
            {/* Managed Properties */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="flex items-center gap-2">
                  <HiHome className="h-4 w-4" /> Managed Properties
                </span>
                <span className="font-semibold">{usageData?.propertyCount || 0}</span>
              </div>
              <div className="text-sm text-gray-500">
                Properties managed across all landlords
              </div>
            </div>

            {/* Managed Tenants */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="flex items-center gap-2">
                  <HiUserGroup className="h-4 w-4" /> Managed Tenants
                </span>
                <span className="font-semibold">{usageData?.tenantCount || 0}</span>
              </div>
              <div className="text-sm text-gray-500">
                Tenants across all managed properties
              </div>
            </div>

            {/* Managed Landlords */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="flex items-center gap-2">
                  <HiUser className="h-4 w-4" /> Managed Landlords
                </span>
                <span className="font-semibold">{usageData?.landlordCount || 0}</span>
              </div>
              <div className="text-sm text-gray-500">
                Landlords under management
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Management Statistics */}
      <Card>
        <h5 className="text-xl font-semibold mb-4">Management Overview</h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <HiHome className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">Properties Managed</span>
            </div>
            <div className="text-2xl font-semibold">
              {usageData?.propertyCount || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <HiUserGroup className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">Tenants Managed</span>
            </div>
            <div className="text-2xl font-semibold">
              {usageData?.tenantCount || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <HiUser className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">Landlords Managed</span>
            </div>
            <div className="text-2xl font-semibold">
              {usageData?.landlordCount || 0}
            </div>
          </div>
        </div>
      </Card>
    </PageLayout>
  );
}
