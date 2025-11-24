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
import { Badge, Tooltip } from 'flowbite-react';
import { HiPhone, HiMail, HiOutlineCog, HiPencilAlt, HiTrash } from 'react-icons/hi';
import { Button } from 'flowbite-react';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';
import StarRating from '@/components/shared/StarRating';
import { FlowbitePopconfirm } from '@/components/shared/FlowbitePopconfirm';

/**
 * Tenant Column Definitions
 */
export const TENANT_COLUMNS = {
  NAME: customizeColumn(STANDARD_COLUMNS.TENANT_NAME, {
    render: (_, record) => {
      const name = record.firstName && record.lastName 
        ? `${record.firstName} ${record.lastName}`
        : record.name || record.tenantName || '—';
      return <span className="font-semibold">{name}</span>;
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
    render: (name) => <span className="font-semibold">{name}</span>,
  },

  BUSINESS_NAME: {
    title: 'Business Name',
    dataIndex: 'businessName',
    key: 'businessName',
    width: 180,
    align: 'center',
    render: (businessName) => businessName || <span className="text-gray-500 dark:text-gray-400">N/A</span>,
  },

  CATEGORY: customizeColumn(STANDARD_COLUMNS.CATEGORY, {
    render: (category) => (
      <Badge color="info" icon={HiOutlineCog}>{category}</Badge>
    ),
  }),

  PHONE: customizeColumn(STANDARD_COLUMNS.PHONE, {
    render: (phone) => (
      <div className="flex items-center gap-2">
        <HiPhone />
        <span>{phone}</span>
      </div>
    ),
  }),

  EMAIL: customizeColumn(STANDARD_COLUMNS.EMAIL, {
    render: (email) => email ? (
      <div className="flex items-center gap-2">
        <HiMail />
        <span>{email}</span>
      </div>
    ) : <span className="text-gray-500 dark:text-gray-400">N/A</span>,
  }),

  RATING: {
    title: 'Rating',
    dataIndex: 'rating',
    key: 'rating',
    width: 150,
    align: 'center',
    render: (rating) => rating ? <StarRating value={rating} showValue /> : <span className="text-gray-500 dark:text-gray-400">No ratings yet</span>,
  },

  HOURLY_RATE: {
    title: 'Hourly Rate',
    dataIndex: 'hourlyRate',
    key: 'hourlyRate',
    width: 130,
    align: 'right',
    render: (rate) => rate ? (
      <span className="font-semibold">${rate}/hr</span>
    ) : <span className="text-gray-500 dark:text-gray-400">N/A</span>,
  },

  ACTIONS: STANDARD_COLUMNS.ACTIONS,
};

/**
 * Property Column Definitions
 */
export const PROPERTY_COLUMNS = {
  NAME: customizeColumn(STANDARD_COLUMNS.PROPERTY_NAME, {
    render: (_, property) => (
      <span className="font-semibold">{property.propertyName || property.addressLine1}</span>
    ),
  }),

  ADDRESS: customizeColumn(STANDARD_COLUMNS.ADDRESS, {
    render: (_, property) => <span>{property.addressLine1}</span>,
  }),

  CITY_STATE: customizeColumn(STANDARD_COLUMNS.CITY_STATE, {
    render: (_, property) => (
      <span>{property.city}, {property.provinceState}</span>
    ),
  }),

  TYPE: customizeColumn(STANDARD_COLUMNS.TYPE, {
    dataIndex: 'propertyType',
    render: (type) => type ? <Badge color="info">{type}</Badge> : <span className="text-gray-500 dark:text-gray-400">—</span>,
  }),

  STATUS: customizeColumn(STANDARD_COLUMNS.STATUS, {
    render: (_, property) => {
      const activeLeases = property.units?.flatMap(unit => unit.leases || []).filter(lease => lease.status === "Active") || [];
      const hasActiveLease = activeLeases.length > 0;
      
      return hasActiveLease ? (
        <Badge color="success">Rented</Badge>
      ) : (
        <Badge color="gray">Vacant</Badge>
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
      
      if (!property) return <span className="text-gray-500 dark:text-gray-400">—</span>;
      
      const propertyName = property.propertyName || property.addressLine1;
      
      // Single unit: show property name only
      if (property.unitCount === 1) {
        return <span>{propertyName}</span>;
      }
      
      // Multiple units: show "Unit# - Property Name"
      const unitName = unit?.unitName || '';
      return <span>{unitName} - {propertyName}</span>;
    },
  },

  TENANT_NAME: customizeColumn(STANDARD_COLUMNS.TENANT_NAME, {
    render: (_, lease) => {
      const tenantNames = lease.leaseTenants?.map(lt => 
        `${lt.tenant?.firstName || ''} ${lt.tenant?.lastName || ''}`.trim()
      ).filter(Boolean).join(', ') || '—';
      return <span>{tenantNames}</span>;
    },
  }),

  START_DATE: customizeColumn(STANDARD_COLUMNS.START_DATE, {
    render: (_, lease) => renderDate(lease.leaseStart),
  }),

  END_DATE: customizeColumn(STANDARD_COLUMNS.END_DATE, {
    render: (_, lease) => (
      <span>{lease.leaseEnd ? formatDateDisplay(lease.leaseEnd) : 'Month-to-month'}</span>
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
    render: (title) => (
      <Tooltip content={title}>
        <span className="truncate block max-w-xs">{title}</span>
      </Tooltip>
    ),
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
    render: (category) => <Badge color="info">{category}</Badge>,
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
      
      if (!property) return <span className="text-gray-500 dark:text-gray-400">—</span>;
      
      const propertyName = property.propertyName || property.addressLine1;
      const unitName = property.unitCount === 1 ? '' : (unit?.unitName || '');
      
      return (
        <span>
          {unitName ? `${unitName} - ` : ''}{propertyName}
        </span>
      );
    },
  },

  TENANT: customizeColumn(STANDARD_COLUMNS.TENANT_NAME, {
    render: (_, payment) => {
      const tenant = payment.lease?.leaseTenants?.[0]?.tenant;
      if (!tenant) return <span className="text-gray-500 dark:text-gray-400">—</span>;
      return <span>{`${tenant.firstName} ${tenant.lastName}`}</span>;
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
  const { FlowbitePopconfirm } = require('@/components/shared/FlowbitePopconfirm');
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
          <FlowbitePopconfirm
            key="delete"
            title={deleteConfirmTitle}
            description={deleteConfirmDescription}
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <ActionButton
              action="delete"
              tooltip={deleteTooltip}
              size="middle"
            />
          </FlowbitePopconfirm>
        );
      }

      return buttons.length > 0 ? <div className="flex items-center gap-2">{buttons}</div> : null;
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

