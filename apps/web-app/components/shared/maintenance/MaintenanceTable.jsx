/**
 * MaintenanceTable Component
 * 
 * Memoized table component for maintenance requests
 * Extracted from MaintenanceClient for better code organization
 */

import React, { useMemo } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { useResizableTable, configureTableColumns } from '@/lib/hooks';

/**
 * Memoized Maintenance Table
 * Prevents unnecessary re-renders when data hasn't changed
 */
const MaintenanceTable = React.memo(({
  columns,
  dataSource,
  loading,
  onRowClick,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  rowSelection,
  userRole,
}) => {
  // Configure columns with standard settings
  const configuredColumns = useMemo(() => {
    return configureTableColumns(columns, {
      addSorting: false, // Keep existing sorters
      centerAlign: true,
      addWidths: false, // Keep existing widths
    });
  }, [columns]);

  // Use resizable table hook
  const { tableProps } = useResizableTable(configuredColumns, {
    defaultSort: { field: 'createdAt', order: 'descend' },
    storageKey: `${userRole}-maintenance-table`,
  });

  // Memoize dataSource to prevent unnecessary re-renders
  const memoizedDataSource = useMemo(() => {
    return dataSource || [];
  }, [dataSource]);

  return (
    <ProTable
      columns={tableProps.columns}
      components={tableProps.components}
      bordered={tableProps.bordered}
      dataSource={memoizedDataSource}
      rowKey="id"
      search={false}
      toolBarRender={false}
      loading={loading}
      rowSelection={rowSelection}
      pagination={{
        pageSize: 25,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} requests`,
      }}
      size="small"
      onRow={(record) => ({
        onClick: () => onRowClick && onRowClick(record),
        style: { cursor: onRowClick ? 'pointer' : 'default' },
      })}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.columns === nextProps.columns &&
    prevProps.dataSource === nextProps.dataSource &&
    prevProps.userRole === nextProps.userRole &&
    JSON.stringify(prevProps.rowSelection) === JSON.stringify(nextProps.rowSelection)
  );
});

MaintenanceTable.displayName = 'MaintenanceTable';

export default MaintenanceTable;

