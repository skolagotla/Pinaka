"use client";

import { useState, useEffect } from 'react';
import { Button, Badge, Spinner } from 'flowbite-react';
import { HiRefresh, HiClock } from 'react-icons/hi';
import { PageLayout, TableWrapper, FilterBar, renderDate, FlowbiteTable } from '@/components/shared';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
// useUnifiedApi removed - use v2Api from @/lib/api/v2-client';
import { formatDateTimeDisplay as formatDateTimeLocal } from '@/lib/utils/date-utils';
import dayjs from 'dayjs';

const ACTION_COLORS = {
  create: 'green',
  update: 'blue',
  delete: 'red',
  view: 'gray',
  approve: 'success',
  reject: 'failure',
  send: 'cyan',
  upload: 'purple',
};

const ENTITY_TYPES = [
  { label: 'All Types', value: '' },
  { label: 'Property', value: 'property' },
  { label: 'Tenant', value: 'tenant' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Lease', value: 'lease' },
  { label: 'Payment', value: 'payment' },
  { label: 'Document', value: 'document' },
  { label: 'Vendor', value: 'vendor' },
  { label: 'Expense', value: 'expense' },
];

const ACTIONS = [
  { label: 'All Actions', value: '' },
  { label: 'Create', value: 'create' },
  { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' },
  { label: 'View', value: 'view' },
  { label: 'Approve', value: 'approve' },
  { label: 'Reject', value: 'reject' },
];

export default function PMCActivityLogsClient({ user }) {
  const { fetch, loading } = useUnifiedApi({ showUserMessage: true });
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    loadActivities();
  }, [pagination.page, filters]);

  const loadActivities = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('startDate', filters.startDate.format('YYYY-MM-DD'));
      if (filters.endDate) params.append('endDate', filters.endDate.format('YYYY-MM-DD'));

      // TODO: Implement v2 endpoint for activity logs
      const { apiClient } = await import('@/lib/utils/api-client');
      const response = await apiClient(`/api/v1/activity-logs?${params.toString()}`, {
        method: 'GET',
      });

      if (response && response.ok) {
        const data = await response.json();
        setActivities(data.data || data.activities || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setFilters(prev => ({
        ...prev,
        startDate: dates[0],
        endDate: dates[1],
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        startDate: null,
        endDate: null,
      }));
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setFilters({
      entityType: '',
      action: '',
      startDate: null,
      endDate: null,
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const filterConfig = [
    {
      key: 'entityType',
      label: 'Entity Type',
      type: 'select',
      options: ENTITY_TYPES.filter(opt => opt.value !== '').map(opt => ({
        label: opt.label,
        value: opt.value,
      })),
    },
    {
      key: 'action',
      label: 'Action',
      type: 'select',
      options: ACTIONS.filter(opt => opt.value !== '').map(opt => ({
        label: opt.label,
        value: opt.value,
      })),
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'dateRange',
    },
  ];

  const activeFilters = {
    entityType: filters.entityType || null,
    action: filters.action || null,
    dateRange: filters.startDate && filters.endDate ? [filters.startDate, filters.endDate] : null,
  };

  const columns = [
    {
      header: 'Date & Time',
      accessorKey: 'createdAt',
      cell: ({ row }) => {
        const date = row.original.createdAt;
        if (!date) return '-';
        try {
          return formatDateTimeLocal(date);
        } catch (error) {
          console.error('Date formatting error:', error);
          return new Date(date).toLocaleString();
        }
      },
    },
    {
      header: 'User',
      accessorKey: 'userName',
      cell: ({ row }) => <span className="font-semibold">{row.original.userName || '-'}</span>,
    },
    {
      header: 'Role',
      accessorKey: 'userRole',
      cell: ({ row }) => {
        const role = row.original.userRole;
        const color = role === 'landlord' ? 'blue' : role === 'tenant' ? 'green' : 'gray';
        return <Badge color={color}role || '-'}</Badge>;
      },
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: ({ row }) => {
        const action = row.original.action?.toLowerCase();
        const color = ACTION_COLORS[action] || 'gray';
        return <Badge color={color}row.original.action || '-'}</Badge>;
      },
    },
    {
      header: 'Entity',
      accessorKey: 'entityType',
      cell: ({ row }) => <span className="capitalize">{row.original.entityType || '-'}</span>,
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ row }) => {
        const record = row.original;
        
        // Parse metadata if it's a string (Prisma Json field)
        let metadata = record.metadata;
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata);
          } catch (e) {
            console.error('Failed to parse metadata:', e);
            metadata = null;
          }
        }
        
        // SIMPLIFIED: Always use description field if it exists
        if (record.description) {
          return <span>{record.description}</span>;
        }
        
        // Fallback: If no description, try to construct from metadata
        if (metadata && metadata.fieldChanges && Array.isArray(metadata.fieldChanges) && metadata.fieldChanges.length > 0) {
          const changeDescriptions = metadata.fieldChanges.map((change) => {
            const field = change?.field || 'Unknown';
            const oldVal = change?.oldValue || '(empty)';
            const newVal = change?.newValue || '(empty)';
            return `${field}: "${oldVal}" → "${newVal}"`;
          });
          const entityName = record.entityName || record.entityId?.substring(0, 8) || 'Unknown';
          const userName = record.userName || 'User';
          return <span>{`${userName} updated ${record.entityType} "${entityName}" - ${changeDescriptions.join('; ')}`}</span>;
        }
        
        // Fallback 2: Use changedFields if available
        if (metadata && metadata.changedFields && Array.isArray(metadata.changedFields) && metadata.changedFields.length > 0) {
          const fieldNames = metadata.changedFields.join(', ');
          const entityName = record.entityName || record.entityId?.substring(0, 8) || 'Unknown';
          const userName = record.userName || 'User';
          return <span>{`${userName} updated ${record.entityType} "${entityName}" - Changed: ${fieldNames}`}</span>;
        }
        
        // Fallback to default description
        const action = record.action?.toLowerCase() || 'unknown';
        const entity = record.entityType?.toLowerCase() || 'item';
        const name = record.entityName || record.entityId?.substring(0, 8) || 'unknown';
        return <span>{action} {entity} "{name}"</span>;
      },
    },
  ];

  return (
    <PageLayout
      headerTitle={<><HiClock className="inline mr-2" /> Activity Log</>}
      headerDescription="Track all system activities and user actions"
      headerActions={
        <Button key="refresh" onClick={() => loadActivities()} disabled={loading}>
          {loading ? <Spinner size="sm" className="mr-2" /> : <HiRefresh className="mr-2 h-5 w-5" />}
          Refresh
        </Button>
      }
      contentStyle={{ padding: 0, display: 'flex', flexDirection: 'column' }}
    >
      <FilterBar
        filters={filterConfig}
        activeFilters={activeFilters}
        onFilterChange={(newFilters) => {
          if (newFilters.dateRange && newFilters.dateRange.length === 2) {
            handleDateRangeChange(newFilters.dateRange);
          } else {
            handleDateRangeChange(null);
          }
          if (newFilters.entityType !== undefined) {
            handleFilterChange('entityType', newFilters.entityType || '');
          }
          if (newFilters.action !== undefined) {
            handleFilterChange('action', newFilters.action || '');
          }
        }}
        onReset={handleReset}
        showSearch={false}
      />
      <TableWrapper>
        <FlowbiteTable
          data={activities}
          columns={columns}
          keyField="id"
          loading={loading}
          pagination={{
            pageSize: pagination.limit,
            currentPage: pagination.page,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} activities`,
            onPageChange: (page) => setPagination(prev => ({ ...prev, page })),
            onPageSizeChange: (pageSize) => setPagination(prev => ({ ...prev, limit: pageSize, page: 1 })),
          }}
        />
      </TableWrapper>
    </PageLayout>
  );
}
