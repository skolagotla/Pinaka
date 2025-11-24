/**
 * TenantsTab Component
 * 
 * Tab component for managing tenants
 * Converted to Flowbite UI + v2 API
 */

import React, { useMemo } from 'react';
import { Button, Badge, Spinner } from 'flowbite-react';
import { HiUser, HiPencil, HiTrash, HiPlus } from 'react-icons/hi';
import { useResizableTable, configureTableColumns, useBulkOperations, useSearch } from '@/lib/hooks';
import { formatPhoneNumber } from '@/lib/utils/formatters';
import BulkActionsToolbar from '../BulkActionsToolbar';
import { PageLayout, TableWrapper, EmptyState } from '../';
import FlowbiteTable from '../FlowbiteTable';
import FlowbitePopconfirm from '../FlowbitePopconfirm';
import { ActionButton } from '../buttons';

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
        a.download = `tenants-${new Date().toISOString().split('T')[0].csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        return true;
      }
      return false;
    },
  });

  // Table columns
  const columns = useMemo(() => {
    return configureTableColumns(>{
      {
        title: 'Name',
        key: 'name',
        dataIndex: 'name',
        width: 200,
        render: (_, tenant) => (
          <div className="flex items-center gap-2">
            <HiUser className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">{tenant.firstName} {tenant.lastName}</span>
          </div>
        ),
      },
      {
        title: 'Email',
        key: 'email',
        dataIndex: 'email',
        width: 200,
        render: (email) => <span>{email}</span>,
      },
      {
        title: 'Phone',
        key: 'phone',
        dataIndex: 'phone',
        width: 150,
        render: (phone) => phone ? <span>{formatPhoneNumber(phone)}</span> : <span className="text-gray-400">—</span>,
      },
      {
        title: 'Status',
        key: 'status',
        align: 'center',
        width: 150,
        render: (_, tenant) => {
          const hasActiveLease = tenant.leaseTenants?.some(lt => lt.lease?.status === 'Active');
          return hasActiveLease ? (
            <Badge color="success">Active Lease</Badge>
          ) : (
            <Badge color="gray">No Active Lease</Badge>
          );
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 150,
        render: (_, tenant) => (
          <div className="flex items-center gap-2">
            <ActionButton
              action="edit"
              onClick={() => onEditTenant && onEditTenant(tenant)}
              tooltip="Edit Tenant"
            />
            <FlowbitePopconfirm
              title="Delete tenant?"
              description="This action cannot be undone."
              onConfirm={() => onDeleteTenant && onDeleteTenant(tenant.id)}
              okText="Yes"
              cancelText="No"
              danger={true}
            >
              <ActionButton
                action="delete"
                tooltip="Delete Tenant"
              />
            </FlowbitePopconfirm>
          </div>
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
      actions={
        {
          key: 'refresh',
          icon: <span className="text-base">↻</span>,
          tooltip: 'Refresh',
          onClick: onRefresh,
        },
        {
          key: 'add',
          icon: <HiPlus className="w-5 h-5" />,
          tooltip: 'Add Tenant',
          onClick: onAddTenant,
          type: 'primary'
        }
      }
    >
      {(!tenants || tenants.length === 0) && !loading ? (
        <EmptyState
          icon={<HiUser className="w-12 h-12 text-gray-400" />}
          description={
            <div>
              <p className="font-semibold text-gray-500">No tenants yet</p>
              <p className="text-gray-400">Click "Add Tenant" to add your first tenant</p>
            </div>
          }
        />
      ) : (
        <>
          <BulkActionsToolbar
            selectionCount={bulkOps.selectionCount}
            onBulkExport={() => bulkOps.handleBulkAction('export')}
            availableActions={['export'}
          />
          <TableWrapper>
            <FlowbiteTable
              {...tableProps}
              dataSource={search.filteredData || [}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 25,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} tenants`,
              }}
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
