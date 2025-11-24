"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Spinner, Button } from 'flowbite-react';
import { HiChevronRight, HiChevronDown } from 'react-icons/hi';

/**
 * ExpandableFlowbiteTable Component
 * 
 * A Flowbite-compatible table with expandable rows functionality
 * Similar to Ant Design's expandable rows
 * 
 * @param {Array} dataSource - Array of data objects
 * @param {Array} columns - Column definitions
 * @param {string} rowKey - Key field for rows (default: 'id')
 * @param {boolean} loading - Loading state
 * @param {Object} pagination - Pagination config
 * @param {Function} expandedRowRender - Function to render expanded content
 * @param {Array} expandedRowKeys - Array of expanded row keys
 * @param {Function} onExpandedRowsChange - Callback when expanded rows change
 * @param {Function} onRow - Row click handler
 */
export default function ExpandableFlowbiteTable({
  dataSource = [],
  columns = [],
  rowKey = 'id',
  loading = false,
  pagination = { pageSize: 25, showSizeChanger: true },
  expandedRowRender,
  expandedRowKeys = [],
  onExpandedRowsChange,
  onRow,
  ...tableProps
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 25);
  const [expandedRows, setExpandedRows] = useState(expandedRowKeys || []);

  // Sync expandedRows with prop
  useEffect(() => {
    if (expandedRowKeys && Array.isArray(expandedRowKeys)) {
      setExpandedRows(expandedRowKeys);
    }
  }, [expandedRowKeys]);

  // Convert Ant Design columns to Flowbite format
  const flowbiteColumns = useMemo(() => {
    return columns.map((col) => {
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
      
      return {
        header: col.title || col.header || '',
        accessorKey: col.dataIndex || col.key || '',
      };
    });
  }, [columns]);

  // Add expand/collapse column if expandedRowRender is provided
  const allColumns = useMemo(() => {
    if (!expandedRowRender) return flowbiteColumns;
    
    return [
      {
        header: '',
        accessorKey: '_expand',
        cell: ({ row }) => {
          const record = row.original;
          const key = typeof rowKey === 'function' ? rowKey(record) : record[rowKey] || row.index;
          const isExpanded = expandedRows.includes(key);
          
          // Check if record has multiple units (for properties)
          const hasMultipleUnits = record.units && record.units.length > 1;
          if (!hasMultipleUnits && !expandedRowRender) {
            return <span className="w-4 inline-block" />;
          }
          
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newExpanded = isExpanded
                  ? expandedRows.filter(k => k !== key)
                  : [...expandedRows, key];
                setExpandedRows(newExpanded);
                if (onExpandedRowsChange) {
                  onExpandedRowsChange(newExpanded);
                }
              }}
              className="p-1 hover:bg-gray-100 rounded transition-transform inline-flex items-center justify-center"
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                width: '16px',
                height: '16px'
              }}
            >
              <HiChevronRight className="h-4 w-4 text-blue-600" />
            </button>
          );
        },
      },
      ...flowbiteColumns,
    ];
  }, [flowbiteColumns, expandedRowRender, expandedRows, rowKey, onExpandedRowsChange]);

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
    <div className="overflow-x-auto">
      <Table hoverable>
        <TableHead>
          {allColumns.map((col, idx) => (
            <TableHeadCell key={idx}col.header}</TableHeadCell>
          ))}
        </TableHead>
        <TableBody className="divide-y">
          {paginatedData.map((record, rowIdx) => {
            const key = typeof rowKey === 'function' ? rowKey(record) : record[rowKey] || rowIdx;
            const rowProps = onRow ? onRow(record, rowIdx) : {};
            const isExpanded = expandedRows.includes(key);
            
            return (
              <React.Fragment key={key}>
                <TableRow 
                  className={rowProps.style?.cursor === 'pointer' ? 'cursor-pointer' : ''}
                  onClick={rowProps.onDoubleClick}
                >
                  {allColumns.map((col, colIdx) => (
                    <TableCell key={colIdx}>
                      {col.cell ? col.cell({ row: { original: record, index: rowIdx } }) : record[col.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
                {isExpanded && expandedRowRender && (
                  <TableRow>
                    <TableCell colSpan={allColumns.length} className="bg-gray-50 p-4">
                      {expandedRowRender(record)}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
      
      {/* Pagination */}
      {pagination && dataSource.length > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            {pagination.showTotal && pagination.showTotal(dataSource.length)}
            {!pagination.showTotal && `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, dataSource.length)} of ${dataSource.length} entries`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
            {pagination.showSizeChanger && (
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-sm border rounded"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

