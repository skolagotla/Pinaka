/**
 * LeasesTab Component
 * 
 * Tab component for managing leases
 * Converted to Flowbite UI + v2 API
 */

import React, { useMemo } from 'react';
import { Button, Spinner } from 'flowbite-react';
import { HiDocumentText, HiPlus } from 'react-icons/hi';
import { useResizableTable, configureTableColumns, useSearch } from '@/lib/hooks';
import BulkActionsToolbar from '../BulkActionsToolbar';
import { PageLayout, TableWrapper, EmptyState } from '../';
import FlowbiteTable from '../FlowbiteTable';

/**
 * Memoized Leases Tab
 */
const LeasesTab = React.memo(({
  leases,
  loading,
  onAddLease,
  onEditLease,
  onDeleteLease,
  onRefresh,
  searchPlaceholder = "Search by property, unit, tenant name, email, or phone...",
  calculateStats,
  customSearchFunction,
  expandedRowRender,
  expandedRowKeys,
  setExpandedRowKeys,
  columns,
}) => {
  // Search functionality
  const search = useSearch(
    leases,
    ['unit.unitName', 'unit.property.propertyName', 'unit.property.addressLine1', 'status'],
    { debounceMs: 300 }
  );

  // Apply custom search if provided
  const filteredData = useMemo(() => {
    if (!search.searchTerm || !search.searchTerm.trim()) {
      return leases;
    }
    
    if (customSearchFunction) {
      return leases.filter(item => customSearchFunction(item, search.searchTerm));
    }
    
    return search.filteredData;
  }, [leases, search.searchTerm, search.filteredData, customSearchFunction]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!calculateStats) return [];
    return calculateStats(filteredData);
  }, [calculateStats, filteredData]);

  // Configure columns
  const configuredColumns = useMemo(() => {
    if (!columns) return [];
    return configureTableColumns(columns);
  }, [columns]);

  // Resizable table
  const { tableProps } = useResizableTable(configuredColumns, {
    storageKey: 'leases-table',
    defaultSort: { field: 'createdAt', order: 'descend' },
  });

  return (
    <PageLayout
      title="Leases"
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
          tooltip: 'Add Lease',
          onClick: onAddLease,
          type: 'primary'
        }
      }
    >
      {leases.length === 0 ? (
        <EmptyState
          icon={<HiDocumentText className="w-12 h-12 text-gray-400" />}
          description={
            <div>
              <p className="font-semibold text-gray-500">No leases yet</p>
              <p className="text-gray-400">Click "Add Lease" to create your first lease</p>
            </div>
          }
        />
      ) : (
        <TableWrapper>
          <FlowbiteTable
            {...tableProps}
            columns={configuredColumns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 25,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} leases`,
            }}
          />
        </TableWrapper>
      )}
    </PageLayout>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.leases === nextProps.leases &&
    prevProps.columns === nextProps.columns
  );
});

LeasesTab.displayName = 'LeasesTab';

export default LeasesTab;
