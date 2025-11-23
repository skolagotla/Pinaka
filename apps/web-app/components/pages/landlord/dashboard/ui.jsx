"use client";

import PMCDashboardWidget from '@/components/shared/PMCDashboardWidget';
import { useRouter } from "next/navigation";
import { useMemo, useCallback, useState, useEffect } from "react";
import { formatCurrency, getCurrencyFromCountry, formatAmount } from '@/lib/currency-utils';
import FlowbiteStatistic from '@/components/shared/FlowbiteStatistic';
import ActivityLogWidget from '@/components/shared/ActivityLogWidget';
import QuickStatsWidget from '@/components/shared/QuickStatsWidget';
import { formatDateShort } from '@/lib/utils/safe-date-formatter';
import { Card, Button, Badge, Alert, Progress, Avatar, Accordion, Table, Spinner } from 'flowbite-react';
import { IconButton, ActionButton } from '@/components/shared/buttons';
import PaymentTrendsChart from '@/components/charts/PaymentTrendsChart';
import OccupancyTrendsChart from '@/components/charts/OccupancyTrendsChart';
import {
  HiPlus,
  HiHome,
  HiViewGrid,
  HiUserGroup,
  HiDocumentText,
  HiTrendingUp,
  HiExclamation,
  HiCheckCircle,
  HiCog,
  HiCurrencyDollar,
  HiXCircle,
  HiClock,
  HiChartBar,
  HiPencil,
  HiArrowRight,
  HiRefresh,
} from 'react-icons/hi';

// Separate component for N4 Forms using FlowbiteStatistic
function N4FormsCard({ draftCount, servedCount }) {
  const total = draftCount + servedCount;
  const draftText = `${draftCount} draft${draftCount !== 1 ? 's' : ''}`;
  const servedText = `${servedCount} served`;
  const suffixText = `${draftText}, ${servedText}`;
  
  return (
    <Card>
      <FlowbiteStatistic
        title="N4 Forms"
        value={total}
        suffix={suffixText}
      />
    </Card>
  );
}

