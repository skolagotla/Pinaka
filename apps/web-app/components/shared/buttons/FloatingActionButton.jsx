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
import { Button, Tooltip } from 'flowbite-react';

const POSITION_CLASSES = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
};

export default function FloatingActionButton({
  icon,
  onClick,
  tooltip,
  position = 'bottom-right',
  offset = 24,
  color = 'blue',
  size = 'lg',
  loading = false,
  disabled = false,
  className = '',
  style = {},
  ...restProps
}) {
  const positionClass = POSITION_CLASSES[position] || POSITION_CLASSES['bottom-right'];
  const finalStyle = {
    position: 'fixed',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    ...style,
  };

  const button = (
    <Button
      color={color}
      size={size}
      onClick={onClick}
      disabled={loading || disabled}
      className={`rounded-full ${positionClass} ${className}`}
      style={finalStyle}
      {...restProps}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        icon
      )}
    </Button>
  );

  return tooltip ? (
    <Tooltip content={tooltip} style="dark" placement="top">
      {button}
    </Tooltip>
  ) : button;
}
