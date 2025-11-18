"use client";

/**
 * TableActionsColumn Component
 * 
 * Pre-configured action column for tables with standard edit/delete/view actions.
 * 
 * Features:
 * - Standard action buttons (View, Edit, Delete)
 * - Conditional rendering based on permissions
 * - Custom actions support
 * - Confirmation dialogs for destructive actions
 * 
 * @param {Object} props
 * @param {function} props.onView - View handler: (record) => void
 * @param {function} props.onEdit - Edit handler: (record) => void
 * @param {function} props.onDelete - Delete handler: (record) => void
 * @param {Array} props.customActions - Custom actions: [{type: string, onClick: function, condition?: function}]
 * @param {function} props.canEdit - Permission check for edit: (record) => boolean
 * @param {function} props.canDelete - Permission check for delete: (record) => boolean
 * @param {string} props.title - Column title (default: 'Actions')
 * @param {number} props.width - Column width (default: 120)
 * @param {string} props.align - Column alignment (default: 'center')
 * @param {boolean} props.fixed - Fixed column position
 * @param {string} props.size - Button size: 'small' | 'middle' | 'large' (default: 'small')
 * 
 * @returns {Object} Ant Design table column definition
 * 
 * @example
 * const actionsColumn = TableActionsColumn({
 *   onView: (record) => handleView(record),
 *   onEdit: (record) => handleEdit(record),
 *   onDelete: (record) => handleDelete(record.id),
 *   canEdit: (record) => record.status !== 'archived',
 *   customActions: [
 *     { type: 'approve', onClick: (record) => handleApprove(record), condition: (record) => record.status === 'pending' }
 *   ]
 * });
 * 
 * const columns = [
 *   { title: 'Name', dataIndex: 'name' },
 *   ...otherColumns,
 *   actionsColumn
 * ];
 */

import React from 'react';
import { Space, Popconfirm } from 'antd';
import { ActionButton } from './buttons';
import { useGridActions } from '@/lib/hooks/useGridActions';

export default function TableActionsColumn({
  onView,
  onEdit,
  onDelete,
  customActions = [],
  canEdit = () => true,
  canDelete = () => true,
  title = 'Actions',
  width = 120,
  align = 'center',
  fixed,
  size = 'small',
}) {
  const actions = [];

  // Add standard actions
  if (onView) {
    actions.push({
      type: 'view',
      onClick: onView,
    });
  }

  if (onEdit) {
    actions.push({
      type: 'edit',
      onClick: onEdit,
      condition: canEdit,
    });
  }

  if (onDelete) {
    actions.push({
      type: 'delete',
      onClick: onDelete,
      condition: canDelete,
      confirm: {
        title: 'Are you sure you want to delete this item?',
        description: 'This action cannot be undone.',
      },
    });
  }

  // Add custom actions
  actions.push(...customActions);

  const { renderActions } = useGridActions({
    actions,
    size,
    buttonType: 'link',
  });

  return {
    title,
    key: 'actions',
    width,
    align,
    fixed,
    render: (_, record) => renderActions(record),
  };
}

