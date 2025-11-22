"use client";

/**
 * TableActionButton Component
 * 
 * Standardized action button for table action columns with Library-style design
 * Features color-coded icons with hover effects and smooth transitions
 * 
 * @param {ReactNode} icon - Icon component
 * @param {function} onClick - Click handler
 * @param {string} tooltip - Tooltip text
 * @param {string} color - Icon color (default: '#1890ff' for blue)
 * @param {string} hoverBgColor - Hover background color
 * @param {string} size - Button size: 'small' | 'middle' | 'large' (default: 'small')
 */

import React from 'react';
import { Button, Tooltip } from 'antd';

const DEFAULT_COLORS = {
  view: { color: '#1890ff', hoverBg: '#e6f7ff' }, // Blue - viewing/inspecting
  download: { color: '#13c2c2', hoverBg: '#e6fffb' }, // Cyan - downloading/getting
  edit: { color: '#722ed1', hoverBg: '#f9f0ff' }, // Purple - editing/modifying
  delete: { color: '#ff4d4f', hoverBg: '#fff1f0' }, // Red - destructive action
  approve: { color: '#52c41a', hoverBg: '#f6ffed' }, // Green - positive action
  reject: { color: '#ff7875', hoverBg: '#fff1f0' }, // Light red - rejection
  send: { color: '#fa8c16', hoverBg: '#fff7e6' }, // Orange - sending/sharing
  website: { color: '#2f54eb', hoverBg: '#e6f4ff' }, // Deep blue - external link
  instructions: { color: '#eb2f96', hoverBg: '#fff0f6' }, // Pink - help/info
  replace: { color: '#faad14', hoverBg: '#fffbe6' }, // Gold - replacing/updating
  refresh: { color: '#1890ff', hoverBg: '#e6f7ff' }, // Blue - refreshing
  copy: { color: '#13c2c2', hoverBg: '#e6fffb' }, // Cyan - copying
  share: { color: '#722ed1', hoverBg: '#f9f0ff' }, // Purple - sharing
  swap: { color: '#faad14', hoverBg: '#fffbe6' }, // Gold - swapping/replacing (alias for replace)
  check: { color: '#52c41a', hoverBg: '#f6ffed' }, // Green - check/approve (alias for approve)
  close: { color: '#ff7875', hoverBg: '#fff1f0' }, // Light red - close/reject (alias for reject)
  default: { color: '#595959', hoverBg: '#f5f5f5' }, // Gray - default
};

export default function TableActionButton({
  icon,
  onClick,
  tooltip,
  color,
  hoverBgColor,
  size = 'small',
  actionType, // 'view' | 'download' | 'edit' | 'delete' | etc. - for default colors
  ...restProps
}) {
  // Get colors from actionType if provided, otherwise use props or defaults
  const colorConfig = actionType && DEFAULT_COLORS[actionType] 
    ? DEFAULT_COLORS[actionType]
    : { color: color || DEFAULT_COLORS.default.color, hoverBg: hoverBgColor || DEFAULT_COLORS.default.hoverBg };

  const finalColor = color || colorConfig.color;
  const finalHoverBg = hoverBgColor || colorConfig.hoverBg;

  const button = (
    <Button
      type="text"
      icon={icon}
      onClick={onClick}
      size={size}
      style={{
        color: finalColor,
        transition: 'all 0.2s',
        ...restProps.style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = finalHoverBg;
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      {...restProps}
    />
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        {button}
      </Tooltip>
    );
  }

  return button;
}

