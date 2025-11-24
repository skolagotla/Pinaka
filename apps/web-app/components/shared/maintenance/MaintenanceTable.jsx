/**
 * MaintenanceTable Component
 * 
 * Memoized table component for maintenance requests
 * Extracted from MaintenanceClient for better code organization
 */

import React, { useMemo } from 'react';
import { Table, Spinner } from 'flowbite-react';
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

  // Convert columns to Flowbite Table format
  const flowbiteColumns = useMemo(() => {
    return tableProps.columns.map(col => ({
      ...col,
      // Flowbite Table uses different prop names
      header: col.title,
      accessorKey: col.dataIndex || col.key,
    }));
  }, [tableProps.columns]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table hoverable={!!onRowClick}>
        <Table.Head>
          {flowbiteColumns.map((col, idx) => (
            <Table.HeadCell key={col.key || col.dataIndex || idx}>
              {col.header || col.title}
            </Table.HeadCell>
          ))}
        </Table.Head>
        <Table.Body className="divide-y">
          {memoizedDataSource.map((record) => (
            <Table.Row
              key={record.id}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
              onClick={() => onRowClick && onRowClick(record)}
            >
              {flowbiteColumns.map((col, idx) => {
                const value = col.dataIndex ? record[col.dataIndex] : record[col.key];
                const rendered = col.render ? col.render(value, record, idx) : value;
                return (
                  <Table.Cell key={col.key || col.dataIndex || idx}>
                    {rendered}
                  </Table.Cell>
                );
              })}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {memoizedDataSource.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No maintenance requests found
        </div>
      )}
      {/* Pagination would need to be implemented separately with Flowbite Pagination component */}
      {memoizedDataSource.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          Total {memoizedDataSource.length} requests
        </div>
      )}
    </div>
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

