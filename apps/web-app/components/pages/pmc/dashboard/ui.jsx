"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
  Tag,
  Table,
  Button,
} from 'antd';
import {
  BankOutlined,
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { PageLayout, TableWrapper } from '@/components/shared';
import OptimizedCard from '@/components/shared/OptimizedCard';

const { Text } = Typography;

export default function PMCDashboardClient({
  pmc,
  stats,
  managedProperties = [],
  pmcRelationships = [],
}) {
  const router = useRouter();

  const quickActions = useMemo(() => [
    {
      key: 'properties',
      label: 'View Properties',
      icon: <HomeOutlined />,
      onClick: () => router.push('/properties'),
      primary: true,
    },
    {
      key: 'landlords',
      label: 'Manage Landlords',
      icon: <TeamOutlined />,
      onClick: () => router.push('/landlords'),
    },
    {
      key: 'maintenance',
      label: 'Maintenance',
      icon: <ToolOutlined />,
      onClick: () => router.push('/operations?tab=maintenance'),
    },
    {
      key: 'expenses',
      label: 'Expenses',
      icon: <BankOutlined />,
      onClick: () => router.push('/financials'),
    },
  ], [router]);

  const propertyColumns = [
    {
      title: 'Property',
      dataIndex: 'addressLine1',
      key: 'addressLine1',
      render: (text, record) => (
        <div>
          <Text strong>{text || record.propertyName}</Text>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.city}, {record.provinceState}
          </div>
        </div>
      ),
    },
    {
      title: 'Landlord',
      key: 'landlord',
      render: (_, record) => (
        <Text>
          {record.landlord ? `${record.landlord.firstName} ${record.landlord.lastName}` : 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Units',
      dataIndex: 'units',
      key: 'units',
      render: (units) => units?.length || 0,
    },
    {
      title: 'Active Leases',
      key: 'leases',
      render: (_, record) => {
        const leaseCount = record.units?.reduce((sum, unit) => sum + (unit.leases?.length || 0), 0) || 0;
        return <Tag color="green">{leaseCount}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Button
          type="link"
          icon={<ArrowRightOutlined />}
          onClick={() => router.push('/properties')}
        >
          View
        </Button>
      ),
    },
  ];

  const statsData = [
    {
      title: 'Managed Landlords',
      value: stats.totalLandlords,
      prefix: <TeamOutlined />,
      onClick: () => router.push('/landlords'),
    },
    {
      title: 'Properties',
      value: stats.totalProperties,
      prefix: <HomeOutlined />,
      onClick: () => router.push('/properties'),
    },
    {
      title: 'Total Units',
      value: stats.totalUnits,
      prefix: <BankOutlined />,
    },
    {
      title: 'Active Leases',
      value: stats.activeLeases,
      prefix: <FileTextOutlined />,
    },
  ];

  return (
    <PageLayout
      headerTitle={<>Welcome back, {pmc.companyName}!</>}
      headerDescription="Property Management Company Dashboard"
      stats={statsData}
      statsCols={4}
      contentStyle={{ maxWidth: 1400, margin: '0 auto' }}
    >
      {/* Operations */}
      <Card title="Operations" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card
              hoverable
              onClick={() => router.push('/operations?tab=maintenance')}
              style={{ cursor: 'pointer', borderLeft: stats.pendingMaintenance > 0 ? '4px solid #faad14' : '4px solid #52c41a' }}
            >
              <Statistic
                title="Maintenance Requests"
                value={stats.pendingMaintenance}
                suffix="Pending"
                prefix={<ToolOutlined style={{ color: stats.pendingMaintenance > 0 ? '#faad14' : '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card
              hoverable
              onClick={() => router.push('/financials')}
              style={{ cursor: 'pointer', borderLeft: stats.pendingApprovals > 0 ? '4px solid #ff4d4f' : '4px solid #52c41a' }}
            >
              <Statistic
                title="Pending Approvals"
                value={stats.pendingApprovals}
                suffix="Requests"
                prefix={<CheckCircleOutlined style={{ color: stats.pendingApprovals > 0 ? '#ff4d4f' : '#52c41a' }} />}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {quickActions.map((action) => (
            <Col xs={24} sm={12} md={6} key={action.key}>
              <OptimizedCard
                hoverable
                onClick={action.onClick}
                style={{ cursor: 'pointer', textAlign: 'center', minHeight: 120 }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ fontSize: 32 }}>
                    {action.icon}
                  </div>
                  <Text strong>{action.label}</Text>
                  {action.badge && (
                    <Tag color="red">{action.badge}</Tag>
                  )}
                </Space>
              </OptimizedCard>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Managed Properties */}
      {managedProperties.length > 0 && (
        <Card title="Managed Properties">
          <TableWrapper>
            <Table
              dataSource={managedProperties}
              columns={propertyColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TableWrapper>
        </Card>
      )}
    </PageLayout>
  );
}

