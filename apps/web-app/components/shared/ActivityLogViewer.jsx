"use client";

import { useState, useEffect } from 'react';
import { Table, Tag, Space, Select, Card, Empty } from 'antd';
import { HistoryOutlined, EyeOutlined } from '@ant-design/icons';
import { ProCard } from './LazyProComponents';
import { formatDateDisplay, formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';

const { Option } = Select;

/**
 * Activity Log Viewer Component
 * Displays activity logs for properties, landlords, or PMCs
 */
export default function ActivityLogViewer({ propertyId, userRole, limit = 50 }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    action: null,
    userType: null,
  });
  useEffect(() => {
    fetchLogs();
  }, [propertyId, filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: '0',
      });

      if (propertyId) {
        params.append('propertyId', propertyId);
      }

      if (filter.action) {
        params.append('action', filter.action);
      }

      if (filter.userType) {
        params.append('userType', filter.userType);
      }

      // Use adminApi for activity logs
      const { adminApi } = await import('@/lib/api/admin-api');
      const query = {};
      if (filter.userType) query.userType = filter.userType;
      if (filter.type) query.type = filter.type;
      if (filter.page) query.page = filter.page;
      if (filter.limit) query.limit = filter.limit;
      if (filter.userId) query.userId = filter.userId;
      const data = await adminApi.getActivityLogs(query);
      
      if (data.success || data.data) {
        setLogs(data.data || data.logs || []);
      }
    } catch (error) {
      console.error('[Activity Log Viewer] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      view: 'blue',
      edit_attempt: 'orange',
      approval_request: 'purple',
      approval_approved: 'green',
      approval_rejected: 'red',
      create: 'cyan',
      delete: 'red',
    };
    return colors[action] || 'default';
  };

  const columns = [
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Tag color={getActionColor(record.action)}>
          {record.action.replace(/_/g, ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Entity',
      key: 'entity',
      render: (_, record) => (
        <Space>
          <span>{record.entityType}</span>
          {record.entityId && (
            <Tag>{record.entityId.substring(0, 8)}...</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Property',
      key: 'property',
      render: (_, record) => (
        record.property ? (
          <span>{record.property.propertyName || record.property.addressLine1}</span>
        ) : '-'
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? formatDateTimeDisplay(date) : '-',
    },
  ];

  return (
    <ProCard
      title={
        <Space>
          <HistoryOutlined />
          <span>Activity Log</span>
        </Space>
      }
      extra={
        <Space>
          <Select
            placeholder="Filter by Action"
            allowClear
            style={{ width: 150 }}
            value={filter.action}
            onChange={(value) => setFilter({ ...filter, action: value })}
          >
            <Option value="view">View</Option>
            <Option value="edit_attempt">Edit Attempt</Option>
            <Option value="approval_request">Approval Request</Option>
            <Option value="approval_approved">Approved</Option>
            <Option value="approval_rejected">Rejected</Option>
            <Option value="create">Create</Option>
            <Option value="delete">Delete</Option>
          </Select>
          <Select
            placeholder="Filter by User Type"
            allowClear
            style={{ width: 150 }}
            value={filter.userType}
            onChange={(value) => setFilter({ ...filter, userType: value })}
          >
            <Option value="pmc">PMC</Option>
            <Option value="landlord">Landlord</Option>
            <Option value="tenant">Tenant</Option>
          </Select>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: <Empty description="No activity logs found" />,
        }}
      />
    </ProCard>
  );
}

