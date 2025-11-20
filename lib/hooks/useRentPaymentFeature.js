"use client";

/**
 * useRentPaymentFeature - Composite Hook
 * 
 * Complete rent payment feature combining:
 * - useRentPayments (data + stats)
 * - useRentReceipts (receipt viewing)
 * - useDateUtils (date formatting)
 * - useResizableTable (table configuration)
 * - Payment metrics
 * - Column definitions
 * 
 * Benefits:
 * - Single import for complete feature
 * - Pre-calculated metrics
 * - Consistent table configuration
 * - Reusable across landlord/tenant
 * 
 * @param {Array} initialData - Initial payment data
 * @param {Object} options - Configuration
 * @param {string} options.userRole - 'landlord' or 'tenant'
 * @param {string} options.apiEndpoint - API endpoint for data fetching
 * @param {string} options.apiPath - API path for receipt operations
 * @returns {Object} Complete rent payment feature
 * 
 * @example
 * // Landlord
 * const rentPayments = useRentPaymentFeature(initialData, {
 *   userRole: 'landlord',
 *   apiEndpoint: '/api/rent-payments',
 *   apiPath: '/api/rent-payments'
 * });
 * 
 * // Tenant
 * const rentPayments = useRentPaymentFeature(initialData, {
 *   userRole: 'tenant',
 *   apiEndpoint: '/api/tenant-rent-receipts',
 *   apiPath: '/api/tenant-rent-receipts'
 * });
 */

import { useMemo, useCallback, useState } from 'react';
import { Button, Space, Tag, Tooltip } from 'antd';
import { 
  EyeOutlined,
  EditOutlined,
  SendOutlined,
  DownloadOutlined 
} from '@ant-design/icons';
import TableActionButton from '@/components/shared/TableActionButton';

import { useRentPayments } from './useRentPayments';
import { useRentReceipts } from './useRentReceipts';
import { useDateUtils } from './useDateUtils';
import { useResizableTable, withSorter } from './useResizableTable';

