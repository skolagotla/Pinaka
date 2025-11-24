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
 * @param {string} color - Icon color (default: '#3b82f6' for blue)
 * @param {string} hoverBgColor - Hover background color
 * @param {string} size - Button size: 'small' | 'middle' | 'large' (default: 'small')
 */

import React from 'react';
import { Button, Tooltip } from 'flowbite-react';

const DEFAULT_COLORS = {
  view: { color: '#3b82f6', hoverBg: '#dbeafe' }, // Blue - viewing/inspecting
  download: { color: '#06b6d4', hoverBg: '#cffafe' }, // Cyan - downloading/getting
  edit: { color: '#a855f7', hoverBg: '#f3e8ff' }, // Purple - editing/modifying
  delete: { color: '#ef4444', hoverBg: '#fee2e2' }, // Red - destructive action
  approve: { color: '#22c55e', hoverBg: '#dcfce7' }, // Green - positive action
  reject: { color: '#f87171', hoverBg: '#fee2e2' }, // Light red - rejection
  send: { color: '#f97316', hoverBg: '#ffedd5' }, // Orange - sending/sharing
  website: { color: '#2563eb', hoverBg: '#dbeafe' }, // Deep blue - external link
  instructions: { color: '#ec4899', hoverBg: '#fce7f3' }, // Pink - help/info
  replace: { color: '#eab308', hoverBg: '#fef9c3' }, // Gold - replacing/updating
  refresh: { color: '#3b82f6', hoverBg: '#dbeafe' }, // Blue - refreshing
  copy: { color: '#06b6d4', hoverBg: '#cffafe' }, // Cyan - copying
  share: { color: '#a855f7', hoverBg: '#f3e8ff' }, // Purple - sharing
  swap: { color: '#eab308', hoverBg: '#fef9c3' }, // Gold - swapping/replacing (alias for replace)
  check: { color: '#22c55e', hoverBg: '#dcfce7' }, // Green - check/approve (alias for approve)
  close: { color: '#f87171', hoverBg: '#fee2e2' }, // Light red - close/reject (alias for reject)
  default: { color: '#6b7280', hoverBg: '#f3f4f6' }, // Gray - default
};

export default function TableActionButton({
  icon,
  onClick,
  tooltip,
  color,
  hoverBgColor,
  size = 'sm',
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
      color="light"
      onClick={onClick}
      size={size}
      className="transition-all hover:scale-110"
      style={{
        color: finalColor,
        backgroundColor: 'transparent',
        border: 'none',
        ...restProps.style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = finalHoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      {...restProps}
    >
      {icon}
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} style="dark" placement="top">
        {button}
      </Tooltip>
    );
  }

  return button;
}
