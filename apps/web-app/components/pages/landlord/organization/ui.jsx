"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Statistic,
  Progress,
  Alert,
  Tag,
  Row,
  Col,
  Button,
  Divider,
  Descriptions,
  Spin,
} from 'antd';
import {
  TeamOutlined,
  HomeOutlined,
  UserOutlined,
  DatabaseOutlined,
  ApiOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageLayout, LoadingWrapper } from '@/components/shared';

const { Text, Paragraph } = Typography;

export default function OrganizationClient({ user }) {
  const router = useRouter();
  const { loading, withLoading } = useLoading(true);
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

  const getStatusTag = (status) => {
    const statusConfig = {
      ACTIVE: { color: 'success', text: 'Active' },
      SUSPENDED: { color: 'error', text: 'Suspended' },
      CANCELLED: { color: 'default', text: 'Cancelled' },
      TRIAL: { color: 'warning', text: 'Trial' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPlanTag = (plan) => {
    const planColors = {
      FREE: 'default',
      STARTER: 'blue',
      PROFESSIONAL: 'purple',
      ENTERPRISE: 'gold',
      CUSTOM: 'cyan',
    };
    return <Tag color={planColors[plan] || 'default'}>{plan}</Tag>;
  };

  if (loading) {
    return (
      <PageLayout headerTitle={<><BankOutlined /> Organization Settings</>}>
        <LoadingWrapper loading={loading} />
      </PageLayout>
    );
  }

  if (error || !organization) {
    return (
      <PageLayout headerTitle={<><BankOutlined /> Organization Settings</>}>
        <Alert
          message="Organization Not Found"
          description={error || 'You are not associated with an organization. This is normal for shared resources (PMCs, Vendors, Contractors).'}
          type="info"
          showIcon
        />
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
        message="Account Suspended"
        description="Your organization account has been suspended. Please contact support for assistance."
        type="error"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  } else if (organization.status === 'CANCELLED') {
    statusAlerts.push(
      <Alert
        key="cancelled"
        message="Account Cancelled"
        description="Your organization account has been cancelled. Please contact support to reactivate."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  } else if (trialStatus?.hasTrial && trialStatus.isExpired) {
    statusAlerts.push(
      <Alert
        key="trial-expired"
        message="Trial Expired"
        description="Your trial period has ended. Please upgrade to a paid plan to continue using the service."
        type="error"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  } else if (trialStatus?.hasTrial && trialStatus.daysRemaining !== null && trialStatus.daysRemaining <= 3) {
    statusAlerts.push(
      <Alert
        key="trial-warning"
        message={`Trial Ending Soon - ${trialStatus.daysRemaining} days remaining`}
        description={`Your trial period ends on ${trialStatus.expiresAt?.toLocaleDateString()}. Please upgrade to a paid plan to avoid service interruption.`}
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  // Show limit warnings
  if (limits && !limits.withinLimits && limits.exceededLimits.length > 0) {
    statusAlerts.push(
      <Alert
        key="limits-exceeded"
        message="Usage Limits Exceeded"
        description={`You have exceeded the following limits: ${limits.exceededLimits.join(', ')}. Please upgrade your plan to continue.`}
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  return (
    <PageLayout
      headerTitle={<><BankOutlined /> Organization Settings</>}
      headerActions={[
        <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchOrganizationData}>
          Refresh
        </Button>
      ]}
      contentStyle={{ maxWidth: 1200, margin: '0 auto' }}
    >
      {statusAlerts}

      <Row gutter={[16, 16]}>
        {/* Organization Info */}
        <Col xs={24} lg={12}>
          <Card title="Organization Information">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Name">{organization.name}</Descriptions.Item>
              <Descriptions.Item label="Subdomain">
                {organization.subdomain ? (
                  <Text code>{organization.subdomain}.pinaka.com</Text>
                ) : (
                  <Text type="secondary">Not set</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Plan">{getPlanTag(organization.plan)}</Descriptions.Item>
              <Descriptions.Item label="Status">{getStatusTag(organization.status)}</Descriptions.Item>
              {organization.subscriptionStatus && (
                <Descriptions.Item label="Subscription Status">
                  <Tag>{organization.subscriptionStatus}</Tag>
                </Descriptions.Item>
              )}
              {organization.currentPeriodEnd && (
                <Descriptions.Item label="Billing Period Ends">
                  {new Date(organization.currentPeriodEnd).toLocaleDateString()}
                </Descriptions.Item>
              )}
              {trialStatus?.hasTrial && trialStatus.expiresAt && (
                <Descriptions.Item label="Trial Expires">
                  {new Date(trialStatus.expiresAt).toLocaleDateString()}
                  {trialStatus.daysRemaining !== null && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      ({trialStatus.daysRemaining} days remaining)
                    </Text>
                  )}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Usage Statistics */}
        <Col xs={24} lg={12}>
          <Card title="Usage Statistics">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Properties */}
              {organization.limits.maxProperties !== null && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>
                      <HomeOutlined /> Properties
                    </Text>
                    <Text>
                      {usageData?.propertyCount || 0} / {organization.limits.maxProperties}
                    </Text>
                  </div>
                  <Progress
                    percent={Math.min(100, ((usageData?.propertyCount || 0) / organization.limits.maxProperties) * 100)}
                    status={limits?.exceededLimits?.includes('properties') ? 'exception' : 'active'}
                  />
                </div>
              )}

              {/* Tenants */}
              {organization.limits.maxTenants !== null && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>
                      <TeamOutlined /> Tenants
                    </Text>
                    <Text>
                      {usageData?.tenantCount || 0} / {organization.limits.maxTenants}
                    </Text>
                  </div>
                  <Progress
                    percent={Math.min(100, ((usageData?.tenantCount || 0) / organization.limits.maxTenants) * 100)}
                    status={limits?.exceededLimits?.includes('tenants') ? 'exception' : 'active'}
                  />
                </div>
              )}

              {/* Users */}
              {organization.limits.maxUsers !== null && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>
                      <UserOutlined /> Users
                    </Text>
                    <Text>
                      {usageData?.userCount || 0} / {organization.limits.maxUsers}
                    </Text>
                  </div>
                  <Progress
                    percent={Math.min(100, ((usageData?.userCount || 0) / organization.limits.maxUsers) * 100)}
                    status={limits?.exceededLimits?.includes('users') ? 'exception' : 'active'}
                  />
                </div>
              )}

              {/* Storage */}
              {organization.limits.maxStorageGB !== null && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>
                      <DatabaseOutlined /> Storage
                    </Text>
                    <Text>
                      {usageData?.storageGB?.toFixed(2) || 0} GB / {organization.limits.maxStorageGB} GB
                    </Text>
                  </div>
                  <Progress
                    percent={Math.min(100, ((usageData?.storageGB || 0) / organization.limits.maxStorageGB) * 100)}
                    status={limits?.exceededLimits?.includes('storage') ? 'exception' : 'active'}
                  />
                </div>
              )}

              {/* API Calls */}
              {organization.limits.maxApiCallsPerMonth !== null && apiStats && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>
                      <ApiOutlined /> API Calls (Monthly)
                    </Text>
                    <Text>
                      {apiStats.count} / {organization.limits.maxApiCallsPerMonth}
                    </Text>
                  </div>
                  <Progress
                    percent={Math.min(100, (apiStats.count / organization.limits.maxApiCallsPerMonth) * 100)}
                    status={apiStats.remaining === 0 ? 'exception' : 'active'}
                  />
                  {apiStats.resetAt && (
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                      Resets on {new Date(apiStats.resetAt).toLocaleDateString()}
                    </Text>
                  )}
                  {apiStats.remaining !== null && (
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                      {apiStats.remaining} calls remaining this month
                    </Text>
                  )}
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Plan Limits */}
      <Card title="Plan Limits" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Max Properties"
              value={organization.limits.maxProperties ?? 'Unlimited'}
              prefix={<HomeOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Max Tenants"
              value={organization.limits.maxTenants ?? 'Unlimited'}
              prefix={<TeamOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Max Users"
              value={organization.limits.maxUsers ?? 'Unlimited'}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Max Storage"
              value={organization.limits.maxStorageGB ? `${organization.limits.maxStorageGB} GB` : 'Unlimited'}
              prefix={<DatabaseOutlined />}
            />
          </Col>
        </Row>
      </Card>
    </PageLayout>
  );
}

