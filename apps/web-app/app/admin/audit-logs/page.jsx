"use client";

import { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
  Typography,
  message,
} from 'antd';
import {
  FileTextOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { PageLayout, TableWrapper, FilterBar } from '@/components/shared';

export default function AdminAuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0 });
  const [filters, setFilters] = useState({
    adminId: '',
    action: '',
    resource: '',
    success: '',
    search: '',
    dateRange: null,
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters.action, filters.resource, filters.success, filters.dateRange, filters.search]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.adminId && { adminId: filters.adminId }),
        ...(filters.action && { action: filters.action }),
        ...(filters.resource && { resource: filters.resource }),
        ...(filters.success && { success: filters.success }),
        ...(filters.search && { search: filters.search }),
        ...(filters.dateRange && filters.dateRange[0] && {
          startDate: filters.dateRange[0].toISOString(),
        }),
        ...(filters.dateRange && filters.dateRange[1] && {
          endDate: filters.dateRange[1].toISOString(),
        }),
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setLogs(data.data);
        setPagination(prev => ({ ...prev, total: data.pagination.total }));
      } else {
        message.error(data.error || 'Failed to fetch audit logs');
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      message.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Admin', 'Action', 'Resource', 'Success', 'IP Address', 'Details'].join(','),
      ...logs.map(log => [
        new Date(log.createdAt).toISOString(),
        log.admin ? `${log.admin.firstName} ${log.admin.lastName}` : 'System',
        log.action,
        log.resource || '',
        log.success ? 'Yes' : 'No',
        log.ipAddress || '',
        JSON.stringify(log.details || {}),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
      width: 180,
    },
    {
      title: 'Admin',
      key: 'admin',
      render: (_, record) => {
        if (record.admin) {
          // Admin user
          const name = `${record.admin.firstName || ''} ${record.admin.lastName || ''}`.trim();
          return name ? `${name} (${record.googleEmail || record.admin.email})` : (record.googleEmail || record.admin.email);
        }
        // Non-admin user (landlord, tenant, pmc) - check details
        if (record.details?.userName || record.details?.userEmail) {
          return record.details.userName || record.details.userEmail;
        }
        // Fallback
        return record.googleEmail || record.targetUserRole || 'System';
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => <Tag color="blue">{action}</Tag>,
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource) => resource || '-',
    },
    {
      title: 'Status',
      dataIndex: 'success',
      key: 'success',
      render: (success) => (
        <Tag color={success ? 'success' : 'error'}>
          {success ? 'Success' : 'Failed'}
        </Tag>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip) => ip || '-',
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (details) => (
        <Typography.Text
          ellipsis
          style={{ maxWidth: 200 }}
          title={JSON.stringify(details, null, 2)}
        >
          {details ? JSON.stringify(details).substring(0, 50) : '-'}
        </Typography.Text>
      ),
    },
  ];

  const filterConfig = [
    {
      key: 'action',
      label: 'Action',
      type: 'select',
      options: [
        { label: 'Login Success', value: 'login_success' },
        { label: 'Login Failed', value: 'login_failed' },
        { label: 'Create User', value: 'create_user' },
        { label: 'Update User', value: 'update_user' },
        { label: 'Suspend User', value: 'suspend_user' },
        { label: 'Update Settings', value: 'update_settings' },
      ],
    },
    {
      key: 'resource',
      label: 'Resource',
      type: 'select',
      options: [
        { label: 'Landlord', value: 'landlord' },
        { label: 'Tenant', value: 'tenant' },
        { label: 'Platform', value: 'platform' },
      ],
    },
    {
      key: 'success',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Success', value: 'true' },
        { label: 'Failed', value: 'false' },
      ],
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'dateRange',
    },
  ];

  return (
    <PageLayout
      headerTitle={<><FileTextOutlined /> Audit Logs</>}
      headerActions={[
        <Button key="export" icon={<DownloadOutlined />} onClick={handleExport}>
          Export CSV
        </Button>,
        <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchLogs}>
          Refresh
        </Button>,
      ]}
      contentStyle={{ padding: 0, display: 'flex', flexDirection: 'column' }}
    >
      <FilterBar
        filters={filterConfig}
        activeFilters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onReset={() => {
          setFilters({
            adminId: '',
            action: '',
            resource: '',
            success: '',
            search: '',
            dateRange: null,
          });
        }}
        searchValue={filters.search}
        onSearchChange={(value) => setFilters({ ...filters, search: value })}
        searchPlaceholder="Search audit logs..."
      />
      <TableWrapper>
        <Table
          columns={columns}
          dataSource={logs}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page) => setPagination({ ...pagination, page }),
          }}
          scroll={{ x: 1200 }}
        />
      </TableWrapper>
    </PageLayout>
  );
}

