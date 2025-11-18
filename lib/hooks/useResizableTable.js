import { useState, useCallback, useMemo, useEffect } from 'react';
import { Table } from 'antd';
import { Resizable } from 'react-resizable';

/**
 * useResizableTable Hook
 * 
 * Simplifies the implementation of resizable tables by managing column state
 * and resize logic internally. Automatically persists column widths to localStorage.
 * 
 * @param {Array} initialColumns - Initial column definitions
 * @param {Object} options - Configuration options
 * @param {Object} options.defaultSort - Default sort configuration { field, order }
 * @param {boolean} options.bordered - Whether table should be bordered (default: true)
 * @param {string} options.storageKey - LocalStorage key for persisting column widths (optional)
 * @param {boolean} options.persistColumnWidths - Enable column width persistence (default: true)
 * @returns {Object} - Table props and utilities
 * 
 * @example
 * const columns = [
 *   { title: 'Name', dataIndex: 'name', width: 150 },
 *   { title: 'Email', dataIndex: 'email', width: 200 },
 * ];
 * 
 * const { tableProps } = useResizableTable(columns, {
 *   defaultSort: { field: 'createdAt', order: 'descend' },
 *   storageKey: 'tenants-table-columns', // Unique key for each table
 * });
 * 
 * return <Table {...tableProps} dataSource={data} />;
 */
export function useResizableTable(initialColumns, options = {}) {
  const { 
    defaultSort, 
    bordered = true,
    storageKey,
    persistColumnWidths = true 
  } = options;
  
  // Load saved column widths from localStorage
  const loadSavedWidths = useCallback(() => {
    if (!storageKey || !persistColumnWidths) return {};
    if (typeof window === 'undefined') return {}; // SSR check
    
    try {
      const saved = localStorage.getItem(`table-columns-${storageKey}`);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('[useResizableTable] Error loading saved widths:', error);
      return {};
    }
  }, [storageKey, persistColumnWidths]);

  // Create a stable key from column structure to detect real changes
  const columnKeys = useMemo(() => {
    return initialColumns
      .map(col => col.key || col.dataIndex || col.title)
      .join('|');
  }, [initialColumns]);

  // Apply saved widths to initial columns
  const columnsWithSavedWidths = useMemo(() => {
    const savedWidths = loadSavedWidths();
    
    if (Object.keys(savedWidths).length === 0) {
      return initialColumns;
    }

    return initialColumns.map((col) => {
      const key = col.key || col.dataIndex;
      if (key && savedWidths[key]) {
        return { ...col, width: savedWidths[key] };
      }
      return col;
    });
    // Only update when column structure actually changes, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnKeys, loadSavedWidths]);

  // Manage column widths
  const [columns, setColumns] = useState(columnsWithSavedWidths);

  // Update columns when column structure actually changes
  useEffect(() => {
    const savedWidths = loadSavedWidths();
    
    const updatedColumns = initialColumns.map((col) => {
      const key = col.key || col.dataIndex;
      if (key && savedWidths[key]) {
        return { ...col, width: savedWidths[key] };
      }
      return col;
    });
    
    setColumns(updatedColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnKeys]); // Only update when column structure changes

  // Save column widths to localStorage
  const saveColumnWidths = useCallback((cols) => {
    if (!storageKey || !persistColumnWidths) return;
    if (typeof window === 'undefined') return; // SSR check
    
    try {
      const widths = {};
      cols.forEach((col) => {
        const key = col.key || col.dataIndex;
        if (key && col.width) {
          widths[key] = col.width;
        }
      });
      localStorage.setItem(`table-columns-${storageKey}`, JSON.stringify(widths));
    } catch (error) {
      console.error('[useResizableTable] Error saving column widths:', error);
    }
  }, [storageKey, persistColumnWidths]);

  // Handle column resize
  const handleResize = useCallback((index) => (e, { size }) => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      newColumns[index] = {
        ...newColumns[index],
        width: size.width,
      };
      
      // Save to localStorage
      saveColumnWidths(newColumns);
      
      return newColumns;
    });
  }, [saveColumnWidths]);

  // Resizable title component
  const ResizableTitle = useCallback((props) => {
    const { onResize, width, ...restProps } = props;

    if (!width) {
      return <th {...restProps} />;
    }

    return (
      <Resizable
        width={width}
        height={0}
        handle={
          <span
            className="react-resizable-handle"
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        }
        onResize={onResize}
        draggableOpts={{ enableUserSelectHack: false }}
      >
        <th {...restProps} />
      </Resizable>
    );
  }, []);

  // Merge columns with resize handlers
  const mergedColumns = useMemo(() => {
    return columns.map((col, index) => ({
      ...col,
      onHeaderCell: (column) => ({
        width: column.width,
        onResize: handleResize(index),
      }),
    }));
  }, [columns, handleResize]);

  // Apply default sort if provided
  const columnsWithSort = useMemo(() => {
    if (!defaultSort) return mergedColumns;

    return mergedColumns.map((col) => {
      const isDefaultSortColumn = 
        col.dataIndex === defaultSort.field || 
        col.key === defaultSort.field;

      if (isDefaultSortColumn && !col.defaultSortOrder) {
        return {
          ...col,
          defaultSortOrder: defaultSort.order,
        };
      }

      return col;
    });
  }, [mergedColumns, defaultSort]);

  // Table components configuration
  const components = useMemo(() => ({
    header: {
      cell: ResizableTitle,
    },
  }), [ResizableTitle]);

  // Reset column widths to defaults
  const resetColumnWidths = useCallback(() => {
    setColumns(initialColumns);
    if (storageKey && persistColumnWidths && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`table-columns-${storageKey}`);
      } catch (error) {
        console.error('[useResizableTable] Error clearing saved widths:', error);
      }
    }
  }, [initialColumns, storageKey, persistColumnWidths]);

  // Return table props
  return {
    tableProps: {
      columns: columnsWithSort,
      components,
      bordered,
    },
    // Utility functions
    resetColumnWidths,
    columns: columnsWithSort,
  };
}

