"use client";

/**
 * FloatingActionButton Component
 * 
 * Standardized floating action button for mobile and overlay contexts
 * Positioned absolutely, typically in bottom-right corner
 * 
 * @param {ReactNode} icon - Icon component
 * @param {function} onClick - Click handler
 * @param {string} tooltip - Tooltip text
 * @param {string} position - 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
 * @param {number} offset - Offset from edge in pixels (default: 24)
 * @param {string} type - 'primary' | 'default'
 * @param {boolean} loading - Loading state
 * @param {boolean} disabled - Disabled state
 */

import React from 'react';
import { Button, Tooltip } from 'antd';

const POSITION_STYLES = {
  'bottom-right': { bottom: 24, right: 24 },
  'bottom-left': { bottom: 24, left: 24 },
  'top-right': { top: 24, right: 24 },
  'top-left': { top: 24, left: 24 },
};

export default function FloatingActionButton({
  icon,
  onClick,
  tooltip,
  position = 'bottom-right',
  offset = 24,
  type = 'primary',
  size = 'large',
  loading = false,
  disabled = false,
  style = {},
  ...restProps
}) {
  const positionStyle = POSITION_STYLES[position] || POSITION_STYLES['bottom-right'];
  const finalStyle = {
    position: 'fixed',
    zIndex: 1000,
    ...positionStyle,
    bottom: positionStyle.bottom !== undefined ? offset : undefined,
    right: positionStyle.right !== undefined ? offset : undefined,
    top: positionStyle.top !== undefined ? offset : undefined,
    left: positionStyle.left !== undefined ? offset : undefined,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    ...style,
  };

  const button = (
    <Button
      type={type}
      shape="circle"
      size={size}
      icon={icon}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      style={finalStyle}
      {...restProps}
    />
  );

  return tooltip ? <Tooltip title={tooltip}>{button}</Tooltip> : button;
}

