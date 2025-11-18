/**
 * TenantsTab Component
 * 
 * Tab component for managing tenants
 * Extracted from tenants-leases/ui.jsx for better code organization
 */

import React, { useMemo } from 'react';
import { Table, Card, Empty, Space, Button, Tooltip, Popconfirm, Tag, Typography } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;
import { useResizableTable, configureTableColumns, useBulkOperations, useSearch } from '@/lib/hooks';
import { formatPhoneNumber } from '@/lib/utils/formatters';
import BulkActionsToolbar from '../BulkActionsToolbar';
import { PageLayout, TableWrapper, EmptyState } from '../';

/**
 * Memoized Tenants Tab
 */
const TenantsTab = React.memo(({
  tenants,
  units,
  loading,
  onAddTenant,
  onEditTenant,
  onDeleteTenant,
  onRefresh,
  searchPlaceholder = "Search tenants by name, email, phone, or address...",
  calculateStats,
}) => {
  // Search functionality
  const search = useSearch(
    tenants,
    ['firstName', 'lastName', 'email', 'phone', 'currentAddress'],
    { debounceMs: 300 }
  );

  // Calculate stats
  const stats = useMemo(() => {
    if (!calculateStats) return [];
    return calculateStats(search.filteredData);
  }, [calculateStats, search.filteredData]);

  // Bulk operations
  const bulkOps = useBulkOperations({
    onBulkAction: async (action, selectedIds) => {
      if (action === 'export') {
        const selectedTenants = search.filteredData.filter(t => selectedIds.includes(t.id));
        const csv = [
          ['Name', 'Email', 'Phone', 'Address'].join(','),
          ...selectedTenants.map(t => [
            `"${t.firstName} ${t.lastName}"`,
            t.email || '',
            t.phone || '',
            t.currentAddress || ''
          ].join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tenants-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        return true;
      }
      return false;
    },
  });

  // Table columns
  const columns = useMemo(() => {
    return configureTableColumns([
      {
        title: 'Name',
        key: 'name',
        dataIndex: 'name',
        width: 200,
        render: (_, tenant) => (
          <Space>
            <UserOutlined style={{ color: '#1890ff' }} />
            <Text strong>{tenant.firstName} {tenant.lastName}</Text>
          </Space>
        ),
      },
      {
        title: 'Email',
        key: 'email',
        dataIndex: 'email',
        width: 200,
        render: (email) => <Text>{email}</Text>,
      },
      {
        title: 'Phone',
        key: 'phone',
        dataIndex: 'phone',
        width: 150,
        render: (phone) => phone ? <Text>{formatPhoneNumber(phone)}</Text> : <Text type="secondary">—</Text>,
      },
      {
        title: 'Status',
        key: 'status',
        align: 'center',
        width: 150,
        render: (_, tenant) => {
          const hasActiveLease = tenant.leaseTenants?.some(lt => lt.lease?.status === 'Active');
          return hasActiveLease ? (
            <Tag color="success">Active Lease</Tag>
          ) : (
            <Tag color="default">No Active Lease</Tag>
          );
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 150,
        render: (_, tenant) => (
          <Space size="small">
            <Tooltip title="Edit Tenant">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => onEditTenant && onEditTenant(tenant)}
              />
            </Tooltip>
            <Popconfirm
              title="Delete tenant?"
              description="This action cannot be undone."
              onConfirm={() => onDeleteTenant && onDeleteTenant(tenant.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete Tenant">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ]);
  }, [onEditTenant, onDeleteTenant]);

  // Resizable table
  const { tableProps } = useResizableTable(columns, {
    storageKey: 'tenants-table',
    defaultSort: { field: 'name', order: 'ascend' },
  });

  return (
    <PageLayout
      title="Tenants"
      searchValue={search.searchTerm}
      onSearchChange={search.setSearchTerm}
      onSearchClear={search.clearSearch}
      searchPlaceholder={searchPlaceholder}
      stats={stats}
      actions={[
        {
          key: 'refresh',
          icon: <span style={{ fontSize: 16 }}>↻</span>,
          tooltip: 'Refresh',
          onClick: onRefresh,
        },
        {
          key: 'add',
          icon: <PlusOutlined />,
          tooltip: 'Add Tenant',
          onClick: onAddTenant,
          type: 'primary'
        }
      ]}
    >
      {(!tenants || tenants.length === 0) && !loading ? (
        <EmptyState
          icon={<UserOutlined />}
          description={
            <div>
              <Text strong type="secondary">No tenants yet</Text>
              <br />
              <Text type="secondary">Click "Add Tenant" to add your first tenant</Text>
            </div>
          }
        />
      ) : (
        <>
          <BulkActionsToolbar
            selectionCount={bulkOps.selectionCount}
            onBulkExport={() => bulkOps.handleBulkAction('export')}
            availableActions={['export']}
          />
          <TableWrapper>
            <Table
              {...tableProps}
              dataSource={search.filteredData || []}
              rowKey="id"
              loading={loading}
              rowSelection={{
                selectedRowKeys: bulkOps.selectedRowKeys,
                onChange: bulkOps.setSelectedRowKeys,
              }}
              pagination={{
                pageSize: 25,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} tenants`,
              }}
              size="middle"
            />
          </TableWrapper>
        </>
      )}
    </PageLayout>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.tenants === nextProps.tenants &&
    prevProps.units === nextProps.units
  );
});

TenantsTab.displayName = 'TenantsTab';

export default TenantsTab;

