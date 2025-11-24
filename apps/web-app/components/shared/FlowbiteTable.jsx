"use client";

import React, { useState, useMemo } from 'react';
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Spinner, Button, Select, Label } from 'flowbite-react';

/**
 * FlowbiteTable Component
 * 
 * A Flowbite-compatible table wrapper that provides similar functionality to ProTable
 * Supports pagination, sorting, and basic table features
 * 
 * @param {Array} dataSource - Array of data objects
 * @param {Array} columns - Column definitions (converted from Ant Design format)
 * @param {string} rowKey - Key field for rows (default: 'id')
 * @param {boolean} loading - Loading state
 * @param {Object} pagination - Pagination config { pageSize, showSizeChanger, showTotal }
 * @param {Function} onRow - Row click handler
 * @param {Object} tableProps - Additional props from useResizableTable
 */
export default function FlowbiteTable({
  dataSource = [],
  columns = [],
  rowKey = 'id',
  loading = false,
  pagination = { pageSize: 25, showSizeChanger: true },
  onRow,
  ...tableProps
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 25);

  // Convert Ant Design columns to Flowbite format
  const flowbiteColumns = useMemo(() => {
    return columns.map((col) => {
      // Handle column with render function
      if (col.render) {
        return {
          header: col.title || col.header || '',
          accessorKey: col.dataIndex || col.key || '',
          cell: ({ row }) => {
            const record = row.original;
            const value = col.dataIndex ? record[col.dataIndex] : record;
            return col.render(value, record, row.index);
          },
        };
      }
      
      // Simple column
      return {
        header: col.title || col.header || '',
        accessorKey: col.dataIndex || col.key || '',
      };
    });
  }, [columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination || pagination === false) {
      return dataSource;
    }
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return dataSource.slice(start, end);
  }, [dataSource, currentPage, pageSize, pagination]);

  // Total pages
  const totalPages = pagination ? Math.ceil(dataSource.length / pageSize) : 1;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
      <Table hoverable className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <TableHead className="bg-gray-50 dark:bg-gray-800">
          <TableRow>
            {flowbiteColumns.map((col, idx) => (
              <TableHeadCell 
                key={idx}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
              >
                {col.header}
              </TableHeadCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {paginatedData.map((record, rowIdx) => {
            const key = typeof rowKey === 'function' ? rowKey(record) : record[rowKey] || rowIdx;
            const rowProps = onRow ? onRow(record, rowIdx) : {};
            
            return (
              <TableRow 
                key={key} 
                className={`${rowProps.style?.cursor === 'pointer' ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors`}
                onClick={rowProps.onDoubleClick}
              >
                {flowbiteColumns.map((col, colIdx) => (
                  <TableCell 
                    key={colIdx}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                  >
                    {col.cell ? col.cell({ row: { original: record, index: rowIdx } }) : record[col.accessorKey}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {/* Pagination with Flowbite Pro styling */}
      {pagination && dataSource.length > pageSize && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {pagination.showTotal && pagination.showTotal(dataSource.length)}
            {!pagination.showTotal && (
              <span>
                Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(currentPage * pageSize, dataSource.length)}</span> of{' '}
                <span className="font-semibold">{dataSource.length}</span> entries
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {pagination.showSizeChanger && (
              <div className="flex items-center gap-2">
                <Label htmlFor="pageSize" className="text-sm text-gray-700 dark:text-gray-300">
                  Show:
                </Label>
                <Select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-24"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="min-w-[80px]"
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="min-w-[80px]"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

