"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, Card, Spinner, Badge, Alert, Button } from 'flowbite-react';
import { PageLayout } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { renderStatus } from '@/components/shared/FlowbiteTableRenderers';
import { notify } from '@/lib/utils/notification-helper';
import { apiClient } from '@/lib/utils/api-client';
import {
  HiHome,
  HiUser,
  HiDocumentText,
  HiCog as HiWrench,
  HiRefresh,
  HiChartBar,
  HiOfficeBuilding,
} from 'react-icons/hi';

/**
 * Portfolio Component
 * 
 * Aggregates properties, tenants, leases, and vendors into a unified view
 * Respects RBAC and shows only data the user has access to
 */
export default function PortfolioClient({ userRole, user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState({
    properties: { data: [], pagination: { total: 0 } },
    tenants: { data: [], pagination: { total: 0 } },
    leases: { data: [], pagination: { total: 0 } },
    vendors: { data: [], pagination: { total: 0 } },
    landlords: { data: [], pagination: { total: 0 } },
    stats: null,
  });

  // Fetch portfolio summary
  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await apiClient('/api/v1/portfolio/summary?includeStats=true', {
        method: 'GET',
      });

      if (!response || !response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      const result = await response.json();
      console.log('[Portfolio] API Response:', result); // Debug log
      if (result.success && result.data) {
        // Handle nested structure: result.data.properties.data or result.data.properties
        const data = result.data;
        setPortfolioData({
          properties: data.properties?.data ? { data: data.properties.data, pagination: data.properties.pagination } : { data: data.properties || [], pagination: { total: 0 } },
          tenants: data.tenants?.data ? { data: data.tenants.data, pagination: data.tenants.pagination } : { data: data.tenants || [], pagination: { total: 0 } },
          leases: data.leases?.data ? { data: data.leases.data, pagination: data.leases.pagination } : { data: data.leases || [], pagination: { total: 0 } },
          vendors: data.vendors?.data ? { data: data.vendors.data, pagination: data.vendors.pagination } : { data: data.vendors || [], pagination: { total: 0 } },
          landlords: data.landlords?.data ? { data: data.landlords.data, pagination: data.landlords.pagination } : { data: data.landlords || [], pagination: { total: 0 } },
          stats: data.stats,
        });
      } else {
        throw new Error(result.error?.message || result.error || 'Failed to fetch portfolio data');
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      notify.error(error.message || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Determine visible tabs based on role
  const availableTabs = useMemo(() => {
    const tabs = [
      {
        key: 'overview',
        label: (
          <span className="flex items-center gap-2">
            <HiChartBar className="h-4 w-4" />
            Overview
          </span>
        ),
      },
      {
        key: 'properties',
        label: (
          <span className="flex items-center gap-2">
            <HiHome className="h-4 w-4" />
            Properties
          </span>
        ),
      },
    ];

    // Add landlords tab for admin and PMC (after properties)
    if (userRole === 'admin' || userRole === 'pmc') {
      tabs.push({
        key: 'landlords',
        label: (
          <span className="flex items-center gap-2">
            <HiOfficeBuilding className="h-4 w-4" />
            Landlords
          </span>
        ),
      });
    }

    // Add tenants, leases, and vendors tabs
    tabs.push(
      {
        key: 'tenants',
        label: (
          <span className="flex items-center gap-2">
            <HiUser className="h-4 w-4" />
            Tenants
          </span>
        ),
      },
      {
        key: 'leases',
        label: (
          <span className="flex items-center gap-2">
            <HiDocumentText className="h-4 w-4" />
            Leases
          </span>
        ),
      }
    );

    // Add vendors tab for admin, PMC, and landlord
    if (userRole === 'admin' || userRole === 'pmc' || userRole === 'landlord') {
      tabs.push({
        key: 'vendors',
        label: (
          <span className="flex items-center gap-2">
            <HiWrench className="h-4 w-4" />
            Vendors
          </span>
        ),
      });
    }

    // Tenant: Only show overview, leases, and vendors (assigned vendors)
    if (userRole === 'tenant') {
      return tabs.filter((tab) => ['overview', 'leases', 'vendors'].includes(tab.key));
    }

    return tabs;
  }, [userRole]);

  // Overview tab content
  const OverviewTab = () => {
    const { stats } = portfolioData;

    if (!stats) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p>No statistics available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalProperties || 0}
                </p>
              </div>
              <HiHome className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalTenants || 0}
                </p>
              </div>
              <HiUser className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Leases</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.activeLeases || 0}
                </p>
              </div>
              <HiDocumentText className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalVendors || 0}
                </p>
              </div>
              <HiWrench className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
          {stats.totalLandlords !== undefined && (
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Landlords</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalLandlords || 0}
                  </p>
                </div>
                <HiOfficeBuilding className="h-8 w-8 text-indigo-500" />
              </div>
            </Card>
          )}
        </div>

        {stats.occupiedUnits !== undefined && stats.vacantUnits !== undefined && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Occupied Units</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.occupiedUnits || 0}
                  </p>
                </div>
                <Badge color="success">Occupied</Badge>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Vacant Units</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.vacantUnits || 0}
                  </p>
                </div>
                <Badge color="warning">Vacant</Badge>
              </div>
            </Card>
          </div>
        )}

        {stats.totalMonthlyRent !== undefined && (
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Financial Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Rent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${(stats.totalMonthlyRent || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Annual Rent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${(stats.totalAnnualRent || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };

  // Properties tab columns
  const propertyColumns = [
    {
      title: 'Property Name',
      dataIndex: 'propertyName',
      key: 'propertyName',
    },
    {
      title: 'Address',
      dataIndex: 'addressLine1',
      key: 'addressLine1',
      render: (text, record) => (
        <span>
          {text}
          {record.city && `, ${record.city}`}
          {record.postalZip && ` ${record.postalZip}`}
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'propertyType',
      key: 'propertyType',
    },
    {
      title: 'Status',
      dataIndex: 'rentedStatus',
      key: 'rentedStatus',
      render: (value) => renderStatus(value),
    },
  ];

  // Tenants tab columns
  const tenantColumns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (text, record) => `${record.firstName || ''} ${record.lastName || ''}`.trim(),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value) => renderStatus(value),
    },
  ];

  // Leases tab columns
  const leaseColumns = [
    {
      title: 'Property',
      dataIndex: 'unit',
      key: 'property',
      render: (unit) => unit?.property?.propertyName || 'N/A',
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      render: (unit) => unit?.unitNumber || 'N/A',
    },
    {
      title: 'Start Date',
      dataIndex: 'leaseStart',
      key: 'leaseStart',
      render: (date) => (date ? new Date(date).toLocaleDateString() : 'N/A'),
    },
    {
      title: 'End Date',
      dataIndex: 'leaseEnd',
      key: 'leaseEnd',
      render: (date) => (date ? new Date(date).toLocaleDateString() : 'N/A'),
    },
    {
      title: 'Monthly Rent',
      dataIndex: 'rentAmount',
      key: 'rentAmount',
      render: (value) => (value ? `$${Number(value).toLocaleString()}` : 'N/A'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value) => renderStatus(value),
    },
  ];

  // Landlords tab columns
  const landlordColumns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (text, record) => `${record.firstName || ''} ${record.lastName || ''}`.trim(),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      render: (value) => renderStatus(value),
    },
  ];

  // Vendors tab columns
  const vendorColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Business Name',
      dataIndex: 'businessName',
      key: 'businessName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (value) => (
        <Badge color={value ? 'success' : 'failure'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <PageLayout headerTitle="Portfolio">
        <div className="flex justify-center items-center py-12">
          <Spinner size="xl" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      headerTitle="Portfolio"
      headerActions={
        <Button color="gray" onClick={fetchPortfolio} disabled={loading}>
          <HiRefresh className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      }
    >
      <Tabs aria-label="Portfolio tabs" onActiveTabChange={setActiveTab}>
        {availableTabs.map((tab) => (
          <Tabs.Item key={tab.key} active={activeTab === tab.key} title={tab.label}>
            <div className="mt-4">
              {tab.key === 'overview' && <OverviewTab />}
              {tab.key === 'properties' && (
                <FlowbiteTable
                  dataSource={portfolioData.properties?.data || portfolioData.properties || []}
                  columns={propertyColumns}
                  loading={loading}
                  rowKey="id"
                />
              )}
              {tab.key === 'tenants' && (
                <FlowbiteTable
                  dataSource={portfolioData.tenants?.data || portfolioData.tenants || []}
                  columns={tenantColumns}
                  loading={loading}
                  rowKey="id"
                />
              )}
              {tab.key === 'leases' && (
                <FlowbiteTable
                  dataSource={portfolioData.leases?.data || portfolioData.leases || []}
                  columns={leaseColumns}
                  loading={loading}
                  rowKey="id"
                />
              )}
              {tab.key === 'landlords' && (
                <FlowbiteTable
                  dataSource={portfolioData.landlords?.data || portfolioData.landlords || []}
                  columns={landlordColumns}
                  loading={loading}
                  rowKey="id"
                />
              )}
              {tab.key === 'vendors' && (
                <FlowbiteTable
                  dataSource={portfolioData.vendors?.data || portfolioData.vendors || []}
                  columns={vendorColumns}
                  loading={loading}
                  rowKey="id"
                />
              )}
            </div>
          </Tabs.Item>
        ))}
      </Tabs>
    </PageLayout>
  );
}

