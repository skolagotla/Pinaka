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
import { Tag, Typography, Tooltip, Space } from 'antd';
import { CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatDateDisplay } from '@/lib/utils/safe-date-formatter';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const { Text } = Typography;

/**
 * StatusTag Component - Memoized for performance
 * Prevents unnecessary re-renders when status value hasn't changed
 */
const StatusTag = React.memo(({ status, showIcon = true, customColors = {} }) => {
  const defaultColors = {
    'Paid': 'success',
    'Partial': 'processing',
    'Unpaid': 'warning',
    'Overdue': 'error',
    'Active': 'success',
    'Inactive': 'default',
    'Pending': 'warning',
    'In Progress': 'processing',
    'Completed': 'success',
    'Cancelled': 'error',
    'New': 'default',
    'Rented': 'success',
    'Vacant': 'warning',
  };
  
  const icons = {
    'Paid': <CheckCircleOutlined />,
    'Completed': <CheckCircleOutlined />,
    'Active': <CheckCircleOutlined />,
    'Overdue': <WarningOutlined />,
    'Unpaid': <CloseCircleOutlined />,
  };
  
  const color = customColors[status] || defaultColors[status] || 'default';
  const icon = showIcon ? icons[status] : null;
  
  return (
    <Tag color={color} icon={icon}>
      {status}
    </Tag>
  );
});

StatusTag.displayName = 'StatusTag';

/**
 * Render status badge with appropriate color and icon
 * @param {string} status - Status value
 * @param {Object} options - Additional options (icon, customColors)
 * @returns {JSX.Element} Status tag
 */
export function renderStatus(status, options = {}) {
  return <StatusTag status={status} {...options} />;
}

/**
 * Render date in consistent format with UTC handling
 * @param {string|Date} date - Date to render
 * @param {string} format - Date format (default: 'MMM D, YYYY')
 * @returns {JSX.Element} Formatted date
 */
export function renderDate(date, format = 'MMM D, YYYY') {
  if (!date) return <Text type="secondary">—</Text>;
  
  try {
    return <Text>{formatDateDisplay(date)}</Text>;
  } catch (error) {
    console.error('Date formatting error:', error);
    return <Text type="secondary">—</Text>;
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
    return <Text type="secondary">—</Text>;
  }
  
  if (!showZero && amount === 0) {
    return <Text type="secondary">—</Text>;
  }
  
  // Use rules engine pattern: thousand separator (comma) and 2 decimal places
  const numValue = parseFloat(amount);
  const formattedValue = numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  });
  
  return (
    <Text strong={strong} style={color ? { color } : undefined}>
      {currency === '$' ? `$${formattedValue}` : `${currency}${formattedValue}`}
    </Text>
  );
}

/**
 * Render balance (due amount) with color coding
 * @param {number} balance - Balance amount
 * @param {string} currency - Currency symbol
 * @returns {JSX.Element} Formatted balance
 */
export function renderBalance(balance, currency = '$') {
  const color = balance > 0 ? '#ff4d4f' : '#52c41a';
  return renderCurrency(balance, { currency, color, strong: true });
}

/**
 * PropertyDisplay Component - Memoized for performance
 */
const PropertyDisplay = React.memo(({ property, unit }) => {
  if (!property) return <Text type="secondary">—</Text>;
  
  const propertyName = property.propertyName || property.addressLine1 || 'Unknown Property';
  const unitName = unit?.unitName;
  
  if (unitName) {
    return (
      <Text>
        {propertyName} - {unitName}
      </Text>
    );
  }
  
  return <Text>{propertyName}</Text>;
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
  if (!tenant) return <Text type="secondary">—</Text>;
  
  const name = tenant.firstName && tenant.lastName
    ? `${tenant.firstName} ${tenant.lastName}`
    : tenant.email || 'Unknown Tenant';
  
  return <Text>{name}</Text>;
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
  if (!receiptNumber) return <Text type="secondary">—</Text>;
  
  return (
    <Text 
      strong 
      style={{ 
        fontFamily: 'monospace', 
        fontSize: 12,
        textAlign: 'center',
        display: 'block'
      }}
    >
      {receiptNumber}
    </Text>
  );
}

/**
 * Render email with tooltip
 * @param {string} email - Email address
 * @returns {JSX.Element} Formatted email
 */
export function renderEmail(email) {
  if (!email) {
    return <Text type="secondary">—</Text>;
  }
  
  return (
    <Tooltip
      title={email}
      placement="top"
      overlayStyle={{
        maxWidth: '300px',
        wordBreak: 'break-word',
      }}
    >
      <Text
        style={{
          cursor: 'help',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
        }}
      >
        {email}
      </Text>
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
    return <Text type="secondary">—</Text>;
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
  
  return <Text>{formatted}</Text>;
}

/**
 * Render address (single line)
 * @param {Object} address - Address object
 * @returns {JSX.Element} Formatted address
 */
export function renderAddress(address) {
  if (!address) {
    return <Text type="secondary">—</Text>;
  }
  
  const parts = [
    address.addressLine1,
    address.city,
    address.provinceState,
    address.postalZip,
  ].filter(Boolean);
  
  return <Text>{parts.join(', ')}</Text>;
}

/**
 * Render boolean as Yes/No badge
 * @param {boolean} value - Boolean value
 * @returns {JSX.Element} Yes/No tag
 */
export function renderBoolean(value) {
  return (
    <Tag color={value ? 'success' : 'default'}>
      {value ? 'Yes' : 'No'}
    </Tag>
  );
}

/**
 * Render priority with icon and color
 * @param {string} priority - Priority level (High, Medium, Low)
 * @returns {JSX.Element} Priority display
 */
export function renderPriority(priority) {
  const config = {
    'High': { color: 'error', icon: '🔴' },
    'Medium': { color: 'warning', icon: '🟡' },
    'Low': { color: 'default', icon: '🟢' },
  };
  
  const { color, icon } = config[priority] || config['Low'];
  
  return (
    <Tag color={color}>
      <Space size={4}>
        <span>{icon}</span>
        <span>{priority}</span>
      </Space>
    </Tag>
  );
}

/**
 * Render ticket number with formatting
 * @param {string} ticketNumber - Ticket number
 * @returns {JSX.Element} Formatted ticket number
 */
export function renderTicketNumber(ticketNumber) {
  if (!ticketNumber) {
    return <Text type="secondary">—</Text>;
  }
  
  return (
    <Text 
      strong 
      style={{ 
        fontFamily: 'monospace', 
        fontSize: 12,
        textAlign: 'center',
        display: 'block'
      }}
    >
      {ticketNumber}
    </Text>
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
    return <Text type="secondary">—</Text>;
  }
  return <Text>{display || value}</Text>;
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
