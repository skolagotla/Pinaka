"use client";

import { useRouter } from 'next/navigation';
import { 
  Typography, 
  Card, 
  Space, 
  Tag, 
  Button,
  Descriptions,
  Table,
  Divider,
} from 'antd';
import {
  TeamOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { PageLayout } from '@/components/shared';

const { Title, Text } = Typography;

export default function PMCLandlordDetailClient({ landlord, relationship }) {
  const router = useRouter();

  const propertyColumns = [
    {
      title: 'Property Name',
      dataIndex: 'propertyName',
      key: 'propertyName',
      render: (name, record) => (
        <div>
          <Text strong>{name || record.addressLine1 || 'Unnamed Property'}</Text>
          {name && record.addressLine1 && (
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.addressLine1}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Address',
      key: 'address',
      render: (_, record) => (
        <Text type="secondary">
          {record.addressLine1}
          {record.addressLine2 && `, ${record.addressLine2}`}
          {record.city && `, ${record.city}`}
          {record.provinceState && `, ${record.provinceState}`}
          {record.postalZip && ` ${record.postalZip}`}
        </Text>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'propertyType',
      key: 'propertyType',
      render: (type) => <Tag>{type || 'N/A'}</Tag>,
    },
    {
      title: 'Units',
      key: 'units',
      render: (_, record) => (
        <Space>
          <Tag icon={<HomeOutlined />}>{record.units?.length || 0}</Tag>
        </Space>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => router.push(`/properties/${record.id}`)}
        >
          View Property
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/landlords')}
          >
            Back to Landlords
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <TeamOutlined /> {landlord.firstName} {landlord.lastName}
            </Title>
            <Text type="secondary">{landlord.email}</Text>
          </div>
        </Space>
      </div>

      {/* Relationship Info */}
      {relationship && (
        <Card style={{ marginBottom: 24 }}>
          <Descriptions title="Management Relationship" bordered column={2}>
            <Descriptions.Item label="Status">
              <Tag color={relationship.status === 'active' ? 'green' : 'orange'}>
                {relationship.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Started">
              {relationship.startedAt ? new Date(relationship.startedAt).toLocaleDateString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Ended">
              {relationship.endedAt ? new Date(relationship.endedAt).toLocaleDateString() : 'Ongoing'}
            </Descriptions.Item>
            <Descriptions.Item label="PMC Company">
              {relationship.pmc?.companyName || 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Landlord Information */}
      <Card title="Landlord Information" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Full Name">
            {landlord.firstName} {landlord.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <Space>
              <MailOutlined />
              {landlord.email}
            </Space>
          </Descriptions.Item>
          {landlord.phone && (
            <Descriptions.Item label="Phone">
              <Space>
                <PhoneOutlined />
                {landlord.phone}
              </Space>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Approval Status">
            <Tag color={landlord.approvalStatus === 'APPROVED' ? 'green' : 'orange'}>
              {landlord.approvalStatus || 'PENDING'}
            </Tag>
          </Descriptions.Item>
          {(landlord.addressLine1 || landlord.city) && (
            <Descriptions.Item label="Address" span={2}>
              <Space>
                <EnvironmentOutlined />
                {landlord.addressLine1}
                {landlord.addressLine2 && `, ${landlord.addressLine2}`}
                {landlord.city && `, ${landlord.city}`}
                {landlord.provinceState && `, ${landlord.provinceState}`}
                {landlord.postalZip && ` ${landlord.postalZip}`}
                {landlord.country && `, ${landlord.country}`}
              </Space>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Properties */}
      <Card 
        title={
          <Space>
            <HomeOutlined />
            Properties ({landlord.properties?.length || 0})
          </Space>
        }
      >
        <Table
          dataSource={landlord.properties || []}
          columns={propertyColumns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
        />
      </Card>
    </div>
  );
}

