"use client";

import { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
} from 'antd';
import {
  UserOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageLayout, TableWrapper, FilterBar } from '@/components/shared';
import dayjs from 'dayjs';

export default function AdminUserActivityPage() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({});


  const fetchActivity = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filters.userRole && { userRole: filters.userRole }),
        ...(filters.action && { action: filters.action }),
        ...(filters.dateRange && filters.dateRange[0] && {
          startDate: filters.dateRange[0].toISOString(),
        }),
        ...(filters.dateRange && filters.dateRange[1] && {
          endDate: filters.dateRange[1].toISOString(),
        }),
      });

      const response = await fetch(`/api/admin/user-activity?${params}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setActivities(data.data);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching user activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [filters]);

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => record?.userName && record?.userEmail 
        ? `${record.userName} (${record.userEmail})` 
        : '-',
    },
    {
      title: 'Role',
      dataIndex: 'userRole',
      key: 'userRole',
      render: (role) => role ? <Tag>{role}</Tag> : '-',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => action ? <Tag color="blue">{action}</Tag> : '-',
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource) => resource || '-',
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip) => ip || '-',
    },
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleString() : '-',
    },
  ];

  const statsData = stats ? [
    {
      title: 'Activities (24h)',
      value: stats.last24Hours || 0,
      prefix: <UserOutlined />,
    },
    {
      title: 'Top Actions',
      value: stats.topActions?.length || 0,
      prefix: <UserOutlined />,
    },
    {
      title: 'By Role',
      value: stats.byRole?.length || 0,
      prefix: <UserOutlined />,
    },
  ] : [];

  const filterConfig = [
    {
      key: 'userRole',
      label: 'User Role',
      type: 'select',
      options: [
        { label: 'Landlord', value: 'landlord' },
        { label: 'Tenant', value: 'tenant' },
      ],
    },
    {
      key: 'action',
      label: 'Action',
      type: 'select',
      options: [
        { label: 'Login', value: 'login' },
        { label: 'Logout', value: 'logout' },
        { label: 'View Property', value: 'view_property' },
        { label: 'Upload Document', value: 'upload_document' },
      ],
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
    },
  ];

  return (
    <PageLayout
      headerTitle={<><UserOutlined /> User Activity Monitoring</>}
      headerActions={[
        <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchActivity}>
          Refresh
        </Button>
      ]}
      stats={statsData}
      statsCols={3}
      contentStyle={{ padding: 0, display: 'flex', flexDirection: 'column' }}
    >
      <FilterBar
        filters={filterConfig}
        activeFilters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onReset={() => {
          setFilters({ userRole: null, action: null, dateRange: null });
        }}
        showSearch={false}
      />
      <TableWrapper>
        <Table
          columns={columns}
          dataSource={activities}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 50 }}
        />
      </TableWrapper>
    </PageLayout>
  );
}

