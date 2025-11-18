"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  Typography, 
  Tabs, 
  Space, 
  Tag, 
  Row, 
  Col, 
  Descriptions, 
  Button,
  Alert,
  Spin,
} from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  ToolOutlined,
  DollarOutlined,
  MessageOutlined,
  EditOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { ProCard } from '@/components/shared/LazyProComponents';
import PropertyOverviewTab from '@/components/property-detail/PropertyOverviewTab';
import PropertyUnitsTab from '@/components/property-detail/PropertyUnitsTab';
import PropertyTenantsTab from '@/components/property-detail/PropertyTenantsTab';
import PropertyMaintenanceTab from '@/components/property-detail/PropertyMaintenanceTab';
import PropertyContextBanner from '@/components/PropertyContextBanner';
import { usePermissions } from '@/lib/hooks/usePermissions';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function PropertyDetailClient({ property, error, user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const permissions = usePermissions(user || { role: 'landlord' });

  if (error) {
    return (
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/properties')}>
              Back to Properties
            </Button>
          }
        />
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading property...</div>
      </div>
    );
  }

  const propertyAddress = property.addressLine1 
    ? `${property.addressLine1}${property.addressLine2 ? `, ${property.addressLine2}` : ''}, ${property.city}, ${property.provinceState} ${property.postalZip}`
    : property.propertyName || 'Unnamed Property';

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Property Context Banner */}
      <PropertyContextBanner userRole="landlord" />

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/properties')}
          >
            Back to Properties
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <HomeOutlined /> {property.propertyName || property.addressLine1 || 'Property'}
            </Title>
            <Text type="secondary">{propertyAddress}</Text>
          </div>
        </Space>
        {permissions.canEditProperties && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => router.push(`/properties/${property.id}/edit`)}
          >
            Edit Property
          </Button>
        )}
        {!permissions.canEditProperties && permissions.isPMCManaged && (
          <Tag color="orange" style={{ padding: '4px 12px', fontSize: '14px' }}>
            Managed by {permissions.managingPMC?.companyName || 'PMC'}
          </Tag>
        )}
      </div>

      {/* Tabs */}
      <ProCard>
        <Tabs defaultActiveKey="overview" size="large">
          <TabPane
            tab={
              <span>
                <HomeOutlined />
                Overview
              </span>
            }
            key="overview"
          >
            <PropertyOverviewTab property={property} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <TeamOutlined />
                Units & Leases
              </span>
            }
            key="units"
          >
            <PropertyUnitsTab property={property} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <TeamOutlined />
                Tenants
              </span>
            }
            key="tenants"
          >
            <PropertyTenantsTab property={property} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <ToolOutlined />
                Maintenance
              </span>
            }
            key="maintenance"
          >
            <PropertyMaintenanceTab property={property} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <DollarOutlined />
                Financials
              </span>
            }
            key="financials"
          >
            <div style={{ padding: '16px 0' }}>
              <Text>Financial information will be displayed here.</Text>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <MessageOutlined />
                Messages
              </span>
            }
            key="messages"
          >
            <div style={{ padding: '16px 0' }}>
              <Text>Messages and conversations will be displayed here.</Text>
            </div>
          </TabPane>
        </Tabs>
      </ProCard>
    </div>
  );
}