/**
 * Helper function to create sortable columns
 * 
 * @param {Object} column - Column configuration
 * @param {Function} sortFn - Sort function (a, b) => number
 * @returns {Object} - Column with sorter
 */
export function withSorter(column, sortFn) {
  return {
    ...column,
    sorter: sortFn,
  };
}

/**
 * Common sort functions
 */
export const sortFunctions = {
  // String sorting (alphabetical, case-insensitive)
  string: (field) => (a, b) => {
    const aVal = a[field] || '';
    const bVal = b[field] || '';
    return aVal.toString().localeCompare(bVal.toString());
  },

  // Number sorting
  number: (field) => (a, b) => {
    return (a[field] || 0) - (b[field] || 0);
  },

  // Date sorting
  date: (field) => (a, b) => {
    if (!a[field]) return 1;
    if (!b[field]) return -1;
    return new Date(a[field]) - new Date(b[field]);
  },

  // Date sorting (always puts null/undefined last)
  dateNullLast: (field) => (a, b) => {
    if (!a[field]) return 1;
    if (!b[field]) return -1;
    return new Date(a[field]) - new Date(b[field]);
  },

  // Custom field accessor (for nested fields)
  custom: (accessor, compareFn) => (a, b) => {
    const aVal = accessor(a);
    const bVal = accessor(b);
    return compareFn(aVal, bVal);
  },
};

/**
 * Example usage:
 * 
 * const columns = [
 *   withSorter(
 *     customizeColumn(STANDARD_COLUMNS.TENANT_NAME, { ... }),
 *     sortFunctions.string('firstName')
 *   ),
 *   withSorter(
 *     customizeColumn(STANDARD_COLUMNS.CREATED_DATE, { ... }),
 *     sortFunctions.date('createdAt')
 *   ),
 * ];
 * 
 * const { tableProps } = useResizableTable(columns, {
 *   defaultSort: { field: 'createdAt', order: 'descend' }
 * });
 * 
 * return (
 *   <Table
 *     {...tableProps}
 *     dataSource={data}
 *     rowKey="id"
 *     pagination={{ pageSize: 10 }}
 *   />
 * );
 */

