"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, Card, Spinner, Badge, Alert, Button } from 'flowbite-react';
import { PageLayout } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { renderStatus } from '@/components/shared/FlowbiteTableRenderers';
import { notify } from '@/lib/utils/notification-helper';
import {
  HiHome,
  HiUser,
  HiDocumentText,
  HiCog,
  HiRefresh,
  HiChartBar,
  HiOfficeBuilding,
  HiCurrencyDollar,
  HiArrowRight,
  HiCalendar,
  HiClock,
  HiCheckCircle,
  HiExclamation,
  HiPlus,
} from 'react-icons/hi';
import { usePortfolio, useProperties, useTenants, useLeases, useWorkOrders, useLandlords } from '@/lib/hooks/useDataQueries';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';

// Dynamically import charts
const OccupancyTrendsChart = dynamic(
  () => import('@/components/charts/OccupancyTrendsChart'),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-gray-500">Loading chart...</div> }
);

/**
 * Portfolio Component
 * 
 * Aggregates properties, tenants, leases, and vendors into a unified view
 * Respects RBAC and shows only data the user has access to
 * Enhanced with role-specific metrics, charts, and quick links
 */
export default function PortfolioClient({ userRole, user }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Normalize role
  const normalizedRole = useMemo(() => {
    if (userRole === 'admin' || userRole === 'SUPER_ADMIN') return 'super_admin';
    if (userRole === 'pmc' || userRole === 'property_manager') return 'pmc_admin';
    return userRole;
  }, [userRole]);

  // Fetch data using React Query hooks
  const { data: portfolioData, isLoading: portfolioLoading, refetch: refetchPortfolio } = usePortfolio(normalizedRole);
  const { data: workOrdersData, isLoading: workOrdersLoading } = useWorkOrders({ 
    status: 'New,In Progress,Pending',
    limit: 100 
  });
  const { data: leasesData } = useLeases({ limit: 100 });
  const { data: propertiesData } = useProperties({ limit: 100 });
  const { data: tenantsData } = useTenants({ limit: 100 });
  const { data: landlordsData } = useLandlords({ limit: 100 });

  // Extract stats from portfolio data
  const stats = portfolioData?.data?.stats;
  const portfolio = portfolioData?.data;

  // Calculate role-specific metrics
  const roleMetrics = useMemo(() => {
    if (!stats && !portfolio) return null;

    // Extract work orders from response - API returns { success: true, data: [...], pagination: {...} }
    const workOrders = workOrdersData?.data || workOrdersData?.maintenanceRequests || [];
    // Extract leases from response - API returns { success: true, data: [...], pagination: {...} }
    const leases = leasesData?.data || leasesData?.leases || [];

    switch (normalizedRole) {
      case 'super_admin':
        return {
          totalPMCs: landlordsData?.data?.pagination?.total || 0, // Approximate - would need PMC count
          totalLandlords: stats?.totalLandlords || 0,
          totalProperties: stats?.totalProperties || 0,
          occupancyRate: stats?.occupiedUnits && stats?.vacantUnits 
            ? Math.round((stats.occupiedUnits / (stats.occupiedUnits + stats.vacantUnits)) * 100)
            : 0,
          openWorkOrders: workOrders.length || 0,
        };
      
      case 'pmc_admin':
        return {
          propertiesUnderPMC: stats?.totalProperties || 0,
          occupancyRate: stats?.occupiedUnits && stats?.vacantUnits 
            ? Math.round((stats.occupiedUnits / (stats.occupiedUnits + stats.vacantUnits)) * 100)
            : 0,
          rentCollected: 0, // Would need financial API
          rentOutstanding: 0, // Would need financial API
          openWorkOrders: workOrders.length || 0,
        };
      
      case 'landlord':
        return {
          propertiesOwned: stats?.totalProperties || 0,
          occupancyRate: stats?.occupiedUnits && stats?.vacantUnits 
            ? Math.round((stats.occupiedUnits / (stats.occupiedUnits + stats.vacantUnits)) * 100)
            : 0,
          upcomingExpirations: leases.filter((lease) => {
            if (!lease.leaseEnd) return false;
            const endDate = dayjs(lease.leaseEnd);
            const daysUntilExpiry = endDate.diff(dayjs(), 'days');
            return daysUntilExpiry >= 0 && daysUntilExpiry <= 90;
          }).length || 0,
          openWorkOrders: workOrders.length || 0,
        };
      
      case 'pm':
        return {
          assignedProperties: stats?.totalProperties || 0,
          activeWorkOrders: workOrders.length || 0,
          upcomingMoveIns: leases.filter((lease) => {
            if (!lease.leaseStart) return false;
            const startDate = dayjs(lease.leaseStart);
            const daysUntilStart = startDate.diff(dayjs(), 'days');
            return daysUntilStart >= 0 && daysUntilStart <= 30;
          }).length || 0,
          upcomingMoveOuts: leases.filter((lease) => {
            if (!lease.leaseEnd) return false;
            const endDate = dayjs(lease.leaseEnd);
            const daysUntilEnd = endDate.diff(dayjs(), 'days');
            return daysUntilEnd >= 0 && daysUntilEnd <= 30;
          }).length || 0,
        };
      
      case 'tenant':
        const currentLease = leases.find((lease) => lease.status === 'Active');
        const nextRentDue = currentLease ? dayjs().add(1, 'month').format('MMM D, YYYY') : 'N/A';
        const tenantWorkOrders = workOrders.filter((wo) => wo.tenantId === user?.id || wo.requestedByTenantId === user?.id);
        return {
          currentLeaseSummary: currentLease ? `${currentLease.unit?.property?.propertyName || 'Property'} - ${currentLease.unit?.unitName || 'Unit'}` : 'No active lease',
          nextRentDue,
          monthlyRent: currentLease?.rentAmount || 0,
          openWorkOrders: tenantWorkOrders.length || 0,
        };
      
      case 'vendor':
        const assignedJobs = workOrders.filter((wo) => wo.assignedToProviderId === user?.id || wo.serviceProviderId === user?.id) || [];
        const jobsDueToday = assignedJobs.filter((job) => {
          if (!job.scheduledDate) return false;
          return dayjs(job.scheduledDate).isSame(dayjs(), 'day');
        }).length;
        const jobsDueThisWeek = assignedJobs.filter((job) => {
          if (!job.scheduledDate) return false;
          const jobDate = dayjs(job.scheduledDate);
          return jobDate.isAfter(dayjs()) && jobDate.isBefore(dayjs().add(7, 'days'));
        }).length;
        return {
          assignedJobs: assignedJobs.length,
          jobsDueToday,
          jobsDueThisWeek,
        };
      
      default:
        return null;
    }
  }, [normalizedRole, stats, portfolio, workOrdersData, leasesData, propertiesData, user]);

  // Role-specific quick links
  const quickLinks = useMemo(() => {
    const baseLinks = [];
    
    switch (normalizedRole) {
      case 'super_admin':
        baseLinks.push(
          { label: 'Manage PMCs', href: '/admin/users?role=pmc', icon: HiOfficeBuilding },
          { label: 'All Properties', href: '/properties', icon: HiHome },
          { label: 'System Settings', href: '/admin/settings', icon: HiCog },
        );
        break;
      
      case 'pmc_admin':
        baseLinks.push(
          { label: 'Properties', href: '/properties', icon: HiHome },
          { label: 'Tenants', href: '/tenants', icon: HiUser },
          { label: 'Work Orders', href: '/operations', icon: HiCog },
        );
        break;
      
      case 'landlord':
        baseLinks.push(
          { label: 'My Properties', href: '/properties', icon: HiHome },
          { label: 'Add Tenant', href: '/tenants?action=add', icon: HiPlus },
          { label: 'New Work Order', href: '/operations?action=add', icon: HiCog },
        );
        break;
      
      case 'pm':
        baseLinks.push(
          { label: 'Assigned Properties', href: '/properties', icon: HiHome },
          { label: 'Work Order Queue', href: '/operations', icon: HiCog },
          { label: 'Upcoming Move-ins', href: '/leases?filter=upcoming', icon: HiCalendar },
        );
        break;
      
      case 'tenant':
        baseLinks.push(
          { label: 'My Lease', href: '/leases', icon: HiDocumentText },
          { label: 'Submit Request', href: '/operations?action=add', icon: HiPlus },
          { label: 'Payment History', href: '/financials', icon: HiCurrencyDollar },
        );
        break;
      
      case 'vendor':
        baseLinks.push(
          { label: 'My Jobs', href: '/operations', icon: HiCog },
          { label: 'Job Details', href: '/operations?view=assigned', icon: HiChartBar },
        );
        break;
    }
    
    return baseLinks;
  }, [normalizedRole]);

  // Role-specific metric cards
  const MetricCards = () => {
    if (!roleMetrics) return null;

    const getMetricCards = () => {
      switch (normalizedRole) {
        case 'super_admin':
          return [
            { title: 'Total PMCs', value: roleMetrics.totalPMCs, icon: HiOfficeBuilding, color: 'blue' },
            { title: 'Total Landlords', value: roleMetrics.totalLandlords, icon: HiUser, color: 'purple' },
            { title: 'Total Properties', value: roleMetrics.totalProperties, icon: HiHome, color: 'green' },
            { title: 'Occupancy Rate', value: `${roleMetrics.occupancyRate}%`, icon: HiChartBar, color: 'indigo' },
            { title: 'Open Work Orders', value: roleMetrics.openWorkOrders, icon: HiCog, color: 'orange' },
          ];
        
        case 'pmc_admin':
          return [
            { title: 'Properties Under PMC', value: roleMetrics.propertiesUnderPMC, icon: HiHome, color: 'blue' },
            { title: 'Occupancy Rate', value: `${roleMetrics.occupancyRate}%`, icon: HiChartBar, color: 'green' },
            { title: 'Rent Collected', value: `$${roleMetrics.rentCollected.toLocaleString()}`, icon: HiCurrencyDollar, color: 'green' },
            { title: 'Rent Outstanding', value: `$${roleMetrics.rentOutstanding.toLocaleString()}`, icon: HiExclamation, color: 'red' },
            { title: 'Open Work Orders', value: roleMetrics.openWorkOrders, icon: HiCog, color: 'orange' },
          ];
        
        case 'landlord':
          return [
            { title: 'Properties Owned', value: roleMetrics.propertiesOwned, icon: HiHome, color: 'blue' },
            { title: 'Occupancy Rate', value: `${roleMetrics.occupancyRate}%`, icon: HiChartBar, color: 'green' },
            { title: 'Upcoming Expirations', value: roleMetrics.upcomingExpirations, icon: HiCalendar, color: 'yellow' },
            { title: 'Open Work Orders', value: roleMetrics.openWorkOrders, icon: HiCog, color: 'orange' },
          ];
        
        case 'pm':
          return [
            { title: 'Assigned Properties', value: roleMetrics.assignedProperties, icon: HiHome, color: 'blue' },
            { title: 'Active Work Orders', value: roleMetrics.activeWorkOrders, icon: HiCog, color: 'orange' },
            { title: 'Upcoming Move-ins', value: roleMetrics.upcomingMoveIns, icon: HiCalendar, color: 'green' },
            { title: 'Upcoming Move-outs', value: roleMetrics.upcomingMoveOuts, icon: HiCalendar, color: 'yellow' },
          ];
        
        case 'tenant':
          return [
            { title: 'Monthly Rent', value: `$${roleMetrics.monthlyRent.toLocaleString()}`, icon: HiCurrencyDollar, color: 'blue' },
            { title: 'Next Rent Due', value: roleMetrics.nextRentDue, icon: HiCalendar, color: 'purple' },
            { title: 'Open Work Orders', value: roleMetrics.openWorkOrders, icon: HiCog, color: 'orange' },
          ];
        
        case 'vendor':
          return [
            { title: 'Assigned Jobs', value: roleMetrics.assignedJobs, icon: HiCog, color: 'blue' },
            { title: 'Due Today', value: roleMetrics.jobsDueToday, icon: HiClock, color: 'red' },
            { title: 'Due This Week', value: roleMetrics.jobsDueThisWeek, icon: HiCalendar, color: 'yellow' },
          ];
        
        default:
          return [];
      }
    };

    const cards = getMetricCards();
    const colorClasses = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {cards.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className="p-4 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${colorClasses[metric.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  // Quick Links Section
  const QuickLinksSection = () => {
    if (quickLinks.length === 0) return null;

    return (
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map((link, idx) => {
            const Icon = link.icon;
            return (
              <Button
                key={idx}
                color="light"
                className="justify-start h-auto p-4"
                onClick={() => router.push(link.href)}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span>{link.label}</span>
                <HiArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            );
          })}
        </div>
      </Card>
    );
  };

  // Overview tab with role-specific content
  const OverviewTab = () => {
    if (!stats && !roleMetrics) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p>No statistics available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Role-specific metrics */}
        <MetricCards />

        {/* Quick Links */}
        <QuickLinksSection />

        {/* Charts Section */}
        {stats && (stats.occupiedUnits !== undefined || stats.vacantUnits !== undefined) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Occupancy Overview
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Occupied</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.occupiedUnits || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vacant</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.vacantUnits || 0}
                  </p>
                </div>
              </div>
              {stats.occupiedUnits && stats.vacantUnits && (
                <OccupancyTrendsChart 
                  data={[{
                    month: 'Current',
                    rate: Math.round((stats.occupiedUnits / (stats.occupiedUnits + stats.vacantUnits)) * 100)
                  }} 
                />
              )}
            </Card>

            {stats.totalMonthlyRent !== undefined && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Financial Summary
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Rent</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${(stats.totalMonthlyRent || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Annual Rent</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      ${(stats.totalAnnualRent || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tenant-specific lease summary */}
        {normalizedRole === 'tenant' && roleMetrics && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Lease Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Property</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {roleMetrics.currentLeaseSummary}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Next Rent Due</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {roleMetrics.nextRentDue}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Rent</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${roleMetrics.monthlyRent.toLocaleString()}
                </span>
              </div>
            </div>
            <Button 
              color="blue" 
              className="mt-4 w-full"
              onClick={() => router.push('/operations?action=add')}
            >
              <HiPlus className="h-4 w-4 mr-2" />
              Submit New Work Order
            </Button>
          </Card>
        )}

        {/* Vendor-specific job summary */}
        {normalizedRole === 'vendor' && roleMetrics && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Job Summary
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Jobs</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {roleMetrics.assignedJobs}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Due Today</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {roleMetrics.jobsDueToday}
                </p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Due This Week</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {roleMetrics.jobsDueThisWeek}
                </p>
              </div>
            </div>
            <Button 
              color="blue" 
              className="w-full"
              onClick={() => router.push('/operations?view=assigned')}
            >
              View Job Details
            </Button>
          </Card>
        )}
      </div>
    );
  };

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

    if (normalizedRole === 'super_admin' || normalizedRole === 'pmc_admin' || normalizedRole === 'pm') {
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

    if (normalizedRole === 'super_admin' || normalizedRole === 'pmc_admin' || normalizedRole === 'pm' || normalizedRole === 'landlord') {
      tabs.push({
        key: 'vendors',
        label: (
          <span className="flex items-center gap-2">
            <HiCog className="h-4 w-4" />
            Vendors
          </span>
        ),
      });
    }

    if (normalizedRole === 'tenant') {
      return tabs.filter((tab) => ['overview', 'leases', 'vendors'].includes(tab.key));
    }

    return tabs;
  }, [normalizedRole]);

  // Table columns
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

  if (portfolioLoading) {
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
        <Button color="gray" onClick={() => refetchPortfolio()} disabled={portfolioLoading}>
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
                  dataSource={portfolio?.properties?.data || [}
                  columns={propertyColumns}
                  loading={portfolioLoading}
                  rowKey="id"
                />
              )}
              {tab.key === 'tenants' && (
                <FlowbiteTable
                  dataSource={portfolio?.tenants?.data || [}
                  columns={tenantColumns}
                  loading={portfolioLoading}
                  rowKey="id"
                />
              )}
              {tab.key === 'leases' && (
                <FlowbiteTable
                  dataSource={portfolio?.leases?.data || [}
                  columns={leaseColumns}
                  loading={portfolioLoading}
                  rowKey="id"
                />
              )}
              {tab.key === 'landlords' && (
                <FlowbiteTable
                  dataSource={portfolio?.landlords?.data || [}
                  columns={landlordColumns}
                  loading={portfolioLoading}
                  rowKey="id"
                />
              )}
              {tab.key === 'vendors' && (
                <FlowbiteTable
                  dataSource={portfolio?.vendors?.data || [}
                  columns={vendorColumns}
                  loading={portfolioLoading}
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
