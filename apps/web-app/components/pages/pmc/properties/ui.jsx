"use client";

import React, { useState, useEffect } from "react";
import { 
  Typography, Table, Tag, Space, Button, Select
} from 'antd';
import { 
  HomeOutlined, TeamOutlined, FileTextOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageLayout, EmptyState, TableWrapper } from '@/components/shared';

const { Text } = Typography;

export default function PMCPropertiesClient({ pmcId, initialProperties, pmcRelationships }) {
  const router = useRouter();
  const [properties, setProperties] = useState(initialProperties || []);
  const [selectedLandlord, setSelectedLandlord] = useState('all');
  const [mounted, setMounted] = useState(false);
  
  // Fix hydration mismatch - only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get unique landlords for filter and form
  const landlords = (pmcRelationships || [])
    .filter(rel => rel.landlord) // Filter out any relationships without landlord data
    .map(rel => ({
      id: rel.landlordId,
      name: `${rel.landlord.firstName} ${rel.landlord.lastName}`,
      email: rel.landlord.email,
    }));

  // Filter properties by selected landlord
  const filteredProperties = selectedLandlord === 'all' 
    ? properties 
    : properties.filter(p => {
        // Ensure both values are strings for comparison
        const propertyLandlordId = String(p.landlordId || '');
        const selectedId = String(selectedLandlord || '');
        return propertyLandlordId === selectedId;
      });

  const columns = [
    {
      title: 'Property',
      key: 'property',
      render: (_, record) => (
        <div>
          <Text strong>{record.addressLine1 || record.propertyName}</Text>
          {record.propertyName && record.addressLine1 && (
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.propertyName}
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.city}, {record.provinceState} {record.postalZip}
          </div>
        </div>
      ),
    },
    {
      title: 'Owned By',
      key: 'landlord',
      render: (_, record) => (
        <div>
          <Text strong>
            {record.landlord ? `${record.landlord.firstName} ${record.landlord.lastName}` : 'N/A'}
          </Text>
          {record.landlord?.email && (
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.landlord.email}
            </div>
          )}
        </div>
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
          <Text type="secondary">
            {record.units?.filter(u => u.leases?.length > 0).length || 0} occupied
          </Text>
        </Space>
      ),
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
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/properties/${record.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Calculate statistics
  const totalUnits = filteredProperties.reduce((sum, p) => sum + (p.units?.length || 0), 0);
  const totalLeases = filteredProperties.reduce((sum, p) => {
    return sum + (p.units?.reduce((unitSum, unit) => {
      return unitSum + (unit.leases?.length || 0);
    }, 0) || 0);
  }, 0);

  // Prepare statistics
  const stats = [
    {
      title: 'Properties',
      value: filteredProperties.length,
      prefix: <HomeOutlined />,
      valueStyle: { color: '#1890ff' },
    },
    {
      title: 'Total Units',
      value: totalUnits,
      prefix: <HomeOutlined />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Active Leases',
      value: totalLeases,
      prefix: <FileTextOutlined />,
      valueStyle: { color: '#722ed1' },
    },
    {
      title: 'Landlords',
      value: landlords.length,
      prefix: <TeamOutlined />,
      valueStyle: { color: '#faad14' },
    },
  ];

  // Prepare header actions - Searchable Landlord Filter (Always show for PMC users)
  // Only render after mount to prevent hydration mismatch
  const headerActions = mounted ? (
    <Space>
      <TeamOutlined style={{ color: '#1890ff' }} />
      <Select
        value={selectedLandlord}
        onChange={setSelectedLandlord}
        style={{ minWidth: 300 }}
        placeholder={landlords.length > 0 ? "Search and filter by Landlord..." : "No landlords available"}
        showSearch={landlords.length > 0}
        allowClear={landlords.length > 0}
        disabled={landlords.length === 0}
        filterOption={landlords.length > 0 ? (input, option) => {
          const searchText = input.toLowerCase();
          // Get the landlord data from the option value
          const optionValue = option?.value;
          if (optionValue === 'all') {
            return 'all landlords'.includes(searchText);
          }
          const landlord = landlords.find(l => l.id === optionValue);
          if (!landlord) return false;
          // Search in name and email
          return (
            landlord.name.toLowerCase().includes(searchText) ||
            landlord.email.toLowerCase().includes(searchText)
          );
        } : false}
        optionLabelProp="label"
        notFoundContent={landlords.length > 0 ? "No landlords found" : "No landlords available"}
      >
        <Select.Option value="all" label="All Landlords">
          <Space>
            <TeamOutlined />
            <span>All Landlords</span>
            {landlords.length > 0 && (
              <Tag color="blue" style={{ marginLeft: 8 }}>{landlords.length}</Tag>
            )}
          </Space>
        </Select.Option>
        {landlords.length > 0 ? (
          landlords.map(landlord => (
            <Select.Option 
              key={landlord.id} 
              value={landlord.id}
              label={`${landlord.name} (${landlord.email})`}
            >
              <Space direction="vertical" size={0} style={{ width: '100%' }}>
                <Text strong>{landlord.name}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>{landlord.email}</Text>
              </Space>
            </Select.Option>
          ))
        ) : (
          <Select.Option value="none" disabled>
            <Text type="secondary">No landlords available</Text>
          </Select.Option>
        )}
      </Select>
    </Space>
  ) : null;

  return (
    <PageLayout
      headerTitle={<><HomeOutlined /> Managed Properties</>}
      headerActions={headerActions}
      stats={stats}
      statsCols={4}
    >
      {filteredProperties.length === 0 ? (
        <EmptyState
          icon={<HomeOutlined />}
          title="No properties found"
          description="No properties are currently managed"
        />
      ) : (
        <TableWrapper>
          <Table
            dataSource={filteredProperties}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Total ${total} properties` }}
            size="middle"
          />
        </TableWrapper>
      )}
    </PageLayout>
  );
}

