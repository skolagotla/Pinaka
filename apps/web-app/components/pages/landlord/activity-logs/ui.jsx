"use client";

import { useState, useEffect } from 'react';
import { Table, Button, Typography, Tag } from 'antd';
import { ReloadOutlined, HistoryOutlined } from '@ant-design/icons';
import { PageLayout, TableWrapper, FilterBar, renderDate } from '@/components/shared';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { formatDateTimeDisplay as formatDateTimeLocal } from '@/lib/utils/date-utils';
import dayjs from 'dayjs';

const { Text } = Typography;

const ACTION_COLORS = {
  create: 'green',
  update: 'blue',
  delete: 'red',
  view: 'default',
  approve: 'success',
  reject: 'error',
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

export default function ActivityLogsClient({ user }) {
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

      const response = await fetch(
        `/api/activity-logs?${params.toString()}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        { operation: 'Load activity logs' }
      );

      if (response && response.ok) {
        const data = await response.json();
        console.log('[Activity Logs UI] Received activities:', data.activities?.length || 0);
        if (data.activities && data.activities.length > 0) {
          const propertyUpdate = data.activities.find(a => a.entityType === 'property' && a.action === 'update');
          if (propertyUpdate) {
            console.log('[Activity Logs UI] Property update entry:', {
              description: propertyUpdate.description,
              metadata: propertyUpdate.metadata,
              hasChangedFields: propertyUpdate.metadata?.changedFields ? propertyUpdate.metadata.changedFields.length : 0,
              changedFields: propertyUpdate.metadata?.changedFields
            });
          }
        }
        setActivities(data.activities || []);
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
    customizeColumn(STANDARD_COLUMNS.CREATED_DATE, {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      width: 180,
      render: (date) => {
        if (!date) return '-';
        try {
          // Use local timezone formatting instead of UTC
          return formatDateTimeLocal(date);
        } catch (error) {
          console.error('Date formatting error:', error);
          return new Date(date).toLocaleString();
        }
      },
      sorter: true,
    }),
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
      render: (name) => <Text strong>{name || '-'}</Text>,
    },
    {
      title: 'Role',
      dataIndex: 'userRole',
      key: 'userRole',
      width: 100,
      render: (role) => (
        <Tag color={role === 'landlord' ? 'blue' : role === 'tenant' ? 'green' : 'default'}>
          {role || '-'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action) => (
        <Tag color={ACTION_COLORS[action?.toLowerCase()] || 'default'}>
          {action || '-'}
        </Tag>
      ),
    },
    {
      title: 'Entity',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 120,
      render: (type) => <Text style={{ textTransform: 'capitalize' }}>{type || '-'}</Text>,
    },
    {
      title: 'Description',
      key: 'description',
      render: (_, record) => {
        // Debug logging for property updates
        if (record.entityType === 'property' && record.action === 'update') {
          console.log('[Activity Logs UI] Rendering property update description:', {
            description: record.description,
            metadata: record.metadata,
            hasChangedFields: record.metadata?.changedFields ? record.metadata.changedFields.length : 0
          });
        }
        
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
        
        // SIMPLIFIED: Always use description field if it exists (it should contain all the info)
        if (record.description) {
          return <Text>{record.description}</Text>;
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
          return <Text>{`${userName} updated ${record.entityType} "${entityName}" - ${changeDescriptions.join('; ')}`}</Text>;
        }
        
        // Fallback 2: Use changedFields if available
        if (metadata && metadata.changedFields && Array.isArray(metadata.changedFields) && metadata.changedFields.length > 0) {
          const fieldNames = metadata.changedFields.join(', ');
          const entityName = record.entityName || record.entityId?.substring(0, 8) || 'Unknown';
          const userName = record.userName || 'User';
          return <Text>{`${userName} updated ${record.entityType} "${entityName}" - Changed: ${fieldNames}`}</Text>;
        }
        
        // Fallback to default description
        const action = record.action?.toLowerCase() || 'unknown';
        const entity = record.entityType?.toLowerCase() || 'item';
        const name = record.entityName || record.entityId?.substring(0, 8) || 'unknown';
        return <Text>{action} {entity} "{name}"</Text>;
      },
    },
  ];

  return (
    <PageLayout
      headerTitle={<><HistoryOutlined /> Activity Log</>}
      headerDescription="Track all system activities and user actions"
      headerActions={[
        <Button key="refresh" icon={<ReloadOutlined />} onClick={() => loadActivities()}>
          Refresh
        </Button>
      ]}
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
        <Table
          columns={columns}
          dataSource={activities}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} activities`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, page, limit: pageSize }));
            },
          }}
          size="middle"
        />
      </TableWrapper>
    </PageLayout>
  );
}

