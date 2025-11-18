import React from 'react';
import { Table } from 'antd';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

/**
 * ResizableTitle Component
 * Enables column resizing in Ant Design tables
 * Memoized for performance to prevent unnecessary re-renders
 */
const ResizableTitle = React.memo((props) => {
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
});

ResizableTitle.displayName = 'ResizableTitle';

/**
 * ResizableTable Component
 * Ant Design Table with resizable columns
 * 
 * Usage:
 * <ResizableTable
 *   columns={columns}
 *   dataSource={data}
 *   defaultSort={{ field: 'createdAt', order: 'descend' }}
 *   ...other Table props
 * />
 */
export default function ResizableTable({ 
  columns: initialColumns, 
  defaultSort,
  ...tableProps 
}) {
  const [columns, setColumns] = React.useState(initialColumns);

  React.useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const handleResize = (index) => (e, { size }) => {
    const newColumns = [...columns];
    newColumns[index] = {
      ...newColumns[index],
      width: size.width,
    };
    setColumns(newColumns);
  };

  const mergedColumns = columns.map((col, index) => ({
    ...col,
    onHeaderCell: (column) => ({
      width: column.width,
      onResize: handleResize(index),
    }),
  }));

  // Apply default sort if provided
  const defaultSortColumn = defaultSort 
    ? mergedColumns.find(col => col.dataIndex === defaultSort.field || col.key === defaultSort.field)
    : mergedColumns.find(col => col.defaultSortOrder);

  if (defaultSortColumn && !tableProps.defaultSortOrder) {
    defaultSortColumn.defaultSortOrder = defaultSort?.order || defaultSortColumn.defaultSortOrder;
  }

  return (
    <Table
      {...tableProps}
      columns={mergedColumns}
      components={{
        header: {
          cell: ResizableTitle,
        },
      }}
      bordered
    />
  );
}