export function useRentPaymentFeature(initialData, options = {}) {
  const {
    userRole = 'tenant',
    apiEndpoint,
    apiPath = '/api/v1/rent-payments',
    autoRefresh = false,
    refreshInterval = 60000,
  } = options;

  // Compose base hooks
  const payments = useRentPayments(initialData, {
    userRole,
    apiEndpoint,
    autoRefresh,
    refreshInterval,
  });

  const receipts = useRentReceipts();
  const { formatDateDisplay, getTodayUTC, isDateAfter } = useDateUtils();
  
  // Additional state for payment recording
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Calculate enhanced metrics
  const metrics = useMemo(() => {
    const data = payments.data || [];
    const today = getTodayUTC();
    
    // Base stats (from useRentPayments hook)
    const baseStats = payments.stats;
    
    // Enhanced calculations
    const overdue = data.filter(p => 
      p.balance > 0 && isDateAfter(today, new Date(p.dueDate))
    );
    
    const unpaid = data.filter(p => 
      p.status === 'Unpaid' && p.balance === p.amount
    );
    
    const partial = data.filter(p => 
      p.status === 'Partial' || (p.balance > 0 && p.balance < p.amount)
    );
    
    const paid = data.filter(p => 
      p.status === 'Paid' || p.balance === 0
    );

    return {
      // Counts
      totalCount: data.length,
      overdueCount: overdue.length,
      unpaidCount: unpaid.length,
      partialCount: partial.length,
      paidCount: paid.length,
      
      // Amounts
      totalAmount: data.reduce((sum, p) => sum + p.amount, 0),
      overdueAmount: overdue.reduce((sum, p) => sum + p.balance, 0),
      unpaidAmount: unpaid.reduce((sum, p) => sum + p.balance, 0),
      partialAmount: partial.reduce((sum, p) => sum + p.balance, 0),
      paidAmount: paid.reduce((sum, p) => sum + (p.amount - p.balance), 0),
      
      // From base stats (for currency breakdowns if landlord)
      ...(baseStats || {}),
    };
  }, [payments.data, payments.stats, getTodayUTC, isDateAfter]);

  // Get property address (short version)
  const getPropertyAddress = useCallback((payment) => {
    const property = payment.lease?.unit?.property;
    if (!property) return 'N/A';
    
    const unit = payment.lease?.unit?.unitNumber;
    const address = `${property.address}`;
    
    return unit ? `${address}, Unit ${unit}` : address;
  }, []);

  // Get tenant name
  const getTenantName = useCallback((payment) => {
    return payment.lease?.tenant?.name || 'N/A';
  }, []);

  // Get status tag with color
  const getStatusTag = useCallback((payment) => {
    const today = getTodayUTC();
    const dueDate = new Date(payment.dueDate);
    
    if (payment.status === 'Paid' || payment.balance === 0) {
      return <Tag color="green">Paid</Tag>;
    }
    
    if (isDateAfter(today, dueDate) && payment.balance > 0) {
      return <Tag color="red">Overdue</Tag>;
    }
    
    if (payment.status === 'Partial' || (payment.balance > 0 && payment.balance < payment.amount)) {
      return <Tag color="blue">Partial</Tag>;
    }
    
    return <Tag color="orange">Unpaid</Tag>;
  }, [getTodayUTC, isDateAfter]);

  // Define table columns
  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: 'Receipt #',
        dataIndex: 'receiptNumber',
        key: 'receiptNumber',
        width: 150,
        fixed: 'left',
        ...withSorter('receiptNumber'),
      },
    ];

    // Add property column for landlord
    if (userRole === 'landlord') {
      baseColumns.push({
        title: 'Property',
        key: 'property',
        width: 200,
        render: (_, record) => (
          <Tooltip title={getPropertyAddress(record)}>
            <span style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              display: 'block'
            }}>
              {getPropertyAddress(record)}
            </span>
          </Tooltip>
        ),
        sorter: (a, b) => {
          const addrA = getPropertyAddress(a);
          const addrB = getPropertyAddress(b);
          return addrA.localeCompare(addrB);
        },
      });
      
      baseColumns.push({
        title: 'Tenant',
        key: 'tenant',
        width: 150,
        render: (_, record) => getTenantName(record),
        sorter: (a, b) => {
          const nameA = getTenantName(a);
          const nameB = getTenantName(b);
          return nameA.localeCompare(nameB);
        },
      });
    }

    // Common columns
    baseColumns.push(
      {
        title: 'Due Date',
        dataIndex: 'dueDate',
        key: 'dueDate',
        width: 120,
        align: 'center',
        render: (date) => formatDateDisplay(date),
        ...withSorter('dueDate'),
        defaultSortOrder: 'descend',
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        width: 120,
        align: 'right',
        render: (amount) => `$${amount.toFixed(2)}`,
        ...withSorter('amount'),
      },
      {
        title: 'Paid',
        key: 'amountPaid',
        width: 120,
        align: 'right',
        render: (_, record) => {
          const paid = record.amount - record.balance;
          return `$${paid.toFixed(2)}`;
        },
        sorter: (a, b) => {
          const paidA = a.amount - a.balance;
          const paidB = b.amount - b.balance;
          return paidA - paidB;
        },
      },
      {
        title: 'Balance',
        dataIndex: 'balance',
        key: 'balance',
        width: 120,
        align: 'right',
        render: (balance) => `$${balance.toFixed(2)}`,
        ...withSorter('balance'),
      },
      {
        title: 'Status',
        key: 'status',
        width: 120,
        align: 'center',
        render: (_, record) => getStatusTag(record),
        sorter: (a, b) => {
          const getStatusValue = (payment) => {
            if (payment.status === 'Paid' || payment.balance === 0) return 0;
            const today = getTodayUTC();
            const dueDate = new Date(payment.dueDate);
            if (isDateAfter(today, dueDate) && payment.balance > 0) return 1;
            if (payment.status === 'Partial' || (payment.balance > 0 && payment.balance < payment.amount)) return 2;
            return 3;
          };
          return getStatusValue(a) - getStatusValue(b);
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        width: userRole === 'landlord' ? 200 : 150,
        fixed: 'right',
        align: 'center',
        render: (_, record) => (
            <Space size="small">
              <TableActionButton
                icon={<EyeOutlined />}
                onClick={() => receipts.handleViewReceipt(record, apiPath)}
                tooltip="View Receipt"
                actionType="view"
              />
              
              {userRole === 'landlord' && (
                <>
                  <TableActionButton
                    icon={<EditOutlined />}
                    onClick={() => {
                      setSelectedPayment(record);
                      setEditMode(record.balance === 0);
                      setRecordModalOpen(true);
                    }}
                    tooltip={record.balance > 0 ? "Record Payment" : "View Details"}
                    actionType="edit"
                  />
                  
                  {record.balance === 0 && (
                    <TableActionButton
                      icon={<SendOutlined />}
                      onClick={() => {
                        // This will be handled by the page component
                      }}
                      tooltip="Send Receipt"
                      actionType="send"
                    />
                  )}
                </>
              )}
              
              <TableActionButton
                icon={<DownloadOutlined />}
                onClick={() => receipts.handleDownloadReceipt(record, apiPath)}
                tooltip="Download Receipt"
                actionType="download"
              />
            </Space>
        ),
      }
    );

    return baseColumns;
  }, [userRole, receipts, apiPath, formatDateDisplay, getPropertyAddress, getTenantName, getStatusTag, getTodayUTC, isDateAfter, setSelectedPayment, setEditMode, setRecordModalOpen]);

  // Configure resizable table
  const { tableProps } = useResizableTable(columns, {
    storageKey: `rent-payments-${userRole}`,
    defaultSort: { field: 'dueDate', order: 'descend' },
  });

  // Open record payment modal
  const openRecordModal = useCallback((payment) => {
    setSelectedPayment(payment);
    setEditMode(false);
    setRecordModalOpen(true);
  }, []);

  // Close record payment modal
  const closeRecordModal = useCallback(() => {
    setSelectedPayment(null);
    setEditMode(false);
    setRecordModalOpen(false);
  }, []);

  return {
    // Payment data and state
    payments: payments.data,
    loading: payments.loading,
    setData: payments.setData,
    setLoading: payments.setLoading,
    
    // Metrics (pre-calculated)
    metrics,
    
    // Table configuration
    columns,
    tableProps,
    
    // Receipt viewing
    isReceiptModalOpen: receipts.isModalOpen,
    selectedReceipt: receipts.selectedReceipt,
    pdfUrl: receipts.pdfUrl,
    pdfLoading: receipts.pdfLoading,
    handleViewReceipt: (payment) => receipts.handleViewReceipt(payment, apiPath),
    handleDownloadReceipt: (payment) => receipts.handleDownloadReceipt(payment, apiPath),
    handleCloseReceiptModal: receipts.handleCloseModal,
    
    // Record payment modal
    recordModalOpen,
    selectedPayment,
    editMode,
    openRecordModal,
    closeRecordModal,
    
    // Actions
    fetchData: payments.fetchData,
    refresh: payments.fetchData,
    
    // Helpers
    getPropertyAddress,
    getTenantName,
    getStatusTag,
  };
}

export default useRentPaymentFeature;
