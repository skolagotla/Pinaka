"use client";

import { useRouter } from "next/navigation";
import {
  Typography, Table, Tag, Space, Button
} from 'antd';
import { 
  TeamOutlined, HomeOutlined, CheckCircleOutlined,
  CloseCircleOutlined, EyeOutlined
} from '@ant-design/icons';
import { PageLayout, TableWrapper } from '@/components/shared';
import { renderStatus } from '@/components/shared/TableRenderers';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';

const { Text } = Typography;

export default function PMCLandlordsClient({ pmc, relationships }) {
  const router = useRouter();

  const activeRelationships = relationships.filter(r => r.status === 'active');
  const suspendedRelationships = relationships.filter(r => r.status === 'suspended');
  const terminatedRelationships = relationships.filter(r => r.status === 'terminated');

  const columns = [
    {
      title: 'Landlord',
      key: 'landlord',
      render: (_, record) => (
        <div>
          <Text strong>
            {record.landlord.firstName} {record.landlord.lastName}
          </Text>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.landlord.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Properties',
      key: 'properties',
      render: (_, record) => (
        <Tag icon={<HomeOutlined />} color="blue">
          {record.landlord.propertyCount || 0}
        </Tag>
      ),
    },
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      render: (status) => {
        const statusMap = {
          active: 'Active',
          suspended: 'Suspended',
          terminated: 'Cancelled'
        };
        return renderStatus(statusMap[status] || status, {
          customColors: {
            'Active': 'green',
            'Suspended': 'orange',
            'Cancelled': 'red'
          }
        });
      },
    }),
    {
      title: 'Started',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Ended',
      dataIndex: 'endedAt',
      key: 'endedAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/landlords/${record.landlordId}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const stats = [
    {
      title: 'Total Relationships',
      value: relationships.length,
      prefix: <TeamOutlined />,
    },
    {
      title: 'Active',
      value: activeRelationships.length,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Suspended',
      value: suspendedRelationships.length,
      prefix: <CloseCircleOutlined />,
      valueStyle: { color: '#faad14' },
    },
    {
      title: 'Total Properties',
      value: relationships.reduce((sum, r) => sum + (r.landlord.propertyCount || 0), 0),
      prefix: <HomeOutlined />,
    },
  ];

  return (
    <PageLayout
      headerTitle={<><TeamOutlined /> Managed Landlords</>}
      stats={stats}
      statsCols={4}
    >
      <TableWrapper>
        <Table
          dataSource={relationships}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Total ${total} relationships` }}
          size="middle"
        />
      </TableWrapper>
    </PageLayout>
  );
}

