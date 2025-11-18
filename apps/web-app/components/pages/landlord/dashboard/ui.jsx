"use client";

import PMCDashboardWidget from '@/components/shared/PMCDashboardWidget';
import { useRouter } from "next/navigation";
import { useMemo, useCallback, useState, useEffect } from "react";
import { formatCurrency, getCurrencyFromCountry, formatAmount } from '@/lib/currency-utils';
import SafeStatistic from '@/components/shared/SafeStatistic';
import ActivityLogWidget from '@/components/shared/ActivityLogWidget';
import QuickStatsWidget from '@/components/shared/QuickStatsWidget';
import dayjs from 'dayjs';
import { formatDateShort } from '@/lib/utils/safe-date-formatter';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
  Avatar,
  Tag,
  Progress,
  Divider,
  Alert,
  Skeleton,
  Table,
  Tooltip,
  Collapse,
} from 'antd';
import { IconButton, ActionButton } from '@/components/shared/buttons';
// Lazy load ProCard to reduce initial bundle size
import { ProCard } from '@/components/shared/LazyProComponents';
// Dynamic imports for charts to reduce initial bundle size
import dynamic from 'next/dynamic';
const Line = dynamic(() => import('@ant-design/charts').then(mod => mod.Line), { ssr: false });
const Bar = dynamic(() => import('@ant-design/charts').then(mod => mod.Bar), { ssr: false });
import {
  PlusOutlined,
  HomeOutlined,
  AppstoreOutlined,
  TeamOutlined,
  FileTextOutlined,
  RiseOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  DollarOutlined,
  WalletOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  EditOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Separate component for N4 Forms using SafeStatistic to prevent caching
function N4FormsCard({ draftCount, servedCount }) {
  const total = draftCount + servedCount;
  const draftText = `${draftCount} draft${draftCount !== 1 ? 's' : ''}`;
  const servedText = `${servedCount} served`;
  const suffixText = `${draftText}, ${servedText}`;
  
  return (
    <ProCard>
      <SafeStatistic
        title="N4 Forms"
        value={total}
        suffix={suffixText}
      />
    </ProCard>
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
    fetch('/api/organizations/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.organization) {
          setOrganizationStatus(data.data);
        }
      })
      .catch(err => console.error('Error fetching organization status:', err));
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
        type: 'error',
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
  }, [stats]);

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

  // Helper to render currency breakdown as JSX (for custom displays) - Memoized
  const renderCurrencyBreakdown = useCallback((currencyObj) => {
    const currencies = Object.keys(currencyObj || {});
    if (currencies.length === 0) return '$0.00';
    
    if (currencies.length === 1) {
      const currency = currencies[0];
      const amount = currencyObj[currency];
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>
            ${formatAmount(amount)}
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {currency}
          </Text>
        </div>
      );
    }
    
    return (
      <Space direction="vertical" size={0} style={{ width: '100%' }}>
        {currencies.map((currency) => (
          <div key={currency} style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center' }}>
            <Text style={{ fontSize: '20px', fontWeight: 700 }}>
              ${formatAmount(currencyObj[currency])}
            </Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {currency}
            </Text>
          </div>
        ))}
      </Space>
    );
  }, []);

  // Quick actions - Memoized to prevent recreation on every render
  // Order: Add Property, Add Tenant, Create Lease, Record Payment
  const quickActions = useMemo(() => [
    {
      key: 'add-property',
      label: 'Add Property',
      icon: <HomeOutlined />,
      onClick: () => router.push('/properties'),
      primary: true,
    },
    {
      key: 'add-tenant',
      label: 'Add Tenant',
      icon: <TeamOutlined />,
      onClick: () => router.push('/tenants'),
    },
    {
      key: 'create-lease',
      label: 'Create Lease',
      icon: <FileTextOutlined />,
      onClick: () => router.push('/leases'),
    },
    {
      key: 'record-payment',
      label: 'Record Payment',
      icon: <DollarOutlined />,
      onClick: () => router.push('/financials?tab=rent-payments'),
    },
  ], [router]);

  // Chart configurations - Memoized to prevent recreation on every render
  const paymentTrendsConfig = useMemo(() => {
    if (!stats.paymentTrends || stats.paymentTrends.length === 0) return null;
    return {
      data: stats.paymentTrends,
      xField: 'month',
      yField: 'amount',
      smooth: true,
      color: '#1890ff',
      point: {
        size: 4,
        shape: 'circle',
      },
      xAxis: {
        title: {
          text: 'Month',
          style: { fontSize: 12 },
        },
      },
      yAxis: {
        title: {
          text: 'Rent Collected ($)',
          style: { fontSize: 12 },
        },
        label: {
          formatter: (v) => {
            const val = parseFloat(v) || 0;
            return `$${(val / 1000).toFixed(0)}K`;
          },
        },
      },
    };
  }, [stats.paymentTrends]);

  const occupancyTrendsConfig = useMemo(() => {
    if (!stats.occupancyTrends || stats.occupancyTrends.length === 0) return null;
    return {
      data: stats.occupancyTrends,
      xField: 'month',
      yField: 'rate',
      color: '#52c41a',
      xAxis: {
        title: {
          text: 'Month',
          style: { fontSize: 12 },
        },
      },
      yAxis: {
        title: {
          text: 'Occupancy Rate (%)',
          style: { fontSize: 12 },
        },
        max: 100,
      },
    };
  }, [stats.occupancyTrends]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 32 }} />
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          {[1, 2, 3].map(i => (
            <Col xs={24} sm={12} md={8} key={i}>
              <ProCard>
                <Skeleton active />
              </ProCard>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
      {pmcName && <PMCDashboardWidget pmcName={pmcName} landlordId={landlordId} />}
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            Welcome back, {landlord.firstName}!
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Portfolio overview and actionable insights
          </Text>
        </div>
        <IconButton
          icon={<ReloadOutlined />}
          onClick={() => window.location.reload()}
          tooltip="Refresh Dashboard"
        />
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
              message="Account Suspended"
              description="Your organization account has been suspended. Please contact support for assistance."
              type="error"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
              action={
                <Button size="small" onClick={() => router.push('/settings')}>
                  View Details
                </Button>
              }
            />
          );
        } else if (org?.status === 'CANCELLED') {
          alerts.push(
            <Alert
              key="cancelled"
              message="Account Cancelled"
              description="Your organization account has been cancelled. Please contact support to reactivate."
              type="warning"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
              action={
                <Button size="small" onClick={() => router.push('/settings')}>
                  View Details
                </Button>
              }
            />
          );
        } else if (trial?.hasTrial && trial.isExpired) {
          alerts.push(
            <Alert
              key="trial-expired"
              message="Trial Expired"
              description="Your trial period has ended. Please upgrade to a paid plan to continue using the service."
              type="error"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
              action={
                <Button size="small" type="primary" onClick={() => router.push('/settings')}>
                  Upgrade Plan
                </Button>
              }
            />
          );
        } else if (trial?.hasTrial && trial.daysRemaining !== null && trial.daysRemaining <= 3) {
          alerts.push(
            <Alert
              key="trial-warning"
              message={`Trial Ending Soon - ${trial.daysRemaining} days remaining`}
              description={`Your trial period ends on ${trial.expiresAt?.toLocaleDateString()}. Please upgrade to avoid service interruption.`}
              type="warning"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
              action={
                <Button size="small" type="primary" onClick={() => router.push('/settings')}>
                  Upgrade Now
                </Button>
              }
            />
          );
        }

        if (organizationStatus.limits && !organizationStatus.limits.withinLimits) {
          alerts.push(
            <Alert
              key="limits-exceeded"
              message="Usage Limits Exceeded"
              description={`You have exceeded the following limits: ${organizationStatus.limits.exceededLimits.join(', ')}. Please upgrade your plan.`}
              type="warning"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
              action={
                <Button size="small" onClick={() => router.push('/settings')}>
                  View Usage
                </Button>
              }
            />
          );
        }

        if (organizationStatus.apiStats && organizationStatus.apiStats.remaining !== null && organizationStatus.apiStats.remaining <= 100) {
          alerts.push(
            <Alert
              key="api-limit-warning"
              message="API Rate Limit Warning"
              description={`You have ${organizationStatus.apiStats.remaining} API calls remaining this month. Limit resets on ${organizationStatus.apiStats.resetAt?.toLocaleDateString()}.`}
              type="warning"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
              action={
                <Button size="small" onClick={() => router.push('/settings')}>
                  View Details
                </Button>
              }
            />
          );
        }

        return alerts.length > 0 ? (
          <div style={{ marginBottom: 32 }}>
            <Title level={4} style={{ marginBottom: 16 }}>
              Account Status
            </Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {alerts}
            </Space>
          </div>
        ) : null;
      })()}

      {/* Actionable Insights - Only show if there are items requiring action */}
      {actionableInsights.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            Action Required
          </Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {actionableInsights.map((insight, index) => (
              <Alert
                key={index}
                message={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>
                        {insight.title}
                      </Text>
                      <Text type="secondary">{insight.description}</Text>
                    </div>
                    <ActionButton
                      action={insight.type === 'error' ? 'add' : 'default'}
                      onClick={insight.action.onClick}
                      icon={<ArrowRightOutlined />}
                      showText={true}
                      text={insight.action.label}
                    />
                  </div>
                }
                type={insight.type}
                showIcon
                style={{ borderRadius: 8 }}
              />
            ))}
          </Space>
        </div>
      )}

      {/* Reminders & Alerts Section */}
      {(stats.upcomingRentReminders?.length > 0 || stats.leasesNeedingRenewalReminder?.length > 0 || stats.expiringDocuments?.length > 0) && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            Upcoming Reminders
          </Title>
          <Row gutter={16}>
            {stats.upcomingRentReminders && stats.upcomingRentReminders.length > 0 && (
              <Col xs={24} md={8}>
                <ProCard 
                  title={<><ClockCircleOutlined /> Rent Due in 3 Days</>}
                  extra={<Tag color="orange">{stats.upcomingRentReminders.length}</Tag>}
                  style={{ height: '100%', minHeight: '280px' }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {stats.upcomingRentReminders.slice(0, 3).map((payment) => {
                      const tenant = payment.lease.leaseTenants[0]?.tenant;
                      return (
                        <div key={payment.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <Text strong>{tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Tenant'}</Text>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {(() => {
                              const property = payment.lease.unit.property;
                              const propertyName = property.propertyName || property.addressLine1;
                              // Use actual unit count from property.units if available, otherwise fallback to unitCount
                              const actualUnitCount = property.units?.length || property.unitCount || 1;
                              if (actualUnitCount === 1) {
                                return propertyName;
                              }
                              const unitName = payment.lease.unit.unitName || '';
                              return unitName ? `${unitName} - ${propertyName}` : propertyName;
                            })()}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            ${payment.amount.toFixed(2)} due {formatDateShort(payment.dueDate)}
                          </div>
                        </div>
                      );
                    })}
                    {stats.upcomingRentReminders.length > 3 && (
                      <ActionButton
                        action="view"
                        onClick={() => router.push('/financials?tab=rent-payments')}
                        showText={true}
                        text={`View all ${stats.upcomingRentReminders.length} reminders`}
                        style={{ padding: 0, height: 'auto' }}
                      />
                    )}
                  </Space>
                </ProCard>
              </Col>
            )}
            
            {stats.leasesNeedingRenewalReminder && stats.leasesNeedingRenewalReminder.length > 0 && (
              <Col xs={24} md={8}>
                <ProCard 
                  title={<><FileTextOutlined /> Leases Expiring in 60 Days</>}
                  extra={<Tag color="blue">{stats.leasesNeedingRenewalReminder.length}</Tag>}
                  style={{ height: '100%', minHeight: '280px' }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {stats.leasesNeedingRenewalReminder.slice(0, 3).map((lease) => {
                      const tenants = lease.leaseTenants.map(lt => `${lt.tenant.firstName} ${lt.tenant.lastName}`).join(', ');
                      const daysUntil = lease.leaseEnd ? Math.ceil((new Date(lease.leaseEnd) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                      return (
                        <div key={lease.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <Text strong>{tenants}</Text>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {(() => {
                              const property = lease.unit.property;
                              const propertyName = property.propertyName || property.addressLine1;
                              // Use actual unit count from property.units if available, otherwise fallback to unitCount
                              const actualUnitCount = property.units?.length || property.unitCount || 1;
                              if (actualUnitCount === 1) {
                                return propertyName;
                              }
                              const unitName = lease.unit.unitName || '';
                              return unitName ? `${unitName} - ${propertyName}` : propertyName;
                            })()}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {daysUntil} days until expiry
                          </div>
                        </div>
                      );
                    })}
                    {stats.leasesNeedingRenewalReminder.length > 3 && (
                      <ActionButton
                        action="view"
                        onClick={() => router.push('/leases')}
                        showText={true}
                        text={`View all ${stats.leasesNeedingRenewalReminder.length} leases`}
                        style={{ padding: 0, height: 'auto' }}
                      />
                    )}
                  </Space>
                </ProCard>
              </Col>
            )}
            
            {stats.expiringDocuments && stats.expiringDocuments.length > 0 && (
              <Col xs={24} md={8}>
                <ProCard 
                  title={<><WarningOutlined /> Documents Expiring in 30 Days</>}
                  extra={<Tag color="red">{stats.expiringDocuments.length}</Tag>}
                  style={{ height: '100%', minHeight: '280px' }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {stats.expiringDocuments.slice(0, 3).map((doc) => {
                      const daysUntil = doc.expirationDate ? Math.ceil((new Date(doc.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                      return (
                        <div key={doc.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <Text strong>{doc.originalName || doc.fileName}</Text>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {doc.tenant.firstName} {doc.tenant.lastName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {daysUntil} days until expiry
                          </div>
                        </div>
                      );
                    })}
                    {stats.expiringDocuments.length > 3 && (
                      <ActionButton
                        action="view"
                        onClick={() => router.push('/documents?tab=library')}
                        showText={true}
                        text={`View all ${stats.expiringDocuments.length} documents`}
                        style={{ padding: 0, height: 'auto' }}
                      />
                    )}
                  </Space>
                </ProCard>
              </Col>
            )}
          </Row>
        </div>
      )}

      {/* Quick Actions - Always visible */}
      <div style={{ marginBottom: 32 }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          Quick Actions
        </Title>
        <Row gutter={[16, 16]}>
          {quickActions.map((action) => (
            <Col xs={24} sm={12} md={6} key={action.key}>
              <ActionButton
                action={action.primary ? 'add' : 'default'}
                size="large"
                icon={action.icon}
                onClick={action.onClick}
                showText={true}
                text={action.label}
                style={{ width: '100%', height: 56, fontSize: 15, fontWeight: 500 }}
              />
            </Col>
          ))}
        </Row>
      </div>

      {/* Key Metrics - Combined and Resourceful */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Portfolio Overview
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {/* Combined Properties & Units */}
        <Col xs={24} sm={12} md={8}>
          <ProCard 
            hoverable
            onClick={() => router.push('/properties')}
            style={{ cursor: 'pointer', minHeight: '160px', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <SafeStatistic
              title="Properties & Units"
              value={`${stats.totalProperties} Properties`}
              suffix={`${stats.totalUnits} Units`}
              prefix={<HomeOutlined style={{ color: '#1890ff' }} />}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {stats.totalUnits - stats.vacantUnits} Occupied | {stats.vacantUnits} Vacant
              </Text>
            </div>
          </ProCard>
        </Col>

        {/* Tenants */}
        <Col xs={24} sm={12} md={6}>
          <ProCard 
            hoverable
            onClick={() => router.push('/tenants')}
            style={{ cursor: 'pointer', minHeight: '160px', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <SafeStatistic
              title="Tenants"
              value={stats.totalTenants}
              suffix="Total"
              prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
            />
          </ProCard>
        </Col>

        {/* Leases */}
        <Col xs={24} sm={12} md={6}>
          <ProCard 
            hoverable
            onClick={() => router.push('/leases')}
            style={{ cursor: 'pointer', minHeight: '160px', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <SafeStatistic
              title="Leases"
              value={stats.activeLeases}
              suffix="Active"
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {stats.leasesExpiringIn30Days > 0 && `${stats.leasesExpiringIn30Days} expiring in 30 days`}
                {stats.leasesExpiringIn30Days === 0 && 'All leases active'}
              </Text>
            </div>
          </ProCard>
        </Col>

        {/* This Month's Rent - Most Important */}
        <Col xs={24} sm={12} md={8}>
          <ProCard 
            hoverable
            onClick={() => router.push('/financials?tab=rent-payments')}
            style={{ cursor: 'pointer', minHeight: '160px', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <Statistic
              title="This Month's Rent"
              value={formatCurrencyValue(stats.rentByCurrency)}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
            />
            <div style={{ marginTop: 12 }}>
              <Progress 
                percent={parseFloat(collectionBreakdown.collectionRate)} 
                size="small"
                strokeColor={parseFloat(collectionBreakdown.collectionRate) >= 90 ? '#52c41a' : parseFloat(collectionBreakdown.collectionRate) >= 70 ? '#faad14' : '#ff4d4f'}
              />
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                {collectionBreakdown.collectionRate}% collected
              </Text>
            </div>
          </ProCard>
        </Col>
      </Row>

      {/* Financial Summary - Actionable */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Financial Status
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <ProCard 
            hoverable
            onClick={() => router.push('/financials?tab=rent-payments&filter=paid')}
            style={{ cursor: 'pointer', borderLeft: '4px solid #52c41a', minHeight: '140px', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Statistic
              title="Rent Received"
              value={formatCurrencyValue(stats.paidByCurrency)}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard 
            hoverable
            onClick={() => router.push('/financials?tab=rent-payments&filter=pending')}
            style={{ cursor: 'pointer', borderLeft: '4px solid #faad14', minHeight: '140px', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Statistic
              title="Pending"
              value={formatCurrencyValue(stats.unpaidByCurrency)}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard 
            hoverable
            onClick={() => router.push('/financials?tab=rent-payments&filter=overdue')}
            style={{ cursor: 'pointer', borderLeft: '4px solid #ff4d4f', minHeight: '140px', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Statistic
              title="Overdue"
              value={formatCurrencyValue(stats.overdueByCurrency)}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard
            style={{ minHeight: '140px', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <SafeStatistic
              title="Collection Rate"
              value={collectionBreakdown.collectionRate}
              suffix="%"
              prefix={<RiseOutlined style={{ color: parseFloat(collectionBreakdown.collectionRate) >= 90 ? '#52c41a' : '#faad14' }} />}
            />
            <Progress 
              percent={parseFloat(collectionBreakdown.collectionRate)} 
              size="small"
              strokeColor={parseFloat(collectionBreakdown.collectionRate) >= 90 ? '#52c41a' : parseFloat(collectionBreakdown.collectionRate) >= 70 ? '#faad14' : '#ff4d4f'}
              style={{ marginTop: 12 }}
            />
          </ProCard>
        </Col>
      </Row>

      {/* Operations - Useful Metrics */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Operations
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={8}>
          <ProCard 
            hoverable
            onClick={() => router.push('/operations?tab=maintenance')}
            style={{ cursor: 'pointer', minHeight: '140px', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <SafeStatistic
              title="Maintenance Requests"
              value={stats.pendingMaintenance}
              suffix={`Open${stats.avgResolutionTime > 0 ? ` | Avg: ${stats.avgResolutionTime}d` : ''}`}
              prefix={<ToolOutlined style={{ color: stats.pendingMaintenance > 0 ? '#faad14' : '#52c41a' }} />}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <ProCard 
            hoverable
            onClick={() => router.push('/properties')}
            style={{ cursor: 'pointer', minHeight: '140px', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <SafeStatistic
              title="Occupancy Rate"
              value={stats.occupancyRate}
              suffix="%"
              prefix={<LineChartOutlined style={{ color: parseFloat(stats.occupancyRate) >= 90 ? '#52c41a' : parseFloat(stats.occupancyRate) >= 70 ? '#faad14' : '#ff4d4f' }} />}
            />
            <Progress 
              percent={parseFloat(stats.occupancyRate)} 
              size="small"
              strokeColor={parseFloat(stats.occupancyRate) >= 90 ? '#52c41a' : parseFloat(stats.occupancyRate) >= 70 ? '#faad14' : '#ff4d4f'}
              style={{ marginTop: 12 }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <ProCard
            style={{ minHeight: '140px', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <SafeStatistic
              title="Vacant Units"
              value={stats.vacantUnits}
              suffix={`of ${stats.totalUnits} total`}
              prefix={<AppstoreOutlined style={{ color: stats.vacantUnits > 0 ? '#faad14' : '#52c41a' }} />}
            />
            {stats.vacantUnits > 0 && (
              <ActionButton
                action="view"
                size="small"
                onClick={() => router.push('/properties')}
                showText={true}
                text="View Vacant Units →"
                style={{ padding: 0, marginTop: 8, height: 'auto' }}
              />
            )}
          </ProCard>
        </Col>
      </Row>

      {/* Urgent Leases - Only if expiring soon */}
      {stats.leasesExpiringIn30Days > 0 && stats.upcomingLeaseExpirations && stats.upcomingLeaseExpirations.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningOutlined style={{ color: '#ff4d4f' }} />
            Leases Expiring Within 30 Days
          </Title>
          <ProCard>
            <Table
              dataSource={stats.upcomingLeaseExpirations
                .filter(lease => {
                  const daysUntilExpiration = Math.ceil((new Date(lease.leaseEnd) - new Date()) / (1000 * 60 * 60 * 24));
                  return daysUntilExpiration <= 30;
                })
                .map((lease, idx) => ({
                  key: lease.id || idx,
                  tenant: lease.leaseTenants[0]?.tenant,
                  property: lease.unit.property.addressLine1,
                  unit: lease.unit.unitName,
                  daysUntil: Math.ceil((new Date(lease.leaseEnd) - new Date()) / (1000 * 60 * 60 * 24)),
                  endDate: new Date(lease.leaseEnd).toLocaleDateString(),
                }))}
              columns={[
                {
                  title: 'Tenant',
                  dataIndex: 'tenant',
                  render: (tenant) => tenant ? `${tenant.firstName} ${tenant.lastName}` : 'N/A',
                },
                {
                  title: 'Property',
                  dataIndex: 'property',
                },
                {
                  title: 'Unit',
                  dataIndex: 'unit',
                },
                {
                  title: 'Days Until Expiration',
                  dataIndex: 'daysUntil',
                  render: (days) => (
                    <Tag color={days <= 7 ? 'error' : days <= 14 ? 'warning' : 'default'}>
                      {days} days
                    </Tag>
                  ),
                },
                {
                  title: 'End Date',
                  dataIndex: 'endDate',
                },
                {
                  title: 'Action',
                  render: () => (
                    <ActionButton
                      action="view"
                      size="small"
                      onClick={() => router.push('/leases')}
                      showText={true}
                      text="Review →"
                      style={{ padding: 0, height: 'auto' }}
                    />
                  ),
                },
              ]}
              pagination={false}
              size="small"
            />
          </ProCard>
        </div>
      )}

      {/* More Insights - Collapsible */}
      <Collapse 
        ghost
        style={{ marginBottom: 32 }}
        items={[
          {
            key: 'insights',
            label: (
              <Title level={4} style={{ margin: 0 }}>
                More Insights & Analytics
              </Title>
            ),
            children: (
              <div>
                {/* Charts */}
                {(paymentTrendsConfig || occupancyTrendsConfig) && (
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    {paymentTrendsConfig && (
                      <Col xs={24} lg={12}>
                        <ProCard title="Rent Collection Trends (Last 6 Months)">
                          <Line {...paymentTrendsConfig} height={250} />
                        </ProCard>
                      </Col>
                    )}
                    {occupancyTrendsConfig && (
                      <Col xs={24} lg={12}>
                        <ProCard title="Occupancy Rate Trends (Last 6 Months)">
                          <Bar {...occupancyTrendsConfig} height={250} />
                        </ProCard>
                      </Col>
                    )}
                  </Row>
                )}

                {/* Additional Metrics */}
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <ProCard>
                      <Statistic
                        title="Portfolio Value"
                        value={stats.portfolioValue || 0}
                        prefix="$"
                        precision={0}
                      />
                    </ProCard>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <ProCard>
                      <Statistic
                        title="Expected Annual Income"
                        value={stats.expectedAnnualIncome || 0}
                        prefix="$"
                        precision={0}
                      />
                    </ProCard>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <ProCard>
                      <SafeStatistic
                        title="Pending Invitations"
                        value={stats.pendingInvitations || 0}
                        suffix="tenants"
                      />
                    </ProCard>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <N4FormsCard draftCount={draftCount} servedCount={servedCount} />
                  </Col>
                  {stats.pendingApprovals !== undefined && (
                    <Col xs={24} sm={12} md={6}>
                      <ProCard 
                        hoverable
                        onClick={() => router.push('/financials')}
                        style={{ cursor: 'pointer', borderLeft: stats.pendingApprovals > 0 ? '4px solid #ff4d4f' : '4px solid #52c41a' }}
                      >
                        <Statistic
                          title="Pending Approvals"
                          value={stats.pendingApprovals || 0}
                          suffix="requests"
                          prefix={<CheckCircleOutlined style={{ color: stats.pendingApprovals > 0 ? '#ff4d4f' : '#52c41a' }} />}
                        />
                      </ProCard>
                    </Col>
                  )}
                </Row>
              </div>
            ),
          },
        ]}
      />

      {/* Activity Log & Quick Stats Widgets */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <ActivityLogWidget limit={4} userRole="landlord" showViewAll={true} />
        </Col>
        <Col xs={24} lg={12}>
          <QuickStatsWidget
            title="Quick Stats"
            icon={<RiseOutlined />}
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
        </Col>
      </Row>
    </div>
  );
}
