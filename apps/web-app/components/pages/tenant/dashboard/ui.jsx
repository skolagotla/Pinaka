"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { formatCurrency, getCurrencyFromCountry, formatAmount } from '@/lib/currency-utils';
import { getOrdinal, formatRelativeTime, getStatusColor } from '@/lib/utils/dashboard-helpers';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
  Button,
  Avatar,
  Tag,
  Progress,
  Divider,
  Alert,
  List,
  Skeleton,
  Collapse,
} from 'antd';
// Lazy load ProCard to reduce initial bundle size
import { ProCard } from '@/components/shared/LazyProComponents';
import OptimizedButton from '@/components/shared/OptimizedButton';
// Dynamically import charts to reduce initial bundle size
import dynamic from 'next/dynamic';
const Bar = dynamic(() => import('@ant-design/charts').then(mod => mod.Bar), { ssr: false });
import {
  HomeOutlined,
  ReconciliationOutlined,
  ToolOutlined,
  LockOutlined,
  CalendarOutlined,
  RiseOutlined,
  WarningOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Helper functions now imported from shared utilities

export default function TenantDashboardClient({ tenant, landlord, stats, loading = false }) {
  const router = useRouter();
  
  // Extract lease information
  const activeLeases = stats.activeLeases || [];
  const activeLease = activeLeases.length > 0 ? activeLeases[0] : null;

  // Actionable insights for tenant
  const actionableInsights = useMemo(() => {
    const insights = [];
    
    // Document upload prompt after approval
    if (tenant.approvalStatus === 'APPROVED' && tenant.hasAccess) {
      // Check if required documents are missing (credit report, etc.)
      const hasRequiredDocuments = stats.documentsCount > 0;
      if (!hasRequiredDocuments) {
        insights.push({
          priority: 0, // Highest priority
          type: 'info',
          title: 'Upload Required Documents',
          description: 'Your application has been approved! Please upload required documents such as credit report, identification, and employment letters.',
          action: {
            label: 'Upload Documents',
            onClick: () => router.push('/library'),
          },
        });
      }
    }
    
    // Overdue rent
    if (stats.overdueRentAmount > 0) {
      insights.push({
        priority: 1,
        type: 'error',
        title: 'Overdue Rent Payment',
        description: `You have ${Object.keys(stats.overdueByCurrency).map(curr => `$${formatAmount(stats.overdueByCurrency[curr])} ${curr}`).join(', ')} in overdue rent`,
        action: {
          label: 'View Payment Details',
          onClick: () => router.push('/payments'),
        },
      });
    }

    // Upcoming payment due soon
    if (stats.upcomingRentPayment && stats.daysUntilNextRent !== null) {
      if (stats.daysUntilNextRent <= 7 && stats.upcomingRentPayment.status === 'Unpaid') {
        insights.push({
          priority: 2,
          type: 'warning',
          title: 'Rent Payment Due Soon',
          description: `$${formatAmount(stats.upcomingRentPayment.amount)} due in ${stats.daysUntilNextRent} days`,
          action: {
            label: 'View Payment',
            onClick: () => router.push('/payments'),
          },
        });
      }
    }

    // Urgent maintenance
    if (stats.openMaintenanceCount > 0) {
      insights.push({
        priority: 3,
        type: 'info',
        title: 'Open Maintenance Requests',
        description: `${stats.openMaintenanceCount} maintenance request${stats.openMaintenanceCount > 1 ? 's' : ''} ${stats.openMaintenanceCount > 1 ? 'are' : 'is'} open`,
        action: {
          label: 'View Maintenance',
          onClick: () => router.push('/operations?tab=maintenance'),
        },
      });
    }

    return insights.sort((a, b) => a.priority - b.priority);
  }, [stats, router]);

  // Quick actions
  const quickActions = [
    {
      label: "Contact Landlord",
      icon: <MailOutlined />,
      onClick: () => landlord && (window.location.href = `mailto:${landlord.email}`),
      primary: true,
    },
    {
      label: "Submit Maintenance",
      icon: <ToolOutlined />,
      onClick: () => router.push("/operations?tab=maintenance"),
    },
    {
      label: "View Receipts",
      icon: <ReconciliationOutlined />,
      onClick: () => router.push("/payments"),
    },
    {
      label: "My Documents",
      icon: <LockOutlined />,
      onClick: () => router.push("/library"),
    },
  ];

  // Chart configuration
  const paymentHistoryConfig = stats.monthlyPayments && stats.monthlyPayments.length > 0 && stats.monthlyPayments.some(mp => mp.amount > 0) ? {
    data: stats.monthlyPayments,
    xField: 'month',
    yField: 'amount',
    color: '#52c41a',
    xAxis: {
      title: {
        text: 'Month',
        style: { fontSize: 12 },
      },
    },
    yAxis: {
      title: {
        text: 'Amount Paid ($)',
        style: { fontSize: 12 },
      },
      label: {
        formatter: (v) => `$${(v / 1000).toFixed(0)}K`,
      },
    },
  } : null;

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
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            Welcome back, {tenant.firstName}!
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Your rental information and account overview
          </Text>
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>

      {/* Actionable Insights */}
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
                    <Button 
                      type={insight.type === 'error' ? 'primary' : 'default'}
                      onClick={insight.action.onClick}
                      icon={<ArrowRightOutlined />}
                    >
                      {insight.action.label}
                    </Button>
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

      {/* Active Lease Information - Most Important */}
      {activeLease && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            Your Rental Home
          </Title>
          <ProCard>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <div>
                  <Title level={5} style={{ marginBottom: 8, color: '#1f2937' }}>
                    {activeLease.unit.property.addressLine1}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
                    {activeLease.unit.property.city}, {activeLease.unit.property.provinceState} {activeLease.unit.property.postalZip}
                  </Text>
                  <Tag color="blue">Unit: {activeLease.unit.unitName}</Tag>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <ProCard size="small" style={{ textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                        Monthly Rent
                      </Text>
                      <Title level={5} style={{ color: '#52c41a', margin: '8px 0', fontWeight: 700 }}>
                        {formatAmount(activeLease.rentAmount)}
                      </Title>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {getCurrencyFromCountry(activeLease.unit.property.country)}
                      </Text>
                    </ProCard>
                  </Col>
                  <Col xs={24} sm={8}>
                    <ProCard size="small" style={{ textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                        Due Day
                      </Text>
                      <Title level={5} style={{ color: '#1890ff', margin: '8px 0', fontWeight: 700 }}>
                        {getOrdinal(activeLease.rentDueDay)}
                      </Title>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        of each month
                      </Text>
                    </ProCard>
                  </Col>
                  <Col xs={24} sm={8}>
                    <ProCard size="small" style={{ textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                        Next Due
                      </Text>
                      <Title level={5} style={{ color: '#faad14', margin: '8px 0', fontWeight: 700 }}>
                        {stats.daysUntilNextRent || 'N/A'}
                      </Title>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {stats.daysUntilNextRent ? 'days' : ''}
                      </Text>
                    </ProCard>
                  </Col>
                </Row>
              </Col>
              {landlord && (
                <Col xs={24}>
                  <Divider style={{ margin: '16px 0' }} />
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    flexWrap: 'wrap', 
                    gap: 16,
                  }}>
                    <Space size="large">
                      <Avatar size={48} style={{ backgroundColor: '#1890ff' }}>
                        <UserOutlined />
                      </Avatar>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                          Your Landlord
                        </Text>
                        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                          {landlord.firstName} {landlord.lastName}
                        </Text>
                        <Space split={<Divider type="vertical" />} size="small">
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <MailOutlined /> {landlord.email}
                          </Text>
                          {landlord.phone && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <PhoneOutlined /> {landlord.phone}
                            </Text>
                          )}
                        </Space>
                      </div>
                    </Space>
                    <Button 
                      type="primary"
                      icon={<MailOutlined />}
                      onClick={() => window.location.href = `mailto:${landlord.email}`}
                    >
                      Contact Landlord
                    </Button>
                  </div>
                </Col>
              )}
            </Row>
          </ProCard>
        </div>
      )}

      {/* No Active Lease */}
      {!activeLease && (
        <ProCard style={{ marginBottom: 32, textAlign: 'center' }}>
          <Title level={5} type="secondary" style={{ marginBottom: 8 }}>
            No Active Leases
          </Title>
          <Text type="secondary">
            You don't have any active leases at the moment.
          </Text>
        </ProCard>
      )}

      {/* Quick Actions */}
      <div style={{ marginBottom: 32 }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          Quick Actions
        </Title>
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <OptimizedButton
                block
                size="large"
                type={action.primary ? 'primary' : 'default'}
                icon={action.icon}
                onClick={action.onClick}
                style={{ height: 56, fontSize: 15, fontWeight: 500 }}
              >
                {action.label}
              </OptimizedButton>
            </Col>
          ))}
        </Row>
      </div>

      {/* Financial Summary */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Financial Summary
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={8}>
          <ProCard 
            hoverable
            onClick={() => router.push('/payments')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Next Payment"
              value={stats.daysUntilNextRent || 'N/A'}
              suffix={stats.daysUntilNextRent ? "days" : ""}
              prefix={<CalendarOutlined style={{ color: stats.daysUntilNextRent && stats.daysUntilNextRent <= 7 ? '#faad14' : '#1890ff' }} />}
            />
            {stats.nextRentAmount && (
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Amount: {formatAmount(stats.nextRentAmount)}
                </Text>
              </div>
            )}
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <ProCard 
            hoverable
            onClick={() => router.push('/payments')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Paid This Year"
              value={stats.totalPaidThisYear > 0 ? `$${formatAmount(stats.totalPaidThisYear)}` : '$0'}
              prefix={<WalletOutlined style={{ color: '#52c41a' }} />}
            />
            {activeLease && (
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {getCurrencyFromCountry(activeLease.unit.property.country)}
                </Text>
              </div>
            )}
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <ProCard>
            <Statistic
              title="Lease Progress"
              value={stats.leaseProgress || 'N/A'}
              suffix={stats.leaseProgress ? "%" : ""}
              prefix={<RiseOutlined style={{ color: '#13c2c2' }} />}
            />
            {stats.leaseProgress && (
              <div style={{ marginTop: 12 }}>
                <Progress 
                  percent={parseFloat(stats.leaseProgress)} 
                  size="small"
                  strokeColor="#13c2c2"
                />
                {stats.daysUntilLeaseEnd && (
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                    {stats.daysUntilLeaseEnd} days remaining
                  </Text>
                )}
              </div>
            )}
          </ProCard>
        </Col>
      </Row>

      {/* Activity Overview */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Activity Overview
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={8}>
          <ProCard 
            hoverable
            onClick={() => router.push('/payments')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Rent Receipts"
              value={stats.rentReceiptsCount}
              prefix={<ReconciliationOutlined style={{ color: '#52c41a' }} />}
            />
            <Button 
              type="link" 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                router.push('/payments');
              }}
              style={{ padding: 0, marginTop: 8 }}
            >
              View All Receipts →
            </Button>
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <ProCard 
            hoverable
            onClick={() => router.push('/library')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="My Documents"
              value={stats.documentsCount + stats.leaseDocumentsCount}
              prefix={<LockOutlined style={{ color: '#13c2c2' }} />}
            />
            <Button 
              type="link" 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                router.push('/library');
              }}
              style={{ padding: 0, marginTop: 8 }}
            >
              View Documents →
            </Button>
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <ProCard 
            hoverable
            onClick={() => router.push('/operations?tab=maintenance')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Maintenance"
              value={`${stats.openMaintenanceCount} / ${stats.maintenanceRequestsCount}`}
              suffix="Open / Total"
              prefix={<ToolOutlined style={{ color: stats.openMaintenanceCount > 0 ? '#faad14' : '#52c41a' }} />}
            />
            <Button 
              type="link" 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                router.push('/operations?tab=maintenance');
              }}
              style={{ padding: 0, marginTop: 8 }}
            >
              View Requests →
            </Button>
          </ProCard>
        </Col>
      </Row>

      {/* Payment Status - Detailed */}
      {stats.upcomingRentPayment && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            Payment Status
          </Title>
          <Alert
            message={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <Space size="large">
                  <Avatar 
                    size={56} 
                    style={{ 
                      backgroundColor: stats.upcomingRentPayment.status === 'Unpaid' && new Date(stats.upcomingRentPayment.dueDate) < new Date() ? '#ff4d4f' : '#52c41a'
                    }}
                  >
                    {stats.upcomingRentPayment.status === 'Unpaid' && new Date(stats.upcomingRentPayment.dueDate) < new Date() ? 
                      <WarningOutlined /> : <WalletOutlined />
                    }
                  </Avatar>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                      {stats.upcomingRentPayment.status === 'Unpaid' && new Date(stats.upcomingRentPayment.dueDate) < new Date() ? 
                        'Overdue Payment' : 'Next Payment'
                      }
                    </Text>
                    <Title 
                      level={4} 
                      style={{ 
                        margin: '4px 0',
                        color: stats.upcomingRentPayment.status === 'Unpaid' && new Date(stats.upcomingRentPayment.dueDate) < new Date() ? 
                          '#ff4d4f' : '#52c41a'
                      }}
                    >
                      {formatAmount(stats.upcomingRentPayment.amount)} {stats.upcomingRentPayment?.lease?.unit?.property?.country ? getCurrencyFromCountry(stats.upcomingRentPayment.lease.unit.property.country) : ''}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Due: {new Date(stats.upcomingRentPayment.dueDate).toLocaleDateString()}
                      {stats.upcomingRentPayment.status === 'Partial' && stats.upcomingRentPayment.partialPayments.length > 0 && (
                        <Tag color="warning" style={{ marginLeft: 8 }}>
                          Partial: {formatAmount(stats.upcomingRentPayment.partialPayments.reduce((sum, pp) => sum + pp.amount, 0))} paid
                        </Tag>
                      )}
                    </Text>
                  </div>
                </Space>
                {stats.upcomingRentPayment.status === 'Unpaid' && new Date(stats.upcomingRentPayment.dueDate) < new Date() && (
                  <Tag color="error">Action Required</Tag>
                )}
              </div>
            }
            type={stats.upcomingRentPayment.status === 'Unpaid' && new Date(stats.upcomingRentPayment.dueDate) < new Date() ? "error" : "success"}
            showIcon={false}
            style={{ borderRadius: 8 }}
          />
        </div>
      )}

      {/* More Details - Collapsible */}
      <Collapse 
        ghost
        style={{ marginBottom: 32 }}
        items={[
          {
            key: 'details',
            label: (
              <Title level={4} style={{ margin: 0 }}>
                More Details & History
              </Title>
            ),
            children: (
              <div>
                <Row gutter={[16, 16]}>
                  {/* Recent Payments */}
                  {stats.paymentHistory && stats.paymentHistory.length > 0 && (
                    <Col xs={24} lg={12}>
                      <ProCard title="Recent Payments">
                        <List
                          dataSource={stats.paymentHistory.slice(0, 5)}
                          renderItem={(payment) => (
                            <List.Item
                              onClick={() => router.push('/payments')}
                              style={{ cursor: 'pointer' }}
                            >
                              <List.Item.Meta
                                avatar={
                                  <Avatar style={{ backgroundColor: '#52c41a' }} icon={<CheckCircleOutlined />} />
                                }
                                title={
                                  <Text strong>
                                    {formatAmount(payment.amount)} {payment?.lease?.unit?.property?.country ? getCurrencyFromCountry(payment.lease.unit.property.country) : ''}
                                  </Text>
                                }
                                description={
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : 'N/A'}
                                    {payment.receiptNumber && ` • Receipt #${payment.receiptNumber}`}
                                  </Text>
                                }
                              />
                            </List.Item>
                          )}
                        />
                        <Button 
                          block
                          style={{ marginTop: 16 }}
                          onClick={() => router.push('/payments')}
                        >
                          View All Receipts
                        </Button>
                      </ProCard>
                    </Col>
                  )}

                  {/* Lease Information */}
                  {activeLease && (
                    <Col xs={24} lg={12}>
                      <ProCard title="Lease Information">
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>Start Date</Text>
                            <div><Text strong>{new Date(activeLease.leaseStart).toLocaleDateString()}</Text></div>
                          </div>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>End Date</Text>
                            <div><Text strong>{new Date(activeLease.leaseEnd).toLocaleDateString()}</Text></div>
                          </div>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>Progress</Text>
                            <Progress 
                              percent={stats.leaseProgress ? parseFloat(stats.leaseProgress) : 0} 
                              strokeColor="#1890ff"
                            />
                          </div>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>Days Remaining</Text>
                            <div><Text strong>{stats.daysUntilLeaseEnd || 'N/A'} days</Text></div>
                          </div>
                        </Space>
                      </ProCard>
                    </Col>
                  )}
                </Row>

                {/* Payment History Chart */}
                {paymentHistoryConfig && (
                  <ProCard title="Payment History (Last 6 Months)" style={{ marginTop: 16 }}>
                    <Bar {...paymentHistoryConfig} height={250} />
                  </ProCard>
                )}

                {/* Recent Maintenance */}
                {stats.recentMaintenanceUpdates && stats.recentMaintenanceUpdates.length > 0 && (
                  <ProCard title="Recent Maintenance Updates" style={{ marginTop: 16 }}>
                    <List
                      dataSource={stats.recentMaintenanceUpdates}
                      renderItem={(req) => (
                        <List.Item
                          onClick={() => router.push('/operations?tab=maintenance')}
                          style={{ cursor: 'pointer' }}
                          extra={<Tag color={getStatusColor(req.status)}>{req.status}</Tag>}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                style={{ 
                                  backgroundColor: req.status === 'Completed' ? '#52c41a' : req.status === 'In Progress' ? '#1890ff' : '#faad14'
                                }}
                              >
                                <ToolOutlined />
                              </Avatar>
                            }
                            title={<Text strong>{req.title}</Text>}
                            description={
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Status: {req.status} • {req.priority} Priority
                                </Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  {formatRelativeTime(req.updatedAt)}
                                </Text>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                    <Button 
                      block
                      style={{ marginTop: 16 }}
                      onClick={() => router.push('/operations?tab=maintenance')}
                    >
                      View All Requests
                    </Button>
                  </ProCard>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