export default function LandlordDashboardClient({
  pmcName,
  landlordId,
  landlord,
  landlordCountry,
  stats,
  loading = false,
}) {
  const router = useRouter();
  const [organizationStatus, setOrganizationStatus] = useState(null);
  
  // Fetch organization status on mount
  useEffect(() => {
    (async () => {
      try {
        const { adminApi } = await import('@/lib/api/admin-api');
        const data = await adminApi.getOrganization();
        if (data.success && data.data?.organization) {
          setOrganizationStatus(data.data);
        }
      } catch (err) {
        console.error('Error fetching organization status:', err);
      }
    })();
  }, []);
  
  // Extract N4 form counts with explicit defaults to prevent stale data
  const draftCount = useMemo(() => stats?.n4FormsDraft ?? 0, [stats?.n4FormsDraft]);
  const servedCount = useMemo(() => stats?.n4FormsServed ?? 0, [stats?.n4FormsServed]);

  // Memoize currency calculations to avoid recalculation
  const currencyCalculations = useMemo(() => {
    const totalRent = Object.values(stats.rentByCurrency || {}).reduce((sum, val) => sum + val, 0);
    const paid = Object.values(stats.paidByCurrency || {}).reduce((sum, val) => sum + val, 0);
    const unpaid = Object.values(stats.unpaidByCurrency || {}).reduce((sum, val) => sum + val, 0);
    const overdue = Object.values(stats.overdueByCurrency || {}).reduce((sum, val) => sum + val, 0);
    const pendingAmount = Object.values(stats.unpaidByCurrency || {}).reduce((sum, val) => sum + val, 0);
    
    return {
      totalRent,
      paid,
      unpaid,
      overdue,
      pendingAmount,
    };
  }, [stats.rentByCurrency, stats.paidByCurrency, stats.unpaidByCurrency, stats.overdueByCurrency]);

  // Calculate actionable insights - Memoized with currency calculations
  const actionableInsights = useMemo(() => {
    const insights = [];
    
    // Overdue rent - highest priority
    if (stats.overdueRentAmount > 0) {
      const overdueCount = Object.keys(stats.overdueByCurrency).length;
      insights.push({
        priority: 1,
        type: 'failure',
        title: 'Overdue Rent Requires Action',
        description: `${Object.keys(stats.overdueByCurrency).map(curr => `$${formatAmount(stats.overdueByCurrency[curr])} ${curr}`).join(', ')} in overdue rent`,
        action: {
          label: 'Review Overdue Payments',
          onClick: () => router.push('/financials?tab=rent-payments&filter=overdue'),
        },
        count: overdueCount,
      });
    }

    // Pending payments due today or soon
    if (currencyCalculations.pendingAmount > 0 && stats.overdueRentAmount === 0) {
      insights.push({
        priority: 2,
        type: 'warning',
        title: 'Pending Payments',
        description: `${Object.keys(stats.unpaidByCurrency).map(curr => `$${formatAmount(stats.unpaidByCurrency[curr])} ${curr}`).join(', ')} pending`,
        action: {
          label: 'View Pending Payments',
          onClick: () => router.push('/financials?tab=rent-payments&filter=pending'),
        },
      });
    }

    // Leases expiring in 7 days (urgent)
    if (stats.leasesExpiringIn30Days > 0) {
      insights.push({
        priority: stats.leasesExpiringIn30Days <= 7 ? 2 : 3,
        type: stats.leasesExpiringIn30Days <= 7 ? 'warning' : 'info',
        title: 'Leases Expiring Soon',
        description: `${stats.leasesExpiringIn30Days} lease${stats.leasesExpiringIn30Days > 1 ? 's' : ''} expiring in next 30 days`,
        action: {
          label: 'Review Leases',
          onClick: () => router.push('/leases'),
        },
        count: stats.leasesExpiringIn30Days,
      });
    }

    // Vacant units for 30+ days
    const vacantFor30Days = stats.vacantUnitsDetails?.filter(unit => {
      const updatedAt = new Date(unit.updatedAt);
      const daysSince = Math.floor((new Date() - updatedAt) / (1000 * 60 * 60 * 24));
      return daysSince >= 30;
    }).length || 0;
    
    if (vacantFor30Days > 0) {
      insights.push({
        priority: 3,
        type: 'warning',
        title: 'Long-Term Vacancies',
        description: `${vacantFor30Days} unit${vacantFor30Days > 1 ? 's' : ''} vacant for 30+ days`,
        action: {
          label: 'View Vacant Units',
          onClick: () => router.push('/properties'),
        },
        count: vacantFor30Days,
      });
    }

    // Urgent maintenance (pending > 7 days)
    if (stats.pendingMaintenance > 0) {
      insights.push({
        priority: 4,
        type: 'info',
        title: 'Maintenance Requests',
        description: `${stats.pendingMaintenance} request${stats.pendingMaintenance > 1 ? 's' : ''} need attention`,
        action: {
          label: 'View Maintenance',
          onClick: () => router.push('/operations?tab=maintenance'),
        },
        count: stats.pendingMaintenance,
      });
    }

    return insights.sort((a, b) => a.priority - b.priority);
  }, [stats, router, currencyCalculations]);

  // Calculate collection rate breakdown - Use memoized currency calculations
  const collectionBreakdown = useMemo(() => {
    const { totalRent, paid, unpaid, overdue } = currencyCalculations;
    
    return {
      total: totalRent,
      paid,
      unpaid,
      overdue,
      collectionRate: totalRent > 0 ? ((paid / totalRent) * 100).toFixed(1) : 0,
    };
  }, [currencyCalculations]);

  // Helper to format currency for display (returns string, not JSX)
  const formatCurrencyValue = (currencyObj) => {
    const currencies = Object.keys(currencyObj || {});
    if (currencies.length === 0) return '$0.00';
    
    if (currencies.length === 1) {
      const currency = currencies[0];
      const amount = currencyObj[currency];
      return `$${formatAmount(amount)} ${currency}`;
    }
    
    return currencies.map(currency => `$${formatAmount(currencyObj[currency])} ${currency}`).join(', ');
  };

  // Quick actions - Memoized to prevent recreation on every render
  const quickActions = useMemo(() => [
    {
      key: 'add-property',
      label: 'Add Property',
      icon: <HiHome className="h-5 w-5" />,
      onClick: () => router.push('/properties'),
      primary: true,
    },
    {
      key: 'add-tenant',
      label: 'Add Tenant',
      icon: <HiUserGroup className="h-5 w-5" />,
      onClick: () => router.push('/tenants'),
    },
    {
      key: 'create-lease',
      label: 'Create Lease',
      icon: <HiDocumentText className="h-5 w-5" />,
      onClick: () => router.push('/leases'),
    },
    {
      key: 'record-payment',
      label: 'Record Payment',
      icon: <HiCurrencyDollar className="h-5 w-5" />,
      onClick: () => router.push('/financials?tab=rent-payments'),
    },
  ], [router]);

  // Chart data
  const paymentTrendsData = stats.paymentTrends && stats.paymentTrends.length > 0 ? stats.paymentTrends : null;
  const occupancyTrendsData = stats.occupancyTrends && stats.occupancyTrends.length > 0 ? stats.occupancyTrends : null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-32">
                <div className="h-20 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {pmcName && <PMCDashboardWidget pmcName={pmcName} landlordId={landlordId} />}
      
      {/* Header with Flowbite Pro styling */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <HiHome className="h-8 w-8 text-blue-600" />
            Welcome back, <span className="text-blue-600">{landlord.firstName}</span>!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Portfolio overview and actionable insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button color="light" size="sm" onClick={() => router.push('/analytics')}>
            <HiChartBar className="h-4 w-4 mr-1" />
            Analytics
          </Button>
          <IconButton
            icon={<HiRefresh className="h-5 w-5" />}
            onClick={() => window.location.reload()}
            tooltip="Refresh Dashboard"
          />
        </div>
      </div>

      {/* Organization Status Alerts */}
      {organizationStatus && (() => {
        const org = organizationStatus.organization;
        const trial = organizationStatus.trialStatus;
        const alerts = [];

        if (org?.status === 'SUSPENDED') {
          alerts.push(
            <Alert
              key="suspended"
              color="failure"
              className="rounded-lg"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Account Suspended</h3>
                  <p className="text-sm text-gray-600">Your organization account has been suspended. Please contact support for assistance.</p>
                </div>
                <Button size="sm" color="failure" onClick={() => router.push('/settings')}>
                  View Details
                </Button>
              </div>
            </Alert>
          );
        } else if (org?.status === 'CANCELLED') {
          alerts.push(
            <Alert
              key="cancelled"
              color="warning"
              className="rounded-lg"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Account Cancelled</h3>
                  <p className="text-sm text-gray-600">Your organization account has been cancelled. Please contact support to reactivate.</p>
                </div>
                <Button size="sm" color="warning" onClick={() => router.push('/settings')}>
                  View Details
                </Button>
              </div>
            </Alert>
          );
        } else if (trial?.hasTrial && trial.isExpired) {
          alerts.push(
            <Alert
              key="trial-expired"
              color="failure"
              className="rounded-lg"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Trial Expired</h3>
                  <p className="text-sm text-gray-600">Your trial period has ended. Please upgrade to a paid plan to continue using the service.</p>
                </div>
                <Button size="sm" color="blue" onClick={() => router.push('/settings')}>
                  Upgrade Plan
                </Button>
              </div>
            </Alert>
          );
        } else if (trial?.hasTrial && trial.daysRemaining !== null && trial.daysRemaining <= 3) {
          alerts.push(
            <Alert
              key="trial-warning"
              color="warning"
              className="rounded-lg"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Trial Ending Soon - {trial.daysRemaining} days remaining</h3>
                  <p className="text-sm text-gray-600">Your trial period ends on {trial.expiresAt?.toLocaleDateString()}. Please upgrade to avoid service interruption.</p>
                </div>
                <Button size="sm" color="blue" onClick={() => router.push('/settings')}>
                  Upgrade Now
                </Button>
              </div>
            </Alert>
          );
        }

        if (organizationStatus.limits && !organizationStatus.limits.withinLimits) {
          alerts.push(
            <Alert
              key="limits-exceeded"
              color="warning"
              className="rounded-lg"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Usage Limits Exceeded</h3>
                  <p className="text-sm text-gray-600">You have exceeded the following limits: {organizationStatus.limits.exceededLimits.join(', ')}. Please upgrade your plan.</p>
                </div>
                <Button size="sm" color="gray" onClick={() => router.push('/settings')}>
                  View Usage
                </Button>
              </div>
            </Alert>
          );
        }

        if (organizationStatus.apiStats && organizationStatus.apiStats.remaining !== null && organizationStatus.apiStats.remaining <= 100) {
          alerts.push(
            <Alert
              key="api-limit-warning"
              color="warning"
              className="rounded-lg"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">API Rate Limit Warning</h3>
                  <p className="text-sm text-gray-600">You have {organizationStatus.apiStats.remaining} API calls remaining this month. Limit resets on {organizationStatus.apiStats.resetAt?.toLocaleDateString()}.</p>
                </div>
                <Button size="sm" color="gray" onClick={() => router.push('/settings')}>
                  View Details
                </Button>
              </div>
            </Alert>
          );
        }

        return alerts.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Status</h2>
            <div className="space-y-4">
              {alerts}
            </div>
          </div>
        ) : null;
      })()}

      {/* Actionable Insights with Flowbite Pro enhanced styling */}
      {actionableInsights.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Action Required</h2>
            <Badge color="red" size="sm">{actionableInsights.length} items</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionableInsights.map((insight, index) => (
              <Card 
                key={index}
                className={`border-l-4 ${
                  insight.type === 'failure' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' :
                  insight.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                  'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
                } hover:shadow-lg transition-shadow duration-200`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {insight.type === 'failure' && <HiExclamation className="h-5 w-5 text-red-600" />}
                      {insight.type === 'warning' && <HiClock className="h-5 w-5 text-yellow-600" />}
                      {insight.type === 'info' && <HiCheckCircle className="h-5 w-5 text-blue-600" />}
                      <h3 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h3>
                      {insight.count && (
                        <Badge color={insight.type === 'failure' ? 'red' : insight.type === 'warning' ? 'yellow' : 'blue'} size="sm">
                          {insight.count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{insight.description}</p>
                    <ActionButton
                      action={insight.type === 'failure' ? 'add' : 'default'}
                      onClick={insight.action.onClick}
                      showText={true}
                      text={insight.action.label}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reminders & Alerts Section */}
      {(stats.upcomingRentReminders?.length > 0 || stats.leasesNeedingRenewalReminder?.length > 0 || stats.expiringDocuments?.length > 0) && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Reminders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.upcomingRentReminders && stats.upcomingRentReminders.length > 0 && (
              <Card className="h-full min-h-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <HiClock className="h-5 w-5" />
                    Rent Due in 3 Days
                  </h3>
                  <Badge color="warning">{stats.upcomingRentReminders.length}</Badge>
                </div>
                <div className="space-y-3">
                  {stats.upcomingRentReminders.slice(0, 3).map((payment) => {
                    const tenant = payment.lease.leaseTenants[0]?.tenant;
                    return (
                      <div key={payment.id} className="pb-3 border-b border-gray-200 last:border-b-0">
                        <p className="font-semibold text-gray-900">{tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Tenant'}</p>
                        <p className="text-xs text-gray-600">
                          {(() => {
                            const property = payment.lease.unit.property;
                            const propertyName = property.propertyName || property.addressLine1;
                            const actualUnitCount = property.units?.length || property.unitCount || 1;
                            if (actualUnitCount === 1) {
                              return propertyName;
                            }
                            const unitName = payment.lease.unit.unitName || '';
                            return unitName ? `${unitName} - ${propertyName}` : propertyName;
                          })()}
                        </p>
                        <p className="text-xs text-gray-600">
                          ${payment.amount.toFixed(2)} due {formatDateShort(payment.dueDate)}
                        </p>
                      </div>
                    );
                  })}
                  {stats.upcomingRentReminders.length > 3 && (
                    <ActionButton
                      action="view"
                      onClick={() => router.push('/financials?tab=rent-payments')}
                      showText={true}
                      text={`View all ${stats.upcomingRentReminders.length} reminders`}
                      className="mt-2"
                    />
                  )}
                </div>
              </Card>
            )}
            
            {stats.leasesNeedingRenewalReminder && stats.leasesNeedingRenewalReminder.length > 0 && (
              <Card className="h-full min-h-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <HiDocumentText className="h-5 w-5" />
                    Leases Expiring in 60 Days
                  </h3>
                  <Badge color="info">{stats.leasesNeedingRenewalReminder.length}</Badge>
                </div>
                <div className="space-y-3">
                  {stats.leasesNeedingRenewalReminder.slice(0, 3).map((lease) => {
                    const tenants = lease.leaseTenants.map(lt => `${lt.tenant.firstName} ${lt.tenant.lastName}`).join(', ');
                    const daysUntil = lease.leaseEnd ? Math.ceil((new Date(lease.leaseEnd) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                    return (
                      <div key={lease.id} className="pb-3 border-b border-gray-200 last:border-b-0">
                        <p className="font-semibold text-gray-900">{tenants}</p>
                        <p className="text-xs text-gray-600">
                          {(() => {
                            const property = lease.unit.property;
                            const propertyName = property.propertyName || property.addressLine1;
                            const actualUnitCount = property.units?.length || property.unitCount || 1;
                            if (actualUnitCount === 1) {
                              return propertyName;
                            }
                            const unitName = lease.unit.unitName || '';
                            return unitName ? `${unitName} - ${propertyName}` : propertyName;
                          })()}
                        </p>
                        <p className="text-xs text-gray-600">{daysUntil} days until expiry</p>
                      </div>
                    );
                  })}
                  {stats.leasesNeedingRenewalReminder.length > 3 && (
                    <ActionButton
                      action="view"
                      onClick={() => router.push('/leases')}
                      showText={true}
                      text={`View all ${stats.leasesNeedingRenewalReminder.length} leases`}
                      className="mt-2"
                    />
                  )}
                </div>
              </Card>
            )}
            
            {stats.expiringDocuments && stats.expiringDocuments.length > 0 && (
              <Card className="h-full min-h-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <HiExclamation className="h-5 w-5" />
                    Documents Expiring in 30 Days
                  </h3>
                  <Badge color="failure">{stats.expiringDocuments.length}</Badge>
                </div>
                <div className="space-y-3">
                  {stats.expiringDocuments.slice(0, 3).map((doc) => {
                    const daysUntil = doc.expirationDate ? Math.ceil((new Date(doc.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                    return (
                      <div key={doc.id} className="pb-3 border-b border-gray-200 last:border-b-0">
                        <p className="font-semibold text-gray-900">{doc.originalName || doc.fileName}</p>
                        <p className="text-xs text-gray-600">
                          {doc.tenant.firstName} {doc.tenant.lastName}
                        </p>
                        <p className="text-xs text-gray-600">{daysUntil} days until expiry</p>
                      </div>
                    );
                  })}
                  {stats.expiringDocuments.length > 3 && (
                    <ActionButton
                      action="view"
                      onClick={() => router.push('/library')}
                      showText={true}
                      text={`View all ${stats.expiringDocuments.length} documents`}
                      className="mt-2"
                    />
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions with Flowbite Pro enhanced styling */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          <Button color="light" size="sm" className="text-sm">
            View All
            <HiArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.key}
              className={`cursor-pointer hover:shadow-xl transition-all duration-200 border-2 ${
                action.primary 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-600' 
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              } group`}
              onClick={action.onClick}
            >
              <div className="flex flex-col items-center justify-center gap-3 h-20">
                <div className={`p-3 rounded-xl ${
                  action.primary 
                    ? 'bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60' 
                    : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                } transition-colors`}>
                  {action.icon}
                </div>
                <span className={`text-sm font-semibold ${
                  action.primary 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {action.label}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Key Metrics - Portfolio Overview with Flowbite Pro enhanced styling */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Portfolio Overview</h2>
        <Button color="light" size="sm" onClick={() => router.push('/portfolio')}>
          View Portfolio
          <HiArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card 
          className="cursor-pointer hover:shadow-xl transition-all duration-200 min-h-[180px] border-l-4 border-l-blue-500 group"
          onClick={() => router.push('/properties')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <HiHome className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <HiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <FlowbiteStatistic
            title="Properties & Units"
            value={`${stats.totalProperties} Properties`}
            suffix={`${stats.totalUnits} Units`}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            {stats.totalUnits - stats.vacantUnits} Occupied | {stats.vacantUnits} Vacant
          </p>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-xl transition-all duration-200 min-h-[180px] border-l-4 border-l-purple-500 group"
          onClick={() => router.push('/tenants')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <HiUserGroup className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <HiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <FlowbiteStatistic
            title="Tenants"
            value={stats.totalTenants}
            suffix="Total"
          />
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-xl transition-all duration-200 min-h-[180px] border-l-4 border-l-indigo-500 group"
          onClick={() => router.push('/leases')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
              <HiDocumentText className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <HiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <FlowbiteStatistic
            title="Leases"
            value={stats.activeLeases}
            suffix="Active"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            {stats.leasesExpiringIn30Days > 0 && `${stats.leasesExpiringIn30Days} expiring in 30 days`}
            {stats.leasesExpiringIn30Days === 0 && 'All leases active'}
          </p>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-xl transition-all duration-200 min-h-[180px] border-l-4 border-l-green-500 group"
          onClick={() => router.push('/financials?tab=rent-payments')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
              <HiCurrencyDollar className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <HiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
          <FlowbiteStatistic
            title="This Month's Rent"
            value={formatCurrencyValue(stats.rentByCurrency)}
          />
          <div className="mt-3">
            <Progress 
              progress={parseFloat(collectionBreakdown.collectionRate)} 
              color={parseFloat(collectionBreakdown.collectionRate) >= 90 ? 'green' : parseFloat(collectionBreakdown.collectionRate) >= 70 ? 'yellow' : 'red'}
              size="sm"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {collectionBreakdown.collectionRate}% collected
            </p>
          </div>
        </Card>
      </div>

      {/* Financial Summary */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Status</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow min-h-[140px] border-l-4 border-l-green-500"
          onClick={() => router.push('/financials?tab=rent-payments&filter=paid')}
        >
          <FlowbiteStatistic
            title="Rent Received"
            value={formatCurrencyValue(stats.paidByCurrency)}
            prefix={<HiCheckCircle className="h-6 w-6 text-green-600" />}
          />
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow min-h-[140px] border-l-4 border-l-yellow-500"
          onClick={() => router.push('/financials?tab=rent-payments&filter=pending')}
        >
          <FlowbiteStatistic
            title="Pending"
            value={formatCurrencyValue(stats.unpaidByCurrency)}
            prefix={<HiClock className="h-6 w-6 text-yellow-500" />}
          />
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow min-h-[140px] border-l-4 border-l-red-500"
          onClick={() => router.push('/financials?tab=rent-payments&filter=overdue')}
        >
          <FlowbiteStatistic
            title="Overdue"
            value={formatCurrencyValue(stats.overdueByCurrency)}
            prefix={<HiExclamation className="h-6 w-6 text-red-600" />}
          />
        </Card>
        <Card className="min-h-[140px]">
          <FlowbiteStatistic
            title="Collection Rate"
            value={collectionBreakdown.collectionRate}
            suffix="%"
            prefix={<HiTrendingUp className={`h-6 w-6 ${parseFloat(collectionBreakdown.collectionRate) >= 90 ? 'text-green-600' : 'text-yellow-500'}`} />}
          />
          <div className="mt-3">
            <Progress 
              progress={parseFloat(collectionBreakdown.collectionRate)} 
              color={parseFloat(collectionBreakdown.collectionRate) >= 90 ? 'green' : parseFloat(collectionBreakdown.collectionRate) >= 70 ? 'yellow' : 'red'}
              size="sm"
            />
          </div>
        </Card>
      </div>

      {/* Operations */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Operations</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow min-h-[140px]"
          onClick={() => router.push('/operations?tab=maintenance')}
        >
          <FlowbiteStatistic
            title="Maintenance Requests"
            value={stats.pendingMaintenance}
            suffix={`Open${stats.avgResolutionTime > 0 ? ` | Avg: ${stats.avgResolutionTime}d` : ''}`}
            prefix={<HiCog className={`h-6 w-6 ${stats.pendingMaintenance > 0 ? 'text-yellow-500' : 'text-green-600'}`} />}
          />
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow min-h-[140px]"
          onClick={() => router.push('/properties')}
        >
          <FlowbiteStatistic
            title="Occupancy Rate"
            value={stats.occupancyRate}
            suffix="%"
            prefix={<HiChartBar className={`h-6 w-6 ${parseFloat(stats.occupancyRate) >= 90 ? 'text-green-600' : parseFloat(stats.occupancyRate) >= 70 ? 'text-yellow-500' : 'text-red-600'}`} />}
          />
          <div className="mt-3">
            <Progress 
              progress={parseFloat(stats.occupancyRate)} 
              color={parseFloat(stats.occupancyRate) >= 90 ? 'green' : parseFloat(stats.occupancyRate) >= 70 ? 'yellow' : 'red'}
              size="sm"
            />
          </div>
        </Card>
        <Card className="min-h-[140px]">
          <FlowbiteStatistic
            title="Vacant Units"
            value={stats.vacantUnits}
            suffix={`of ${stats.totalUnits} total`}
            prefix={<HiViewGrid className={`h-6 w-6 ${stats.vacantUnits > 0 ? 'text-yellow-500' : 'text-green-600'}`} />}
          />
          {stats.vacantUnits > 0 && (
            <ActionButton
              action="view"
              size="small"
              onClick={() => router.push('/properties')}
              showText={true}
              text="View Vacant Units →"
              className="mt-3"
            />
          )}
        </Card>
      </div>

      {/* Urgent Leases */}
      {stats.leasesExpiringIn30Days > 0 && stats.upcomingLeaseExpirations && stats.upcomingLeaseExpirations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HiExclamation className="h-6 w-6 text-red-600" />
            Leases Expiring Within 30 Days
          </h2>
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <Table.Head>
                  <Table.HeadCell>Tenant</Table.HeadCell>
                  <Table.HeadCell>Property</Table.HeadCell>
                  <Table.HeadCell>Unit</Table.HeadCell>
                  <Table.HeadCell>Days Until Expiration</Table.HeadCell>
                  <Table.HeadCell>End Date</Table.HeadCell>
                  <Table.HeadCell>Action</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {stats.upcomingLeaseExpirations
                    .filter(lease => {
                      const daysUntilExpiration = Math.ceil((new Date(lease.leaseEnd) - new Date()) / (1000 * 60 * 60 * 24));
                      return daysUntilExpiration <= 30;
                    })
                    .map((lease, idx) => {
                      const daysUntil = Math.ceil((new Date(lease.leaseEnd) - new Date()) / (1000 * 60 * 60 * 24));
                      const tenant = lease.leaseTenants[0]?.tenant;
                      return (
                        <Table.Row key={lease.id || idx}>
                          <Table.Cell>{tenant ? `${tenant.firstName} ${tenant.lastName}` : 'N/A'}</Table.Cell>
                          <Table.Cell>{lease.unit.property.addressLine1}</Table.Cell>
                          <Table.Cell>{lease.unit.unitName}</Table.Cell>
                          <Table.Cell>
                            <Badge color={daysUntil <= 7 ? 'failure' : daysUntil <= 14 ? 'warning' : 'gray'}>
                              {daysUntil} days
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>{new Date(lease.leaseEnd).toLocaleDateString()}</Table.Cell>
                          <Table.Cell>
                            <ActionButton
                              action="view"
                              size="small"
                              onClick={() => router.push('/leases')}
                              showText={true}
                              text="Review →"
                            />
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                </Table.Body>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* More Insights - Collapsible */}
      <Accordion className="mb-8">
        <Accordion.Panel>
          <Accordion.Title className="text-xl font-semibold">
            More Insights & Analytics
          </Accordion.Title>
          <Accordion.Content>
            <div className="space-y-6">
              {/* Charts */}
              {(paymentTrendsData || occupancyTrendsData) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {paymentTrendsData && (
                    <Card>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rent Collection Trends (Last 6 Months)</h3>
                      <PaymentTrendsChart data={paymentTrendsData} />
                    </Card>
                  )}
                  {occupancyTrendsData && (
                    <Card>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Rate Trends (Last 6 Months)</h3>
                      <OccupancyTrendsChart data={occupancyTrendsData} />
                    </Card>
                  )}
                </div>
              )}

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card>
                  <FlowbiteStatistic
                    title="Portfolio Value"
                    value={stats.portfolioValue || 0}
                    prefix="$"
                    valueStyle={{ fontSize: '20px' }}
                  />
                </Card>
                <Card>
                  <FlowbiteStatistic
                    title="Expected Annual Income"
                    value={stats.expectedAnnualIncome || 0}
                    prefix="$"
                    valueStyle={{ fontSize: '20px' }}
                  />
                </Card>
                <Card>
                  <FlowbiteStatistic
                    title="Pending Invitations"
                    value={stats.pendingInvitations || 0}
                    suffix="tenants"
                  />
                </Card>
                <N4FormsCard draftCount={draftCount} servedCount={servedCount} />
                {stats.pendingApprovals !== undefined && (
                  <Card 
                    className={`cursor-pointer hover:shadow-lg transition-shadow ${stats.pendingApprovals > 0 ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}
                    onClick={() => router.push('/financials')}
                  >
                    <FlowbiteStatistic
                      title="Pending Approvals"
                      value={stats.pendingApprovals || 0}
                      suffix="requests"
                      prefix={<HiCheckCircle className={`h-6 w-6 ${stats.pendingApprovals > 0 ? 'text-red-600' : 'text-green-600'}`} />}
                    />
                  </Card>
                )}
              </div>
            </div>
          </Accordion.Content>
        </Accordion.Panel>
      </Accordion>

      {/* Activity Log & Quick Stats Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ActivityLogWidget limit={4} userRole="landlord" showViewAll={true} />
        <QuickStatsWidget
          title="Quick Stats"
          icon={<HiTrendingUp className="h-5 w-5" />}
          stats={[
            {
              label: 'Collection Rate',
              value: parseFloat(stats.collectionRate || 0),
              format: 'percent',
              color: parseFloat(stats.collectionRate) >= 90 ? '#3f8600' : parseFloat(stats.collectionRate) >= 70 ? '#faad14' : '#cf1322',
            },
            {
              label: 'Avg Resolution',
              value: parseFloat(stats.avgResolutionTime || 0),
              suffix: ' days',
              color: '#1890ff',
            },
            {
              label: 'Pending Maintenance',
              value: stats.pendingMaintenance || 0,
              color: stats.pendingMaintenance > 5 ? '#cf1322' : '#faad14',
            },
          ]}
        />
      </div>
    </div>
  );
}
