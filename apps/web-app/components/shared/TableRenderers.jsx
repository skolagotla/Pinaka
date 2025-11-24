/**
 * Shared Table Column Renderers
 * Reusable rendering functions for common table columns across the application
 * 
 * Usage:
 * import { renderStatus, renderDate, renderCurrency } from '@/components/shared/TableRenderers';
 * 
 * const columns = [
 *   { title: 'Status', render: (_, record) => renderStatus(record.status) },
 *   { title: 'Date', render: (_, record) => renderDate(record.date) },
 * ];
 */

import React from 'react';
import { Badge, Tooltip } from 'flowbite-react';
import { HiCheckCircle, HiExclamation, HiXCircle } from 'react-icons/hi';
import dayjs from 'dayjs';
import { formatDateDisplay } from '@/lib/utils/safe-date-formatter';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/**
 * StatusBadge Component - Memoized for performance
 * Prevents unnecessary re-renders when status value hasn't changed
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
  
  const icons = {
    'Paid': <HiCheckCircle className="h-3 w-3" />,
    'Completed': <HiCheckCircle className="h-3 w-3" />,
    'Active': <HiCheckCircle className="h-3 w-3" />,
    'Overdue': <HiExclamation className="h-3 w-3" />,
    'Unpaid': <HiXCircle className="h-3 w-3" />,
  };
  
  const color = customColors[status] || defaultColors[status] || 'gray';
  const icon = showIcon ? icons[status] : null;
  
  return (
    <Badge color={color} icon={icon}>
      {status}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

/**
 * Render status badge with appropriate color and icon
 * @param {string} status - Status value
 * @param {Object} options - Additional options (icon, customColors)
 * @returns {JSX.Element} Status badge
 */
export function renderStatus(status, options = {}) {
  return <StatusBadge status={status} {...options} />;
}

/**
 * Render date in consistent format with UTC handling
 * @param {string|Date} date - Date to render
 * @param {string} format - Date format (default: 'MMM D, YYYY')
 * @returns {JSX.Element} Formatted date
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
 * Render currency with thousand separator using rules engine
 * @param {number} amount - Amount to render
 * @param {Object} options - Additional options (currency, color, strong, country)
 * @returns {JSX.Element} Formatted currency
 */
export function renderCurrency(amount, options = {}) {
  const { currency = '$', color, strong = false, showZero = true, country = 'CA' } = options;
  
  if (amount === null || amount === undefined) {
    return <span className="text-gray-400">—</span>;
  }
  
  if (!showZero && amount === 0) {
    return <span className="text-gray-400">—</span>;
  }
  
  // Use rules engine pattern: thousand separator (comma) and 2 decimal places
  const numValue = parseFloat(amount);
  const formattedValue = numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  });
  
  const style = color ? { color } : undefined;
  const className = strong ? 'font-semibold' : '';
  
  return (
    <span className={className} style={style}>
      {currency === '$' ? `$${formattedValue}` : `${currency}${formattedValue}`}
    </span>
  );
}

/**
 * Render balance (due amount) with color coding
 * @param {number} balance - Balance amount
 * @param {string} currency - Currency symbol
 * @returns {JSX.Element} Formatted balance
 */
export function renderBalance(balance, currency = '$') {
  const color = balance > 0 ? '#ef4444' : '#10b981';
  return renderCurrency(balance, { currency, color, strong: true });
}

/**
 * PropertyDisplay Component - Memoized for performance
 */
const PropertyDisplay = React.memo(({ property, unit }) => {
  if (!property) return <span className="text-gray-400">—</span>;
  
  const propertyName = property.propertyName || property.addressLine1 || 'Unknown Property';
  const unitName = unit?.unitName;
  
  if (unitName) {
    return (
      <span>
        {propertyName} - {unitName}
      </span>
    );
  }
  
  return <span>{propertyName}</span>;
});

PropertyDisplay.displayName = 'PropertyDisplay';

/**
 * Render property name with unit handling
 * @param {Object} property - Property object
 * @param {Object} unit - Unit object (optional)
 * @returns {JSX.Element} Formatted property/unit name
 */
export function renderProperty(property, unit = null) {
  return <PropertyDisplay property={property} unit={unit} />;
}

/**
 * TenantDisplay Component - Memoized for performance
 */
const TenantDisplay = React.memo(({ tenant }) => {
  if (!tenant) return <span className="text-gray-400">—</span>;
  
  const name = tenant.firstName && tenant.lastName
    ? `${tenant.firstName} ${tenant.lastName}`
    : tenant.email || 'Unknown Tenant';
  
  return <span>{name}</span>;
});

TenantDisplay.displayName = 'TenantDisplay';

/**
 * Render tenant name
 * @param {Object} tenant - Tenant object
 * @returns {JSX.Element} Formatted tenant name
 */
