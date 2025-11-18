/**
 * GridActionsColumn Helper
 * 
 * Creates a standardized Actions column definition for Ant Design tables
 * 
 * @param {function} renderActions - Function from useGridActions hook
 * @param {object} options - Column options
 * @param {string} options.title - Column title (default: 'Actions')
 * @param {number} options.width - Column width
 * @param {string} options.align - Column alignment (default: 'center')
 * @param {boolean} options.fixed - Fixed column position
 * 
 * @returns {object} Ant Design table column definition
 * 
 * Usage:
 *   const { renderActions } = useGridActions({ actions: [...] });
 *   const columns = [
 *     { title: 'Name', dataIndex: 'name' },
 *     ...otherColumns,
 *     createGridActionsColumn(renderActions, { width: 150 })
 *   ];
 */

export function createGridActionsColumn(renderActions, options = {}) {
  const {
    title = 'Actions',
    width = 120,
    align = 'center',
    fixed,
  } = options;

  return {
    title,
    key: 'actions',
    width,
    align,
    fixed,
    render: (_, record) => renderActions(record),
  };
}

