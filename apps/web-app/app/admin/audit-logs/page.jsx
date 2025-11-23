"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableRow, TableCell, Button, TextInput, Select, Card, Badge, Spinner, Alert } from 'flowbite-react';
import {
  HiDocumentText,
  HiRefresh,
  HiDownload,
} from 'react-icons/hi';
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
        alert(data.error || 'Failed to fetch audit logs');
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      alert('Failed to fetch audit logs');
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HiDocumentText className="h-6 w-6" />
          Audit Logs
        </h1>
        <div className="flex gap-2">
          <Button color="gray" onClick={fetchLogs} disabled={loading}>
            <HiRefresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button color="blue" onClick={handleExport}>
            <HiDownload className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextInput
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
          </Select>
          <Select
            value={filters.resource}
            onChange={(e) => setFilters({ ...filters, resource: e.target.value })}
          >
            <option value="">All Resources</option>
            <option value="User">User</option>
            <option value="Property">Property</option>
            <option value="Lease">Lease</option>
            <option value="Payment">Payment</option>
          </Select>
          <Select
            value={filters.success}
            onChange={(e) => setFilters({ ...filters, success: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="true">Success</option>
            <option value="false">Failed</option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <TableWrapper>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="xl" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <HiDocumentText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Head className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <Table.HeadCell scope="col">Timestamp</Table.HeadCell>
                <Table.HeadCell scope="col">Admin</Table.HeadCell>
                <Table.HeadCell scope="col">Action</Table.HeadCell>
                <Table.HeadCell scope="col">Resource</Table.HeadCell>
                <Table.HeadCell scope="col">Status</Table.HeadCell>
                <Table.HeadCell scope="col">IP Address</Table.HeadCell>
                <Table.HeadCell scope="col">Details</Table.HeadCell>
              </Table.Head>
              <TableBody className="divide-y">
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {log.admin
                        ? `${log.admin.firstName || ''} ${log.admin.lastName || ''}`.trim() || log.admin.email
                        : log.details?.userName || log.details?.userEmail || 'System'}
                    </TableCell>
                    <TableCell>
                      <Badge color="blue">{log.action}</Badge>
                    </TableCell>
                    <TableCell>{log.resource || '-'}</TableCell>
                    <TableCell>
                      <Badge color={log.success ? 'success' : 'failure'}>
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.ipAddress || '-'}</TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-500">
                        {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '-'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex gap-2">
              <Button
                color="gray"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              >
                Previous
              </Button>
              <Button
                color="gray"
                size="sm"
                disabled={pagination.page * pagination.limit >= pagination.total}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </TableWrapper>
    </div>
  );
}
