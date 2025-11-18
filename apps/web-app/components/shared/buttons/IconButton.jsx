"use client";

/**
 * IconButton Component
 * 
 * Standardized circular icon button for Search, Refresh, and other icon-only actions
 * Ensures consistent styling across all pages
 * 
 * @param {ReactNode} icon - Icon component
 * @param {function} onClick - Click handler
 * @param {string} tooltip - Tooltip text
 * @param {string} type - 'primary' | 'default' | 'dashed' | 'link' | 'text'
 * @param {string} size - 'small' | 'middle' | 'large' (default: 'large')
 * @param {boolean} loading - Loading state
 * @param {boolean} disabled - Disabled state
 */

import React from 'react';
import { Button, Tooltip } from 'antd';

export default function IconButton({
  icon,
  onClick,
  tooltip,
  type = 'default',
  size = 'large',
  loading = false,
  disabled = false,
  showText, // Filter out showText prop - IconButton doesn't support text
  text, // Filter out text prop - IconButton doesn't support text
  ...restProps
}) {
  const button = (
    <Button
      type={type}
      shape="circle"
      size={size}
      icon={icon}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      style={
        type !== 'primary'
          ? { background: '#fff', border: '1px solid #d9d9d9' }
          : undefined
      }
      {...restProps}
    />
  );

  return tooltip ? <Tooltip title={tooltip}>{button}</Tooltip> : button;
}

