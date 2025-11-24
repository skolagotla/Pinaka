/**
 * Consolidated Column Definitions
 * 
 * Pre-configured column definitions for common entities across the application.
 * These definitions combine STANDARD_COLUMNS with TableRenderers for consistent
 * table displays across all pages.
 * 
 * Usage:
 * import { TENANT_COLUMNS, VENDOR_COLUMNS } from '@/lib/constants/column-definitions';
 * 
 * const columns = [
 *   TENANT_COLUMNS.NAME,
 *   TENANT_COLUMNS.EMAIL,
 *   TENANT_COLUMNS.PHONE,
 *   TENANT_COLUMNS.ACTIONS
 * ];
 */

import { STANDARD_COLUMNS, customizeColumn } from './standard-columns';
import { renderStatus, renderDate, renderCurrency, renderEmail, renderPhone, renderProperty, renderTenant, renderTicketNumber, renderPriority } from '@/components/shared/TableRenderers';
import { formatDateDisplay } from '../utils/unified-date-formatter';
import { Typography, Tag, Space, Rate } from 'antd';
import { PhoneOutlined, MailOutlined, ToolOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Tooltip, Popconfirm } from 'antd';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';

const { Text } = Typography;

/**
 * Tenant Column Definitions
 */
export const TENANT_COLUMNS = {
  NAME: customizeColumn(STANDARD_COLUMNS.TENANT_NAME, {
    render: (_, record) => {
      const name = record.firstName && record.lastName 
        ? `${record.firstName} ${record.lastName}`
        : record.name || record.tenantName || '—';
      return <Text strong>{name}</Text>;
    },
  }),

  EMAIL: customizeColumn(STANDARD_COLUMNS.EMAIL, {
    render: (email) => renderEmail(email),
  }),

  PHONE: customizeColumn(STANDARD_COLUMNS.PHONE, {
    render: (phone) => renderPhone(phone),
  }),

  STATUS: customizeColumn(STANDARD_COLUMNS.STATUS, {
    render: (status) => renderStatus(status),
  }),

  CREATED_DATE: customizeColumn(STANDARD_COLUMNS.CREATED_DATE, {
    render: (_, record) => renderDate(record.createdAt || record.requestedDate),
  }),

  ACTIONS: STANDARD_COLUMNS.ACTIONS,
};

/**
 * Vendor Column Definitions
 */
export const VENDOR_COLUMNS = {
  CONTACT_NAME: {
    title: 'Contact Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    align: 'center',
    render: (name) => <Text strong>{name}</Text>,
  },

  BUSINESS_NAME: {
    title: 'Business Name',
    dataIndex: 'businessName',
    key: 'businessName',
    width: 180,
    align: 'center',
    render: (businessName) => businessName || <Text type="secondary">N/A</Text>,
  },

  CATEGORY: customizeColumn(STANDARD_COLUMNS.CATEGORY, {
    render: (category) => (
      <Tag color="blue" icon={<ToolOutlined />}>{category}</Tag>
    ),
  }),

  PHONE: customizeColumn(STANDARD_COLUMNS.PHONE, {
    render: (phone) => (
      <Space>
        <PhoneOutlined />
        <Text>{phone}</Text>
      </Space>
    ),
  }),

  EMAIL: customizeColumn(STANDARD_COLUMNS.EMAIL, {
    render: (email) => email ? (
      <Space>
        <MailOutlined />
        <Text>{email}</Text>
      </Space>
    ) : <Text type="secondary">N/A</Text>,
  }),

  RATING: {
    title: 'Rating',
    dataIndex: 'rating',
    key: 'rating',
    width: 150,
    align: 'center',
    render: (rating) => rating ? <Rate disabled value={rating} /> : <Text type="secondary">No ratings yet</Text>,
  },

  HOURLY_RATE: {
    title: 'Hourly Rate',
    dataIndex: 'hourlyRate',
    key: 'hourlyRate',
    width: 130,
    align: 'right',
    render: (rate) => rate ? (
      <Text strong>${rate}/hr</Text>
    ) : <Text type="secondary">N/A</Text>,
  },

  ACTIONS: STANDARD_COLUMNS.ACTIONS,
};

/**
 * Property Column Definitions
 */
