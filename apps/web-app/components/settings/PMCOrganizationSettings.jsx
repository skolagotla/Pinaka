"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Statistic,
  Alert,
  Tag,
  Row,
  Col,
  Button,
  Descriptions,
  Spin,
} from 'antd';
import {
  TeamOutlined,
  HomeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { safeJsonParse } from '@/lib/utils/safe-json-parser';

const { Title, Text, Paragraph } = Typography;

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

  const getStatusTag = (status) => {
    const statusConfig = {
      ACTIVE: { color: 'success', text: 'Active' },
      SUSPENDED: { color: 'error', text: 'Suspended' },
      CANCELLED: { color: 'default', text: 'Cancelled' },
      TRIAL: { color: 'warning', text: 'Trial' },
      INACTIVE: { color: 'default', text: 'Inactive' },
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
      PMC: 'purple',
    };
    return <Tag color={planColors[plan] || 'default'}>{plan}</Tag>;
  };

  if (loading && !pmcData) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading organization information...</div>
      </div>
    );
  }

  if (!organization || !pmcData) {
    return (
      <Alert
        message="PMC Information Not Found"
        description={
          error || 
          'Unable to load PMC company information. This may happen if the PMC record is not properly configured. Please contact support or refresh the page.'
        }
        type="error"
        showIcon
        action={
          <Button size="small" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        }
      />
    );
  }

  const usageData = usage || {};

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
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>PMC Organization</Title>
          <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
            View your PMC company details and management statistics.
          </Paragraph>
        </div>
        <Button onClick={fetchUsageData}>Refresh</Button>
      </div>

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
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
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

            {/* Management Overview */}
            <Card title="Management Overview">
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
          </Space>
        </Col>
      </Row>
    </div>
  );
}

