"use client";

import { Space, Button, Typography, Popconfirm } from 'antd';
import { DeleteOutlined, ExportOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function BulkActionsToolbar({
  selectionCount,
  onBulkDelete,
  onBulkExport,
  onBulkUpdateStatus,
  availableActions = ['export'], // Default to only export
  customActions = [],
}) {
  if (selectionCount === 0) {
    return null;
  }

  return (
    <div
      style={{
        padding: '12px 16px',
        background: '#e6f7ff',
        border: '1px solid #91d5ff',
        borderRadius: '4px',
        marginBottom: '16px',
      }}
    >
      <Space>
        <Text strong>{selectionCount} item(s) selected</Text>
        <span style={{ color: '#999' }}>|</span>
        
        {/* Only show export - delete and status updates removed */}
        {availableActions.includes('export') && onBulkExport && (
          <Button icon={<ExportOutlined />} size="small" onClick={onBulkExport}>
            Export
          </Button>
        )}

        {customActions.map((action, index) => (
          <Button
            key={index}
            icon={action.icon}
            size="small"
            type={action.type}
            onClick={() => action.onClick(selectionCount)}
          >
            {action.label}
          </Button>
        ))}
      </Space>
    </div>
  );
}

