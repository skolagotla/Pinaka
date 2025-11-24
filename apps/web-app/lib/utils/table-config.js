/**
 * Table Configuration Utility
 * 
 * Standardizes table column configuration across the entire application:
 * - All columns with data are sortable
 * - All columns are resizable
 * - All headers and data are center-aligned
 * - Consistent styling and behavior
 * 
 * Usage:
 * import { configureTableColumns } from '@/lib/utils/table-config';
 * 
 * const columns = configureTableColumns([
 *   { title: 'Name', dataIndex: 'name' },
 *   { title: 'Email', dataIndex: 'email' },
 *   { title: 'Actions', key: 'actions', render: () => <Button>Edit</Button> }
 * ]);
 * 
 * const { tableProps } = useResizableTable(columns, { storageKey: 'my-table' });
 * <Table {...tableProps} dataSource={data} />
 */

import { sortFunctions } from '../hooks/useResizableTable';

/**
 * Automatically add sorting to columns that have data
 * @param {Object} column - Column definition
 * @returns {Object} Column with sorting added if applicable
 */
function addSortingToColumn(column) {
  // Don't add sorting to action columns or columns that explicitly disable it
  if (column.key === 'actions' || column.key === 'action' || column.sorter === false) {
    return column;
  }

  // If column already has a sorter (including custom sorters), keep it
  if (column.sorter && typeof column.sorter === 'function') {
    return column;
  }

  // Add sorting based on dataIndex or key
  const sortField = column.dataIndex || column.key;
  
  if (!sortField) {
    return column;
  }

  // Determine sort function based on field name or data type
  const sortFunction = getSortFunction(sortField, column);
  
  return {
    ...column,
    sorter: sortFunction,
  };
}

/**
 * Get appropriate sort function for a field
 * @param {string} field - Field name
 * @param {Object} column - Column definition
 * @returns {Function} Sort function
 */
function getSortFunction(field, column) {
  // Date fields
  if (field.includes('Date') || field.includes('date') || 
      field.includes('At') || field.includes('Time') ||
      field === 'dueDate' || field === 'paidDate' || 
      field === 'createdAt' || field === 'updatedAt' ||
      field === 'leaseStart' || field === 'leaseEnd') {
    return sortFunctions.date(field);
  }

  // Amount/price fields
  if (field.includes('Amount') || field.includes('amount') ||
      field.includes('Price') || field.includes('price') ||
      field.includes('Rent') || field.includes('rent') ||
      field.includes('Balance') || field.includes('balance') ||
      field === 'amount' || field === 'rentAmount') {
    return sortFunctions.number(field);
  }

  // Number fields
  if (field.includes('Count') || field.includes('count') ||
      field.includes('Number') || field.includes('number') ||
      field.includes('Id') || field.includes('id')) {
    return sortFunctions.number(field);
  }

  // Default to string sorting
  return sortFunctions.string(field);
}

/**
 * Center-align column headers and data
 * @param {Object} column - Column definition
 * @returns {Object} Column with center alignment
 */
function centerAlignColumn(column) {
  // Don't center action columns (they're usually right-aligned)
  if (column.key === 'actions' || column.key === 'action') {
    return {
      ...column,
      align: column.align || 'right', // Keep existing alignment or default to right
    };
  }

  // For numeric/amount columns, keep right alignment if specified, otherwise center
  if (column.align === 'right') {
    return column; // Keep right alignment for amounts
  }

  return {
    ...column,
    align: 'center',
  };
}

/**
 * Ensure column has width for resizing
 * @param {Object} column - Column definition
 * @param {number} index - Column index
 * @returns {Object} Column with width
 */
function ensureColumnWidth(column, index) {
  // If column already has width, keep it
  if (column.width) {
    return column;
  }

  // Set default widths based on column type
  const defaultWidths = {
    actions: 120,
    action: 120,
    status: 120,
    date: 150,
    amount: 130,
    email: 200,
    phone: 140,
    name: 180,
    default: 150,
  };

  // Determine width based on field type
  let width = defaultWidths.default;
  
  if (column.key === 'actions' || column.key === 'action') {
    width = defaultWidths.actions;
  } else if (column.dataIndex?.includes('Date') || column.dataIndex?.includes('date') || 
             column.dataIndex?.includes('At') || column.dataIndex?.includes('Time')) {
    width = defaultWidths.date;
  } else if (column.dataIndex?.includes('Amount') || column.dataIndex?.includes('amount') ||
             column.dataIndex?.includes('Price') || column.dataIndex?.includes('price') ||
             column.dataIndex?.includes('Rent') || column.dataIndex?.includes('rent') ||
             column.dataIndex?.includes('Balance') || column.dataIndex?.includes('balance')) {
    width = defaultWidths.amount;
  } else if (column.dataIndex?.includes('Email') || column.dataIndex === 'email') {
    width = defaultWidths.email;
  } else if (column.dataIndex?.includes('Phone') || column.dataIndex === 'phone') {
    width = defaultWidths.phone;
  } else if (column.dataIndex?.includes('Name') || column.dataIndex?.includes('name')) {
    width = defaultWidths.name;
  }

  return {
    ...column,
    width,
  };
}

/**
 * Configure table columns with standard settings
 * - Adds sorting to all data columns
 * - Centers all headers and data (except actions)
 * - Ensures resizable columns with default widths
 * 
 * @param {Array} columns - Array of column definitions
 * @param {Object} options - Configuration options
 * @param {boolean} options.addSorting - Add sorting to columns (default: true)
 * @param {boolean} options.centerAlign - Center align columns (default: true)
 * @param {boolean} options.addWidths - Add default widths (default: true)
 * @returns {Array} Configured columns ready for useResizableTable
 * 
 * @example
 * const columns = configureTableColumns([
 *   { title: 'Name', dataIndex: 'name' },
 *   { title: 'Email', dataIndex: 'email' },
 *   { title: 'Amount', dataIndex: 'amount', align: 'right' }, // Keep right alignment
 *   { title: 'Actions', key: 'actions', render: () => <Button>Edit</Button> }
 * ]);
 */
export function configureTableColumns(columns, options = {}) {
  const {
    addSorting = true,
    centerAlign = true,
    addWidths = true,
  } = options;

  return columns.map((column, index) => {
    let configuredColumn = { ...column };

    // Add sorting
    if (addSorting) {
      configuredColumn = addSortingToColumn(configuredColumn);
    }

    // Center align
    if (centerAlign) {
      configuredColumn = centerAlignColumn(configuredColumn);
    }

    // Add default widths
    if (addWidths) {
      configuredColumn = ensureColumnWidth(configuredColumn, index);
    }

    return configuredColumn;
  });
}

/**
 * Create a standard table configuration
 * Combines configureTableColumns with useResizableTable setup
 * 
 * @param {Array} columns - Column definitions
 * @param {Object} options - Configuration options
 * @returns {Object} { columns, tableConfig }
 */
export function createStandardTableConfig(columns, options = {}) {
  const {
    storageKey,
    defaultSort,
    ...tableOptions
  } = options;

  const configuredColumns = configureTableColumns(columns, tableOptions);

  return {
    columns: configuredColumns,
    tableConfig: {
      storageKey,
      defaultSort,
      bordered: true,
    },
  };
}

