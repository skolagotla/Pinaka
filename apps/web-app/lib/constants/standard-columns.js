/**
 * Standardized Column Names and Configurations
 * 
 * This file defines consistent column naming across the entire application
 * to ensure uniformity and better user experience.
 * 
 * Usage:
 * import { STANDARD_COLUMNS } from '@/lib/constants/standard-columns';
 * 
 * columns: [
 *   STANDARD_COLUMNS.PROPERTY_NAME,
 *   STANDARD_COLUMNS.TENANT_NAME,
 *   ...
 * ]
 */

/**
 * Standard Column Names
 * These are the official column names to be used across all tables
 */
export const COLUMN_NAMES = {
  // Primary Identifiers
  DOCUMENT_ID: 'Document ID',
  TICKET_NUMBER: 'Ticket #',
  RECEIPT_NUMBER: 'Receipt #',
  PROPERTY_ID: 'Property ID',
  UNIT_ID: 'Unit ID',
  TENANT_ID: 'Tenant ID',
  LEASE_ID: 'Lease ID',
  
  // Names
  PROPERTY_NAME: 'Property Name',
  UNIT_NAME: 'Unit Name',
  TENANT_NAME: 'Tenant Name',
  LANDLORD_NAME: 'Landlord Name',
  
  // Contact Information
  EMAIL: 'Email Address',
  PHONE: 'Phone Number',
  
  // Addresses
  ADDRESS: 'Address',
  CITY_STATE: 'City, State',
  LOCATION: 'Location',
  
  // Financial
  RENT_AMOUNT: 'Rent Amount',
  MONTHLY_RENT: 'Monthly Rent',
  DUE_AMOUNT: 'Amount Due',
  PAID_AMOUNT: 'Amount Paid',
  BALANCE: 'Balance',
  DEPOSIT: 'Security Deposit',
  
  // Dates
  DATE: 'Date',
  DUE_DATE: 'Due Date',
  PAID_DATE: 'Paid Date',
  START_DATE: 'Start Date',
  END_DATE: 'End Date',
  CREATED_DATE: 'Created Date',
  UPLOADED_DATE: 'Uploaded Date',
  EXPIRATION_DATE: 'Expiration Date',
  
  // Status
  STATUS: 'Status',
  PRIORITY: 'Priority',
  
  // Categories
  CATEGORY: 'Category',
  TYPE: 'Type',
  
  // Descriptions
  DESCRIPTION: 'Description',
  NOTES: 'Notes',
  TITLE: 'Title',
  
  // Property Details
  BEDROOMS: 'Bedrooms',
  BATHROOMS: 'Bathrooms',
  UNITS: 'Units',
  OCCUPIED: 'Occupied',
  AVAILABLE: 'Available',
  
  // System
  ACTIONS: 'Actions',
  UPLOADED_BY: 'Uploaded By',
  CREATED_BY: 'Created By',
  MODIFIED_BY: 'Modified By',
};

/**
 * Standard Column Alignment
 */
export const COLUMN_ALIGN = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
};

/**
 * Default Column Configuration
 * All columns should be center-aligned by default per new requirements
 */
export const DEFAULT_COLUMN_CONFIG = {
  align: COLUMN_ALIGN.CENTER,
  ellipsis: true,
  resizable: true, // Enable column resizing
};

/**
 * Common Column Widths
 */
export const COLUMN_WIDTHS = {
  SMALL: 80,        // For icons, badges, short text
  MEDIUM: 120,      // For numbers, dates
  LARGE: 150,       // For names, emails
  XLARGE: 200,      // For addresses, descriptions
  XXLARGE: 300,     // For long text
  ACTIONS: 120,     // For action buttons
};

/**
 * Pre-configured Standard Columns
 * Ready-to-use column configurations with consistent styling
 */
