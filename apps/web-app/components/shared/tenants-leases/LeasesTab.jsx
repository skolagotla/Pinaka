/**
 * LeasesTab Component
 * 
 * Tab component for managing leases
 * Extracted from tenants-leases/ui.jsx for better code organization
 */

import React, { useMemo } from 'react';
import { Table, Card, Empty, Space, Button, Tooltip, Typography } from 'antd';
import { FileTextOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;
import { useResizableTable, configureTableColumns, useSearch } from '@/lib/hooks';
import BulkActionsToolbar from '../BulkActionsToolbar';
import { PageLayout, TableWrapper, EmptyState } from '../';

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
          tooltip: 'Add Lease',
          onClick: onAddLease,
          type: 'primary'
        }
      ]}
    >
      {leases.length === 0 ? (
        <EmptyState
          icon={<FileTextOutlined />}
          description={
            <div>
              <Text strong type="secondary">No leases yet</Text>
              <br />
              <Text type="secondary">Click "Add Lease" to create your first lease</Text>
            </div>
          }
        />
      ) : (
        <TableWrapper>
          <Table
            {...tableProps}
            columns={configuredColumns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            sticky={{ offsetHeader: 0 }}
            scroll={{ y: 'calc(100vh - 320px)', x: 'max-content' }}
            expandable={expandedRowRender ? {
              expandedRowRender,
              expandedRowKeys,
              onExpandedRowsChange: setExpandedRowKeys,
            } : undefined}
            pagination={{
              pageSize: 25,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} leases`,
            }}
            size="middle"
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