export function renderTenant(tenant) {
  return <TenantDisplay tenant={tenant} />;
}

/**
 * Render receipt number with formatting
 * @param {string} receiptNumber - Receipt number
 * @returns {JSX.Element} Formatted receipt number
 */
export function renderReceiptNumber(receiptNumber) {
  if (!receiptNumber) return <span className="text-gray-400">—</span>;
  
  return (
    <span 
      className="font-mono text-xs text-center block font-semibold"
    >
      {receiptNumber}
    </span>
  );
}

/**
 * Render email with tooltip
 * @param {string} email - Email address
 * @returns {JSX.Element} Formatted email
 */
export function renderEmail(email) {
  if (!email) {
    return <span className="text-gray-400">—</span>;
  }
  
  return (
    <Tooltip content={email}>
      <span className="cursor-help underline decoration-dotted">
        {email}
      </span>
    </Tooltip>
  );
}

/**
 * Render phone number using rules engine
 * Format: (XXX)XXX-XXXX (no space after area code per rules)
 * @param {string} phone - Phone number
 * @returns {JSX.Element} Formatted phone
 */
export function renderPhone(phone) {
  if (!phone) {
    return <span className="text-gray-400">—</span>;
  }
  
  // Use rules engine format: (XXX)XXX-XXXX
  const cleaned = phone.replace(/\D/g, '');
  const limited = cleaned.substring(0, 10);
  
  let formatted;
  if (limited.length <= 3) {
    formatted = limited;
  } else if (limited.length <= 6) {
    formatted = `(${limited.slice(0, 3)})${limited.slice(3)}`;
  } else {
    formatted = `(${limited.slice(0, 3)})${limited.slice(3, 6)}-${limited.slice(6)}`;
  }
  
  return <span>{formatted}</span>;
}

/**
 * Render address (single line)
 * @param {Object} address - Address object
 * @returns {JSX.Element} Formatted address
 */
export function renderAddress(address) {
  if (!address) {
    return <span className="text-gray-400">—</span>;
  }
  
  const parts = [
    address.addressLine1,
    address.city,
    address.provinceState,
    address.postalZip,
  ].filter(Boolean);
  
  return <span>{parts.join(', ')}</span>;
}

/**
 * Render boolean as Yes/No badge
 * @param {boolean} value - Boolean value
 * @returns {JSX.Element} Yes/No badge
 */
export function renderBoolean(value) {
  return (
    <Badge color={value ? 'success' : 'gray'}>
      {value ? 'Yes' : 'No'}
    </Badge>
  );
}

/**
 * Render priority with icon and color
 * @param {string} priority - Priority level (High, Medium, Low)
 * @returns {JSX.Element} Priority display
 */
export function renderPriority(priority) {
  const config = {
    'High': { color: 'failure', icon: '🔴' },
    'Medium': { color: 'warning', icon: '🟡' },
    'Low': { color: 'gray', icon: '🟢' },
  };
  
  const { color, icon } = config[priority] || config['Low'];
  
  return (
    <Badge color={color}>
      <span className="flex items-center gap-1">
        <span>{icon}</span>
        <span>{priority}</span>
      </span>
    </Badge>
  );
}

/**
 * Render ticket number with formatting
 * @param {string} ticketNumber - Ticket number
 * @returns {JSX.Element} Formatted ticket number
 */
export function renderTicketNumber(ticketNumber) {
  if (!ticketNumber) {
    return <span className="text-gray-400">—</span>;
  }
  
  return (
    <span 
      className="font-mono text-xs text-center block font-semibold"
    >
      {ticketNumber}
    </span>
  );
}

/**
 * Render empty/null value consistently
 * @param {any} value - Value to check
 * @param {string} display - What to display if value exists
 * @returns {JSX.Element} Value or empty placeholder
 */
export function renderValue(value, display) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">—</span>;
  }
  return <span>{display || value}</span>;
}

/**
 * Create column definition with common props
 * @param {Object} config - Column configuration
 * @returns {Object} Column definition
 */
export function createColumn(config) {
  const {
    title,
    dataIndex,
    key,
    render,
    align = 'center',
    sorter,
    filters,
    width,
  } = config;
  
  return {
    title,
    dataIndex,
    key: key || dataIndex,
    align,
    render,
    sorter,
    filters,
    width,
  };
}

// Export all renderers as a group for convenient importing
export const TableRenderers = {
  renderStatus,
  renderDate,
  renderCurrency,
  renderBalance,
  renderProperty,
  renderTenant,
  renderReceiptNumber,
  renderEmail,
  renderPhone,
  renderAddress,
  renderBoolean,
  renderPriority,
  renderTicketNumber,
  renderValue,
  createColumn,
};

export default TableRenderers;