export const STANDARD_COLUMNS = {
  // Document Columns
  DOCUMENT_ID: {
    title: COLUMN_NAMES.DOCUMENT_ID,
    dataIndex: 'documentHash',
    key: 'documentHash',
    width: COLUMN_WIDTHS.MEDIUM,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  DOCUMENT_TYPE: {
    title: COLUMN_NAMES.TYPE,
    dataIndex: 'category',
    key: 'category',
    width: COLUMN_WIDTHS.LARGE,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  UPLOADED_BY: {
    title: COLUMN_NAMES.UPLOADED_BY,
    dataIndex: 'uploadedByName',
    key: 'uploadedByName',
    width: COLUMN_WIDTHS.LARGE,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  UPLOADED_DATE: {
    title: COLUMN_NAMES.UPLOADED_DATE,
    dataIndex: 'uploadedAt',
    key: 'uploadedAt',
    width: COLUMN_WIDTHS.MEDIUM,
    sorter: (a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt),
    defaultSortOrder: 'descend', // Show newest first
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  EXPIRATION_DATE: {
    title: COLUMN_NAMES.EXPIRATION_DATE,
    dataIndex: 'expirationDate',
    key: 'expirationDate',
    width: COLUMN_WIDTHS.MEDIUM,
    sorter: (a, b) => {
      if (!a.expirationDate) return 1;
      if (!b.expirationDate) return -1;
      return new Date(a.expirationDate) - new Date(b.expirationDate);
    },
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  // Property Columns
  PROPERTY_NAME: {
    title: COLUMN_NAMES.PROPERTY_NAME,
    dataIndex: 'propertyName',
    key: 'propertyName',
    width: COLUMN_WIDTHS.LARGE,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  ADDRESS: {
    title: COLUMN_NAMES.ADDRESS,
    dataIndex: 'addressLine1',
    key: 'address',
    width: COLUMN_WIDTHS.XLARGE,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  CITY_STATE: {
    title: COLUMN_NAMES.CITY_STATE,
    key: 'cityState',
    width: COLUMN_WIDTHS.LARGE,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  // Unit Columns
  UNIT_NAME: {
    title: COLUMN_NAMES.UNIT_NAME,
    dataIndex: 'unitName',
    key: 'unitName',
    width: COLUMN_WIDTHS.MEDIUM,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  BEDROOMS: {
    title: COLUMN_NAMES.BEDROOMS,
    dataIndex: 'bedrooms',
    key: 'bedrooms',
    width: COLUMN_WIDTHS.SMALL,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  BATHROOMS: {
    title: COLUMN_NAMES.BATHROOMS,
    dataIndex: 'bathrooms',
    key: 'bathrooms',
    width: COLUMN_WIDTHS.SMALL,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  // Tenant Columns
  TENANT_NAME: {
    title: COLUMN_NAMES.TENANT_NAME,
    key: 'tenantName',
    width: COLUMN_WIDTHS.LARGE,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  EMAIL: {
    title: COLUMN_NAMES.EMAIL,
    dataIndex: 'email',
    key: 'email',
    width: COLUMN_WIDTHS.XLARGE,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  PHONE: {
    title: COLUMN_NAMES.PHONE,
    dataIndex: 'phone',
    key: 'phone',
    width: COLUMN_WIDTHS.LARGE,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  // Financial Columns
  RENT_AMOUNT: {
    title: COLUMN_NAMES.RENT_AMOUNT,
    dataIndex: 'rentAmount',
    key: 'rentAmount',
    width: COLUMN_WIDTHS.MEDIUM,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  MONTHLY_RENT: {
    title: COLUMN_NAMES.MONTHLY_RENT,
    dataIndex: 'rentPrice',
    key: 'rentPrice',
    width: COLUMN_WIDTHS.MEDIUM,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  DUE_AMOUNT: {
    title: COLUMN_NAMES.DUE_AMOUNT,
    dataIndex: 'amount',
    key: 'amount',
    width: COLUMN_WIDTHS.MEDIUM,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  PAID_AMOUNT: {
    title: COLUMN_NAMES.PAID_AMOUNT,
    key: 'paidAmount',
    width: COLUMN_WIDTHS.MEDIUM,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  BALANCE: {
    title: COLUMN_NAMES.BALANCE,
    key: 'balance',
    width: COLUMN_WIDTHS.MEDIUM,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  DEPOSIT: {
    title: COLUMN_NAMES.DEPOSIT,
    dataIndex: 'depositAmount',
    key: 'depositAmount',
    width: COLUMN_WIDTHS.MEDIUM,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  // Date Columns
  DUE_DATE: {
    title: COLUMN_NAMES.DUE_DATE,
    dataIndex: 'dueDate',
    key: 'dueDate',
    width: COLUMN_WIDTHS.MEDIUM,
    sorter: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  PAID_DATE: {
    title: COLUMN_NAMES.PAID_DATE,
    dataIndex: 'paidDate',
    key: 'paidDate',
    width: COLUMN_WIDTHS.MEDIUM,
    sorter: (a, b) => {
      if (!a.paidDate) return 1;
      if (!b.paidDate) return -1;
      return new Date(a.paidDate) - new Date(b.paidDate);
    },
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  START_DATE: {
    title: COLUMN_NAMES.START_DATE,
    dataIndex: 'leaseStart',
    key: 'leaseStart',
    width: COLUMN_WIDTHS.MEDIUM,
    sorter: (a, b) => new Date(a.leaseStart) - new Date(b.leaseStart),
    defaultSortOrder: 'descend', // Show newest first
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  END_DATE: {
    title: COLUMN_NAMES.END_DATE,
    dataIndex: 'leaseEnd',
    key: 'leaseEnd',
    width: COLUMN_WIDTHS.MEDIUM,
    sorter: (a, b) => {
      if (!a.leaseEnd) return 1;
      if (!b.leaseEnd) return -1;
      return new Date(a.leaseEnd) - new Date(b.leaseEnd);
    },
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  CREATED_DATE: {
    title: COLUMN_NAMES.CREATED_DATE,
    dataIndex: 'requestedDate',
    key: 'requestedDate',
    width: COLUMN_WIDTHS.MEDIUM,
    sorter: (a, b) => new Date(a.requestedDate || a.createdAt) - new Date(b.requestedDate || b.createdAt),
    defaultSortOrder: 'descend', // Show newest first
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  // Maintenance Columns
  TICKET_NUMBER: {
    title: COLUMN_NAMES.TICKET_NUMBER,
    dataIndex: 'ticketNumber',
    key: 'ticketNumber',
    width: COLUMN_WIDTHS.MEDIUM,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  PRIORITY: {
    title: COLUMN_NAMES.PRIORITY,
    dataIndex: 'priority',
    key: 'priority',
    width: COLUMN_WIDTHS.MEDIUM,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  CATEGORY: {
    title: COLUMN_NAMES.CATEGORY,
    dataIndex: 'category',
    key: 'category',
    width: COLUMN_WIDTHS.MEDIUM,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  // Receipt Columns
  RECEIPT_NUMBER: {
    title: COLUMN_NAMES.RECEIPT_NUMBER,
    dataIndex: 'receiptNumber',
    key: 'receiptNumber',
    width: COLUMN_WIDTHS.MEDIUM,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  // Common Columns
  STATUS: {
    title: COLUMN_NAMES.STATUS,
    dataIndex: 'status',
    key: 'status',
    width: COLUMN_WIDTHS.MEDIUM,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  TITLE: {
    title: COLUMN_NAMES.TITLE,
    dataIndex: 'title',
    key: 'title',
    width: COLUMN_WIDTHS.XLARGE,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  DESCRIPTION: {
    title: COLUMN_NAMES.DESCRIPTION,
    dataIndex: 'description',
    key: 'description',
    width: COLUMN_WIDTHS.XXLARGE,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  TYPE: {
    title: COLUMN_NAMES.TYPE,
    dataIndex: 'type',
    key: 'type',
    width: COLUMN_WIDTHS.MEDIUM,
    ...DEFAULT_COLUMN_CONFIG,
  },
  
  ACTIONS: {
    title: COLUMN_NAMES.ACTIONS,
    key: 'actions',
    width: COLUMN_WIDTHS.ACTIONS,
    fixed: 'right',
    ...DEFAULT_COLUMN_CONFIG,
  },
};

/**
 * Helper function to create a custom column with standard config
 */
export function createStandardColumn(title, dataIndex, options = {}) {
  return {
    title,
    dataIndex,
    key: dataIndex,
    ...DEFAULT_COLUMN_CONFIG,
    ...options,
  };
}

/**
 * Helper function to override standard column properties
 */
export function customizeColumn(standardColumn, overrides = {}) {
  return {
    ...standardColumn,
    ...overrides,
  };
}

export default STANDARD_COLUMNS;