export const PROPERTY_COLUMNS = {
  NAME: customizeColumn(STANDARD_COLUMNS.PROPERTY_NAME, {
    render: (_, property) => (
      <Text strong>{property.propertyName || property.addressLine1}</Text>
    ),
  }),

  ADDRESS: customizeColumn(STANDARD_COLUMNS.ADDRESS, {
    render: (_, property) => <Text>{property.addressLine1}</Text>,
  }),

  CITY_STATE: customizeColumn(STANDARD_COLUMNS.CITY_STATE, {
    render: (_, property) => (
      <Text>{property.city}, {property.provinceState}</Text>
    ),
  }),

  TYPE: customizeColumn(STANDARD_COLUMNS.TYPE, {
    dataIndex: 'propertyType',
    render: (type) => type ? <Tag color="blue">{type}</Tag> : <Text type="secondary">—</Text>,
  }),

  STATUS: customizeColumn(STANDARD_COLUMNS.STATUS, {
    render: (_, property) => {
      const activeLeases = property.units?.flatMap(unit => unit.leases || []).filter(lease => lease.status === "Active") || [];
      const hasActiveLease = activeLeases.length > 0;
      
      return hasActiveLease ? (
        <Tag color="success">Rented</Tag>
      ) : (
        <Tag color="default">Vacant</Tag>
      );
    },
  }),

  ACTIONS: STANDARD_COLUMNS.ACTIONS,
};

/**
 * Lease Column Definitions
 */
export const LEASE_COLUMNS = {
  PROPERTY_UNIT: {
    title: 'Property / Unit',
    key: 'propertyUnit',
    width: 200,
    align: 'center',
    ellipsis: true,
    render: (_, lease, units = []) => {
      const unit = units.find(u => u.id === lease.unitId);
      const property = unit?.property;
      
      if (!property) return <Text type="secondary">—</Text>;
      
      const propertyName = property.propertyName || property.addressLine1;
      
      // Single unit: show property name only
      if (property.unitCount === 1) {
        return <Text>{propertyName}</Text>;
      }
      
      // Multiple units: show "Unit# - Property Name"
      const unitName = unit?.unitName || '';
      return <Text>{unitName} - {propertyName}</Text>;
    },
  },

  TENANT_NAME: customizeColumn(STANDARD_COLUMNS.TENANT_NAME, {
    render: (_, lease) => {
      const tenantNames = lease.leaseTenants?.map(lt => 
        `${lt.tenant?.firstName || ''} ${lt.tenant?.lastName || ''}`.trim()
      ).filter(Boolean).join(', ') || '—';
      return <Text>{tenantNames}</Text>;
    },
  }),

  START_DATE: customizeColumn(STANDARD_COLUMNS.START_DATE, {
    render: (_, lease) => renderDate(lease.leaseStart),
  }),

  END_DATE: customizeColumn(STANDARD_COLUMNS.END_DATE, {
    render: (_, lease) => (
      <Text>{lease.leaseEnd ? formatDateDisplay(lease.leaseEnd) : 'Month-to-month'}</Text>
    ),
  }),

  MONTHLY_RENT: customizeColumn(STANDARD_COLUMNS.MONTHLY_RENT, {
    dataIndex: 'rentAmount',
    align: 'right',
    render: (amount, record) => {
      const country = record.unit?.property?.country || 'CA';
      return (
        <CurrencyDisplay 
          value={amount} 
          country={country}
          strong 
          style={{ color: '#52c41a' }}
        />
      );
    },
  }),

  STATUS: customizeColumn(STANDARD_COLUMNS.STATUS, {
    render: (status) => renderStatus(status),
  }),

  ACTIONS: STANDARD_COLUMNS.ACTIONS,
};

/**
 * Maintenance Request Column Definitions
 */
export const MAINTENANCE_COLUMNS = {
  TICKET_NUMBER: customizeColumn(STANDARD_COLUMNS.TICKET_NUMBER, {
    render: (ticketNumber) => renderTicketNumber(ticketNumber),
  }),

  TITLE: customizeColumn(STANDARD_COLUMNS.TITLE, {
    render: (title) => <Text ellipsis={{ tooltip: title }}>{title}</Text>,
  }),

  PROPERTY: {
    title: 'Property',
    key: 'property',
    width: 180,
    align: 'center',
    ellipsis: true,
    render: (_, record) => renderProperty(record.property),
  },

  CATEGORY: customizeColumn(STANDARD_COLUMNS.CATEGORY, {
    render: (category) => <Tag color="blue">{category}</Tag>,
  }),

  PRIORITY: customizeColumn(STANDARD_COLUMNS.PRIORITY, {
    render: (priority) => renderPriority(priority),
  }),

  STATUS: customizeColumn(STANDARD_COLUMNS.STATUS, {
    render: (status) => renderStatus(status),
  }),

  CREATED_DATE: customizeColumn(STANDARD_COLUMNS.CREATED_DATE, {
    render: (_, record) => renderDate(record.requestedDate || record.createdAt),
  }),

  ACTIONS: STANDARD_COLUMNS.ACTIONS,
};

