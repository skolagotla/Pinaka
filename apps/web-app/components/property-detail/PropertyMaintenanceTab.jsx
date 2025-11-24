"use client";

import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Empty, message } from 'antd';
import { ToolOutlined, EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { ProCard } from '../shared/LazyProComponents';

export default function PropertyMaintenanceTab({ property }) {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!property?.id) return;

    fetchMaintenanceRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property?.id]);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.maintenance.list({ propertyId: property.id });
      const requests = response.data?.data || response.data || [];
      setRequests(requests);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      message.error('Error loading maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ProCard loading />;
  }

  if (!requests.length) {
    return (
      <ProCard>
        <Empty description="No maintenance requests found for this property" />
      </ProCard>
    );
  }

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'default',
      Medium: 'blue',
      High: 'orange',
      Urgent: 'red',
    };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      New: 'blue',
      Pending: 'orange',
      'In Progress': 'processing',
      Resolved: 'success',
      Closed: 'default',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Ticket #',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      render: (ticket) => <Tag>{ticket}</Tag>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag>{cat}</Tag>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}priority}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}status}</Tag>
      ),
    },
    {
      title: 'Requested',
      dataIndex: 'requestedDate',
      key: 'requestedDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/operations?tab=maintenance&ticketId=${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <ProCard>
      <Table
        columns={columns}
        dataSource={requests}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </ProCard>
  );
}

