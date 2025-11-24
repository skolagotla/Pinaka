"use client";

import { useState, useEffect } from 'react';
import { Table, Badge, Select, Card } from 'flowbite-react';
import { HiClock, HiEye } from 'react-icons/hi';
import { ProCard } from './LazyProComponents';
import { formatDateDisplay, formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';

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
      edit_attempt: 'yellow',
      approval_request: 'purple',
      approval_approved: 'green',
      approval_rejected: 'red',
      create: 'cyan',
      delete: 'red',
    };
    return colors[action] || 'gray';
  };

  return (
    <ProCard className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiClock className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Activity Log</h3>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filter.action || ''}
            onChange={(e) => setFilter({ ...filter, action: e.target.value || null })}
            className="w-40"
          >
            <option value="">Filter by Action</option>
            <option value="view">View</option>
            <option value="edit_attempt">Edit Attempt</option>
            <option value="approval_request">Approval Request</option>
            <option value="approval_approved">Approved</option>
            <option value="approval_rejected">Rejected</option>
            <option value="create">Create</option>
            <option value="delete">Delete</option>
          </Select>
          <Select
            value={filter.userType || ''}
            onChange={(e) => setFilter({ ...filter, userType: e.target.value || null })}
            className="w-40"
          >
            <option value="">Filter by User Type</option>
            <option value="pmc">PMC</option>
            <option value="landlord">Landlord</option>
            <option value="tenant">Tenant</option>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Action</Table.HeadCell>
            <Table.HeadCell>Entity</Table.HeadCell>
            <Table.HeadCell>Property</Table.HeadCell>
            <Table.HeadCell>Description</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : logs.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5} className="text-center py-8">
                  <Empty description="No activity logs found" />
                </Table.Cell>
              </Table.Row>
            ) : (
              logs.map((log) => (
                <Table.Row key={log.id}>
                  <Table.Cell>
                    <Badge color={getActionColor(log.action)}>
                      {log.action.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <span>{log.entityType}</span>
                      {log.entityId && (
                        <Badge color="gray" size="sm">
                          {log.entityId.substring(0, 8)}...
                        </Badge>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {log.property ? (
                      <span>{log.property.propertyName || log.property.addressLine1}</span>
                    ) : '-'}
                  </Table.Cell>
                  <Table.Cell className="max-w-xs truncate">
                    {log.description}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {log.createdAt ? formatDateTimeDisplay(log.createdAt) : '-'}
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
    </ProCard>
  );
}
