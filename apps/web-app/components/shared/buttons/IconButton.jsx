"use client";

/**
 * IconButton Component (Flowbite Version)
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
import { Button, Tooltip } from 'flowbite-react';

const SIZE_MAP = {
  small: 'xs',
  middle: 'sm',
  large: 'md',
};

const COLOR_MAP = {
  primary: 'blue',
  default: 'gray',
  dashed: 'light',
  link: 'light',
  text: 'light',
};

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
  const flowbiteSize = SIZE_MAP[size] || 'md';
  const flowbiteColor = COLOR_MAP[type] || 'gray';
  
  const button = (
    <Button
      color={flowbiteColor}
      size={flowbiteSize}
      pill
      onClick={onClick}
      disabled={disabled || loading}
      className="p-2"
      {...restProps}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && icon}
    </Button>
  );

  return tooltip ? <Tooltip content={tooltip} trigger="hover">{button}</Tooltip> : button;
}
