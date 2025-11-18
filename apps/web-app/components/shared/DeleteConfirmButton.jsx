"use client";

import React from 'react';
import { Popconfirm } from 'antd';
import { ActionButton } from './buttons';

/**
 * DeleteConfirmButton Component
 * 
 * Standardized delete button with confirmation dialog.
 * Provides consistent UX for delete actions across the application.
 * 
 * @param {Object} props
 * @param {function} props.onConfirm - Delete handler function
 * @param {string} props.entityName - Name of entity being deleted (for message)
 * @param {string} props.description - Custom description text
 * @param {boolean} props.danger - Show danger styling (default: true)
 * @param {string} props.size - Button size: 'small' | 'middle' | 'large'
 * @param {string} props.type - Button type: 'text' | 'link' | 'default'
 * @param {Object} props.buttonProps - Additional button props to pass to ActionButton
 * @param {Object} props.popconfirmProps - Additional Popconfirm props
 * 
 * @example
 * <DeleteConfirmButton
 *   entityName="tenant"
 *   onConfirm={() => handleDelete(tenant.id)}
 * />
 * 
 * @example
 * <DeleteConfirmButton
 *   entityName="property"
 *   description="This will also delete all associated units and leases."
 *   onConfirm={handleDelete}
 *   size="large"
 * />
 */
export function DeleteConfirmButton({
  onConfirm,
  entityName = 'item',
  description,
  danger = true,
  size = 'small',
  type = 'text',
  buttonProps = {},
  ...popconfirmProps
}) {
  const defaultDescription = description || 
    `This will permanently delete this ${entityName}. This action cannot be undone.`;

  return (
    <Popconfirm
      title={`Delete ${entityName}?`}
      description={defaultDescription}
      onConfirm={onConfirm}
      okText="Yes"
      cancelText="No"
      okButtonProps={{ danger: true }}
      {...popconfirmProps}
    >
      <ActionButton
        action="delete"
        danger={danger}
        size={size}
        type={type}
        {...buttonProps}
      />
    </Popconfirm>
  );
}

export default DeleteConfirmButton;
