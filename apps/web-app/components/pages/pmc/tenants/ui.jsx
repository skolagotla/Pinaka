"use client";

import { useRouter } from "next/navigation";
import {
  Typography, Table, Tag, Space, Button, Input
} from 'antd';
import { 
  TeamOutlined, HomeOutlined, FileTextOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useState, useMemo } from 'react';
import { PageLayout, TableWrapper } from '@/components/shared';

const { Text } = Typography;
const { Search } = Input;

export default function PMCTenantsClient({ pmc, tenants }) {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const filteredTenants = useMemo(() => {
    if (!searchText) return tenants;
    const lowerSearch = searchText.toLowerCase();
    return tenants.filter(tenant => {
      const name = `${tenant.firstName} ${tenant.lastName}`.toLowerCase();
      const email = (tenant.email || '').toLowerCase();
      return name.includes(lowerSearch) || email.includes(lowerSearch);
    });
  }, [tenants, searchText]);

  const columns = [
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_, record) => (
        <div>
          <Text strong>
            {record.firstName} {record.lastName}
          </Text>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.email}
          </div>
          {record.phone && (
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Properties',
      key: 'properties',
      render: (_, record) => {
        const uniqueProperties = new Set(
          (record.leases || []).map(l => l.property?.id).filter(Boolean)
        );
        return (
          <Space>
            <Tag icon={<HomeOutlined />}>{uniqueProperties.size}</Tag>
            <Text type="secondary">
              {uniqueProperties.size} propert{uniqueProperties.size !== 1 ? 'ies' : 'y'}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Active Leases',
      key: 'leases',
      render: (_, record) => (
        <Tag icon={<FileTextOutlined />} color="green">
          {record.leases?.length || 0}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/tenants/${record.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Calculate statistics
  const totalLeases = filteredTenants.reduce((sum, t) => sum + (t.leases?.length || 0), 0);
  const totalProperties = new Set(filteredTenants.flatMap(t => (t.leases || []).map(l => l.property?.id).filter(Boolean))).size;

  const stats = [
    {
      title: 'Total Tenants',
      value: filteredTenants.length,
      prefix: <TeamOutlined />,
    },
    {
      title: 'Total Leases',
      value: totalLeases,
      prefix: <FileTextOutlined />,
    },
    {
      title: 'Properties',
      value: totalProperties,
      prefix: <HomeOutlined />,
    },
  ];

  return (
    <PageLayout
      headerTitle={<><TeamOutlined /> Tenants</>}
      headerActions={[
        <Search
          key="search"
          placeholder="Search tenants..."
          allowClear
          style={{ width: 300 }}
          size="small"
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      ]}
      stats={stats}
      statsCols={3}
    >
      <TableWrapper>
        <Table
          dataSource={filteredTenants}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Total ${total} tenants` }}
          size="middle"
        />
      </TableWrapper>
    </PageLayout>
  );
}

