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
import { safeJsonParse } from '@/lib/utils/safe-json-parser';
import { PageLayout, LoadingWrapper } from '@/components/shared';
import { useLoading } from '@/lib/hooks/useLoading';

const { Text, Paragraph } = Typography;

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
      <PageLayout headerTitle={<><BankOutlined /> PMC Organization</>}>
        <LoadingWrapper loading={loading} />
      </PageLayout>
    );
  }

  if (!organization || !pmcData) {
    return (
      <PageLayout headerTitle={<><BankOutlined /> PMC Organization</>}>
        <Alert
          message="PMC Information Not Found"
          description={error || 'Unable to load PMC company information. Please contact support.'}
          type="error"
          showIcon
        />
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
        message="PMC Account Inactive"
        description="Your PMC account is currently inactive. Please contact support for assistance."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  return (
    <PageLayout
      headerTitle={<><BankOutlined /> PMC Organization</>}
      headerActions={[
        <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchUsageData}>
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
              <Descriptions.Item label="Company Name">{organization.name}</Descriptions.Item>
              <Descriptions.Item label="Company ID">
                <Text code>{organization.companyId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">{organization.email}</Descriptions.Item>
              {organization.phone && (
                <Descriptions.Item label="Phone">{organization.phone}</Descriptions.Item>
              )}
              {organization.address?.addressLine1 && (
                <Descriptions.Item label="Address">
                  <div>
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
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Plan">{getPlanTag(organization.plan)}</Descriptions.Item>
              <Descriptions.Item label="Status">{getStatusTag(organization.status)}</Descriptions.Item>
              {organization.createdAt && (
                <Descriptions.Item label="Created">
                  {typeof organization.createdAt === 'string' 
                    ? new Date(organization.createdAt).toLocaleDateString()
                    : organization.createdAt.toLocaleDateString()}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Usage Statistics */}
        <Col xs={24} lg={12}>
          <Card title="Usage Statistics">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Managed Properties */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>
                    <HomeOutlined /> Managed Properties
                  </Text>
                  <Text strong>{usageData?.propertyCount || 0}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Properties managed across all landlords
                </Text>
              </div>

              {/* Managed Tenants */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>
                    <TeamOutlined /> Managed Tenants
                  </Text>
                  <Text strong>{usageData?.tenantCount || 0}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Tenants across all managed properties
                </Text>
              </div>

              {/* Managed Landlords */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>
                    <UserOutlined /> Managed Landlords
                  </Text>
                  <Text strong>{usageData?.landlordCount || 0}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Landlords under management
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Management Statistics */}
      <Card title="Management Overview" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Properties Managed"
              value={usageData?.propertyCount || 0}
              prefix={<HomeOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Tenants Managed"
              value={usageData?.tenantCount || 0}
              prefix={<TeamOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Landlords Managed"
              value={usageData?.landlordCount || 0}
              prefix={<UserOutlined />}
            />
          </Col>
        </Row>
      </Card>
    </PageLayout>
  );
}
