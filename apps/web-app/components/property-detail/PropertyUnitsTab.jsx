"use client";

import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Empty } from 'antd';
import { HomeOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { ProCard } from '../shared/LazyProComponents';

export default function PropertyUnitsTab({ property }) {
  const [units, setUnits] = useState(property?.units || []);

  if (!property || !units.length) {
    return (
      <ProCard>
        <Empty description="No units found for this property" />
      </ProCard>
    );
  }

  const columns = [
    {
      title: 'Unit',
      key: 'unitName',
      render: (_, record) => (
        <Space>
          <HomeOutlined />
          <strong>{record.unitName || 'Unnamed Unit'}</strong>
        </Space>
      ),
    },
    {
      title: 'Floor',
      dataIndex: 'floorNumber',
      key: 'floorNumber',
      render: (floor) => floor !== null ? `Floor ${floor}` : '-',
    },
    {
      title: 'Bedrooms',
      dataIndex: 'bedrooms',
      key: 'bedrooms',
    },
    {
      title: 'Bathrooms',
      dataIndex: 'bathrooms',
      key: 'bathrooms',
    },
    {
      title: 'Rent',
      dataIndex: 'rentPrice',
      key: 'rentPrice',
      render: (rent) => rent ? `$${rent.toLocaleString()}` : '-',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const hasActiveLease = record.leases?.some(l => l.status === 'Active');
        return hasActiveLease ? (
          <Tag color="green">Occupied</Tag>
        ) : (
          <Tag color="default">Vacant</Tag>
        );
      },
    },
    {
      title: 'Active Leases',
      key: 'leases',
      render: (_, record) => {
        const activeLeases = record.leases?.filter(l => l.status === 'Active') || [];
        return (
          <Space>
            <FileTextOutlined />
            <span>{activeLeases.length}</span>
          </Space>
        );
      },
    },
    {
      title: 'Tenants',
      key: 'tenants',
      render: (_, record) => {
        const tenants = record.leases?.flatMap(l => 
          l.leaseTenants?.map(lt => lt.tenant) || []
        ) || [];
        const uniqueTenants = [...new Map(tenants.map(t => [t.id, t])).values()];
        return (
          <Space>
            <TeamOutlined />
            <span>{uniqueTenants.length}</span>
          </Space>
        );
      },
    },
  ];

  return (
    <ProCard>
      <Table
        columns={columns}
        dataSource={units}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </ProCard>
  );
}

