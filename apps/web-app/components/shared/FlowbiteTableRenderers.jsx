"use client";

import React from 'react';
import { Badge, Tooltip } from 'flowbite-react';
import { HiCheckCircle, HiExclamation, HiXCircle } from 'react-icons/hi';
import dayjs from 'dayjs';
import { formatDateDisplay } from '@/lib/utils/safe-date-formatter';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/**
 * StatusBadge Component - Memoized for performance (Flowbite Version)
 */
const StatusBadge = React.memo(({ status, showIcon = true, customColors = {} }) => {
  const defaultColors = {
    'Paid': 'success',
    'Partial': 'info',
    'Unpaid': 'warning',
    'Overdue': 'failure',
    'Active': 'success',
    'Inactive': 'gray',
    'Pending': 'warning',
    'In Progress': 'info',
    'Completed': 'success',
    'Cancelled': 'failure',
    'New': 'gray',
    'Rented': 'success',
    'Vacant': 'warning',
  };
  
  const iconComponents = {
    'Paid': HiCheckCircle,
    'Completed': HiCheckCircle,
    'Active': HiCheckCircle,
    'Overdue': HiExclamation,
    'Unpaid': HiXCircle,
  };
  
  // Map Ant Design colors to Flowbite colors
  const colorMap = {
    'success': 'success',
    'processing': 'info',
    'warning': 'warning',
    'error': 'failure',
    'default': 'gray',
    'orange': 'warning',
  };
  
  // Handle customColors - can be a direct color or mapped through colorMap
  let color = defaultColors[status] || 'gray';
  if (customColors[status]) {
    // If custom color is provided, use it (mapped if needed)
    color = colorMap[customColors[status]] || customColors[status] || color;
  }
  
  // Render badge without icon prop (Flowbite Badge icon prop has issues)
  // Icons can be added later if needed, but for now just use text badges
  return (
    <Badge color={color}>
      {status}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

/**
 * Render status badge with appropriate color and icon (Flowbite Version)
 */
export function renderStatus(status, options = {}) {
  return <StatusBadge status={status} {...options} />;
}

/**
 * Render date in consistent format with UTC handling (Flowbite Version)
 */
export function renderDate(date, format = 'MMM D, YYYY') {
  if (!date) return <span className="text-gray-400">—</span>;
  
  try {
    return <span>{formatDateDisplay(date)}</span>;
  } catch (error) {
    console.error('Date formatting error:', error);
    return <span className="text-gray-400">—</span>;
  }
}

/**
 * Render currency with thousand separator (Flowbite Version)
 */
export function renderCurrency(amount, options = {}) {
  const { currency = '$', color, strong = false, showZero = true, country = 'CA' } = options;
  
  if (amount === null || amount === undefined) {
    return <span className="text-gray-400">—</span>;
  }
  
  if (!showZero && amount === 0) {
    return <span className="text-gray-400">—</span>;
  }
  
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === '$' ? (country === 'CA' ? 'CAD' : 'USD') : currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  const className = strong ? 'font-semibold' : '';
  const style = color ? { color } : {};
  
  return <span className={className} style={style}>{formatted}</span>;
}

