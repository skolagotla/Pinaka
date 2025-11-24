/**
 * useActionButtons Hook
 * 
 * Provides standardized action buttons for table rows (Edit, Delete)
 * Ensures consistent look and feel across all tables
 * 
 * @param {function} onEdit - Edit handler
 * @param {function} onDelete - Delete handler
 * @param {object} options - Configuration options
 * @returns {function} renderActions - Function to render action buttons
 * 
 * Usage:
 *   const { renderActions } = useActionButtons({
 *     onEdit: (record) => handleEdit(record),
 *     onDelete: (record) => handleDelete(record.id),
 *   });
 * 
 *   // In table columns:
 *   {
 *     title: 'Actions',
 *     key: 'actions',
 *     width: 100,
 *     render: (_, record) => renderActions(record)
 *   }
 */

import React from 'react';
import { Space } from 'antd';
import { ActionButton } from '@/components/shared/buttons';
import { Popconfirm } from 'antd';

export function useActionButtons({ onEdit, onDelete, options = {} }) {
  const {
    editTooltip = 'Edit',
    deleteTooltip = 'Delete',
    deleteConfirmTitle = 'Are you sure you want to delete this item?',
    deleteConfirmDescription = 'This action cannot be undone.',
    showEdit = true,
    showDelete = true,
    size = 'middle',
  } = options;

  const renderActions = (record) => {
    const buttons = [];

    if (showEdit && onEdit) {
      buttons.push(
        <ActionButton
          key="edit"
          action="edit"
          onClick={() => onEdit(record)}
          tooltip={editTooltip}
          size={size}
        />
      );
    }

    if (showDelete && onDelete) {
      buttons.push(
        <Popconfirm
          key="delete"
          title={deleteConfirmTitle}
          description={deleteConfirmDescription}
          onConfirm={() => onDelete(record)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <ActionButton
            action="delete"
            tooltip={deleteTooltip}
            size={size}
          />
        </Popconfirm>
      );
    }

    return buttons.length > 0 ? <Space size="small">{buttons}</Space> : null;
  };

  return { renderActions };
}