/**
 * Rent Payment Column Definitions
 */
export const RENT_PAYMENT_COLUMNS = {
  PROPERTY_UNIT: {
    title: 'Property / Unit',
    key: 'propertyUnit',
    width: 200,
    align: 'center',
    ellipsis: true,
    render: (_, payment) => {
      const property = payment.lease?.unit?.property;
      const unit = payment.lease?.unit;
      
      if (!property) return <Text type="secondary">—</Text>;
      
      const propertyName = property.propertyName || property.addressLine1;
      const unitName = property.unitCount === 1 ? '' : (unit?.unitName || '');
      
      return (
        <Text>
          {unitName ? `${unitName} - ` : ''}{propertyName}
        </Text>
      );
    },
  },

  TENANT: customizeColumn(STANDARD_COLUMNS.TENANT_NAME, {
    render: (_, payment) => {
      const tenant = payment.lease?.leaseTenants?.[0]?.tenant;
      if (!tenant) return <Text type="secondary">—</Text>;
      return <Text>{`${tenant.firstName} ${tenant.lastName}`}</Text>;
    },
  }),

  DUE_DATE: customizeColumn(STANDARD_COLUMNS.DUE_DATE, {
    render: (_, payment) => renderDate(payment.dueDate),
  }),

  AMOUNT: customizeColumn(STANDARD_COLUMNS.DUE_AMOUNT, {
    dataIndex: 'amount',
    align: 'right',
    render: (amount, record) => {
      const country = record.lease?.unit?.property?.country || 'CA';
      return (
        <CurrencyDisplay 
          value={amount} 
          country={country}
          strong
        />
      );
    },
  }),

  STATUS: customizeColumn(STANDARD_COLUMNS.STATUS, {
    render: (status) => renderStatus(status),
  }),

  PAID_DATE: customizeColumn(STANDARD_COLUMNS.PAID_DATE, {
    render: (_, payment) => renderDate(payment.paidDate),
  }),

  ACTIONS: STANDARD_COLUMNS.ACTIONS,
};

/**
 * Helper function to create action column with edit/delete buttons
 * 
 * Note: This function returns a column definition. For better consistency,
 * consider using useActionButtons hook directly in your component:
 * 
 * const { renderActions } = useActionButtons({ onEdit, onDelete });
 * 
 * Then in your column definition:
 * {
 *   title: 'Actions',
 *   key: 'actions',
 *   render: (_, record) => renderActions(record)
 * }
 */
export function createActionColumn(onEdit, onDelete, options = {}) {
  const {
    editTooltip = 'Edit',
    deleteTooltip = 'Delete',
    deleteConfirmTitle = 'Are you sure you want to delete this item?',
    deleteConfirmDescription,
    showEdit = true,
    showDelete = true,
  } = options;

  // Import ActionButton components directly (can't use hooks in non-component function)
  const React = require('react');
  const { Space, Popconfirm, Tooltip } = require('antd');
  const { ActionButton } = require('@/components/shared/buttons');

  return {
    ...STANDARD_COLUMNS.ACTIONS,
    render: (_, record) => {
      const buttons = [];

      if (showEdit && onEdit) {
        buttons.push(
          <ActionButton
            key="edit"
            action="edit"
            onClick={() => onEdit(record)}
            tooltip={editTooltip}
            size="middle"
          />
        );
      }

      if (showDelete && onDelete) {
        buttons.push(
          <Popconfirm
            key="delete"
            title={deleteConfirmTitle}
            description={deleteConfirmDescription}
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <ActionButton
              action="delete"
              tooltip={deleteTooltip}
              size="middle"
            />
          </Popconfirm>
        );
      }

      return buttons.length > 0 ? <Space size="small">{buttons}</Space> : null;
    },
  };
}

/**
 * Export all column definitions
 */
export const COLUMN_DEFINITIONS = {
  TENANT: TENANT_COLUMNS,
  VENDOR: VENDOR_COLUMNS,
  PROPERTY: PROPERTY_COLUMNS,
  LEASE: LEASE_COLUMNS,
  MAINTENANCE: MAINTENANCE_COLUMNS,
  RENT_PAYMENT: RENT_PAYMENT_COLUMNS,
};

export default COLUMN_DEFINITIONS;

