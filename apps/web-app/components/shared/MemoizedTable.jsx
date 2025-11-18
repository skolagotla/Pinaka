/**
 * MemoizedTable Component
 * 
 * High-performance table wrapper with automatic memoization
 * Prevents unnecessary re-renders when data hasn't changed
 * 
 * Features:
 * - Automatic memoization of columns and dataSource
 * - Optimized for large datasets
 * - Compatible with Ant Design Table
 * - Supports all Table props
 * 
 * @example
 * <MemoizedTable
 *   columns={columns}
 *   dataSource={data}
 *   rowKey="id"
 *   loading={loading}
 *   {...otherTableProps}
 * />
 */

import React, { useMemo } from 'react';
import { Table } from 'antd';

/**
 * Memoized Table Component
 * Automatically memoizes columns and dataSource to prevent unnecessary re-renders
 */
const MemoizedTable = React.memo(({ 
  columns, 
  dataSource, 
  rowKey = 'id',
  loading = false,
  ...otherProps 
}) => {
  // Memoize columns to prevent re-creation on every render
  const memoizedColumns = useMemo(() => {
    return columns || [];
  }, [columns]);
  
  // Memoize dataSource to prevent re-creation on every render
  const memoizedDataSource = useMemo(() => {
    return dataSource || [];
  }, [dataSource]);
  
  return (
    <Table
      columns={memoizedColumns}
      dataSource={memoizedDataSource}
      rowKey={rowKey}
      loading={loading}
      {...otherProps}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  // Only re-render if these props actually change
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.rowKey === nextProps.rowKey &&
    prevProps.columns === nextProps.columns &&
    prevProps.dataSource === nextProps.dataSource &&
    JSON.stringify(prevProps.otherProps) === JSON.stringify(nextProps.otherProps)
  );
});

MemoizedTable.displayName = 'MemoizedTable';

export default MemoizedTable;

