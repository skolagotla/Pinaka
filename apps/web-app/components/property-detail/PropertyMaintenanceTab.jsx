"use client";

import { useState, useEffect } from 'react';
import { Badge, Button, Spinner } from 'flowbite-react';
import { HiWrench, HiEye } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { Card } from 'flowbite-react';
import FlowbiteTable from '../shared/FlowbiteTable';
import { notify } from '@/lib/utils/notification-helper';

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
      const { v2Api } = await import('@/lib/api/v2-client');
      const response = await v2Api.maintenance.list({ propertyId: property.id });
      const requests = response.data?.data || response.data || [];
      setRequests(requests);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      notify.error('Error loading maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center items-center py-12">
          <Spinner size="xl" />
        </div>
      </Card>
    );
  }

  if (!requests.length) {
    return (
      <Card>
        <div className="text-center py-12">
          <HiWrench className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No maintenance requests found for this property</p>
        </div>
      </Card>
    );
  }

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'gray',
      Medium: 'info',
      High: 'warning',
      Urgent: 'failure',
    };
    return colors[priority] || 'gray';
  };

  const getStatusColor = (status) => {
    const colors = {
      New: 'info',
      Pending: 'warning',
      'In Progress': 'info',
      Resolved: 'success',
      Closed: 'gray',
    };
    return colors[status] || 'gray';
  };

  const columns = [
    {
      title: 'Ticket #',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      render: (ticket) => <Badge color="gray">{ticket}</Badge>,
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
      render: (cat) => <Badge color="gray">{cat}</Badge>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Badge color={getPriorityColor(priority)}>{priority}</Badge>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge color={getStatusColor(status)}>{status}</Badge>
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
          color="light"
          size="sm"
          onClick={() => router.push(`/operations?tab=maintenance&ticketId=${record.id}`)}
          className="flex items-center gap-2"
        >
          <HiEye className="h-4 w-4" />
          View
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <FlowbiteTable
        columns={columns}
        dataSource={requests}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
