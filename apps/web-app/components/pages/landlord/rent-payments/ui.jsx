"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Typography, Table, Tag, Space, Card, Row, Col, Statistic,
  Modal, Form, Input, Select, DatePicker, InputNumber,  Popconfirm, Spin, Empty, Tooltip, App, Divider, Checkbox, Dropdown
} from 'antd';
import { IconButton, ActionButton } from '@/components/shared/buttons';

// Reusable Components
import dynamic from 'next/dynamic';

// Dynamically import PDF viewer to avoid SSR issues with pdf.js
const PDFViewerModal = dynamic(
  () => import('@/components/shared/PDFViewerModal'),
  { ssr: false }
);
import {
  renderDate,
  renderBalance,
  renderProperty,
  renderTenant,
  renderReceiptNumber,
} from '@/components/shared/TableRenderers';
import PaymentStatusTag from '@/components/shared/PaymentStatusTag';
import { 
  PlusOutlined, DollarOutlined, EyeOutlined, SendOutlined, CheckCircleOutlined,
  WarningOutlined, CloseCircleOutlined, SaveOutlined, CloseOutlined, DeleteOutlined, DownloadOutlined, EditOutlined,
  FilterOutlined, SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { formatDateDisplay, formatDateShort, formatDateMonthYear } from '@/lib/utils/safe-date-formatter';

// Extend dayjs with UTC plugin
dayjs.extend(utc);

// Custom Hooks
import { usePinakaCRUD } from '@/lib/hooks/usePinakaCRUD';
import { useFormButtons } from '@/lib/hooks/useFormButtons';
import { useRentReceipts, useResizableTable, withSorter, sortFunctions, useSearch, configureTableColumns, useModalState } from '@/lib/hooks';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useLoading } from '@/lib/hooks/useLoading';
import { rules } from '@/lib/utils/validation-rules';
import { notify } from '@/lib/utils/notification-helper';

// Shared Utilities
import {
  calculateBalance,
  getPaymentStatusColor,
  getPaymentStatusIcon,
} from '@/lib/utils/rent-display-helpers';

// Constants
import { 
  PAYMENT_STATUSES, 
  PAYMENT_STATUS_FILTERS, 
  PAYMENT_METHODS 
} from '@/lib/constants/statuses';

// Rules Engine Components
import CurrencyInput from '@/components/rules/CurrencyInput';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';
import { STANDARD_COLUMNS, COLUMN_NAMES, customizeColumn } from '@/lib/constants/standard-columns';

const { Title, Text } = Typography;

// Helper function to generate 8-character alphanumeric reference number
function generateReferenceNumber() {
  const now = new Date();
  const timestamp = now.getTime().toString(36); // Base36 encoding of timestamp
  const random = Math.random().toString(36).substring(2, 5); // 3 random chars
  return (timestamp + random).substring(0, 8).toUpperCase();
}

function RentPaymentsClient({ leases, landlordCountry }) {
  const { fetch } = useUnifiedApi({ showUserMessage: true });
  const [form] = Form.useForm();
  const { markingUnpaid, withLoading: withMarkingUnpaid } = useLoading();
  const [payments, setPayments] = useState([]);
  
  // Ensure payments is always an array - defensive wrapper
  const safeSetPayments = useCallback((value) => {
    const arrayValue = Array.isArray(value) ? value : [];
    setPayments(arrayValue);
  }, []);
  const { loading, withLoading: withLoadingPayments } = useLoading(true);
  const { isOpen: isRecordModalOpen, open: openRecordModal, close: closeRecordModal, editingItem: selectedPayment, setEditingItem: setSelectedPayment, openForEdit: openRecordModalForEdit } = useModalState();
  const [partialPayments, setPartialPayments] = useState([]); // Track partial payments for current modal
  const [statusFilter, setStatusFilter] = useState("All");
  
  const { loading: partialPaymentLoading, withLoading: withPartialPaymentLoading } = useLoading();
  const [editingPartialId, setEditingPartialId] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  const [searchExpanded, setSearchExpanded] = useState(false);
  
  // Use shared receipt viewing hook
  const {
    isModalOpen,
    pdfUrl,
    pdfLoading,
    handleViewReceipt,
    handleDownloadReceipt,
    handleCloseModal,
  } = useRentReceipts();

  // 🔍 Search functionality
  // Ensure payments is an array before passing to useSearch
  const paymentsForSearch = Array.isArray(payments) ? payments : [];
  const search = useSearch(
    paymentsForSearch,
    ['dueDate', 'paidDate', 'amount', 'status', 'receiptNumber', 'lease.unit.unitName', 'lease.unit.property.propertyName', 'lease.unit.property.addressLine1', 'lease.leaseTenants.tenant.firstName', 'lease.leaseTenants.tenant.lastName'],
    { debounceMs: 300 }
  );

  const { renderFormButtons } = useFormButtons({
    onCancel: () => {
      closeRecordModal();
      setPartialPayments([]);
      form.resetFields();
    },
    isEditing: false,
    loading: partialPaymentLoading,
    entityName: 'Payment'
  });

  // Memoize fetchPayments to prevent unnecessary re-renders (v1 API)
  const fetchPayments = useCallback(async () => {
    try {
      await withLoadingPayments(async () => {
        // Use v1Api client
        const { v1Api } = await import('@/lib/api/v1-client');
        const response = await v1Api.rentPayments.list({ page: 1, limit: 1000 });
        // v1 API returns { success: true, data: { data: [...], pagination: {...} } }
        const paymentsData = response.data?.data || response.data || [];
        safeSetPayments(Array.isArray(paymentsData) ? paymentsData : []);
      });
    } catch (error) {
      console.error('Error fetching rent payments:', error);
      safeSetPayments([]); // Set empty array on error to prevent filter errors
    }
  }, [safeSetPayments, withLoadingPayments]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Safety check: ensure payments is always an array
  useEffect(() => {
    if (!Array.isArray(payments)) {
      console.warn('[RentPayments] payments is not an array, resetting to empty array:', payments);
      safeSetPayments([]);
    }
  }, [payments, safeSetPayments]);

  // Memoize stats calculations to avoid recalculating on every render
  // Ensure payments is always an array to prevent filter errors
  const stats = useMemo(() => {
    // Triple-check: ensure payments is always an array
    // This is the last line of defense before filter operations
    let paymentsArray = [];
    
    try {
      // Multiple checks to ensure we have an array
      if (payments && Array.isArray(payments)) {
        paymentsArray = payments;
      } else if (payments && typeof payments === 'object' && payments.data && Array.isArray(payments.data)) {
        paymentsArray = payments.data;
      } else {
        paymentsArray = [];
      }
    } catch (e) {
      // If anything goes wrong, use empty array
      paymentsArray = [];
    }
    
    // If still not an array after all checks, force it
    if (!Array.isArray(paymentsArray)) {
      console.warn('[RentPayments] paymentsArray is not an array after checks, forcing to empty array:', paymentsArray);
      paymentsArray = [];
    }
    
    if (paymentsArray.length === 0) {
      return {
        total: 0,
        unpaid: 0,
        overdue: 0,
        paid: 0,
      };
    }
    
    try {
      return {
        total: paymentsArray.filter(p => p && p.status === 'Paid').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        unpaid: paymentsArray.filter(p => p && (p.status === 'Unpaid' || p.status === 'Overdue')).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        overdue: paymentsArray.filter(p => p && p.status === 'Overdue').length,
        paid: paymentsArray.filter(p => p && p.status === 'Paid').length,
      };
    } catch (error) {
      console.error('[RentPayments] Error calculating stats:', error, 'paymentsArray:', paymentsArray);
      return {
        total: 0,
        unpaid: 0,
        overdue: 0,
        paid: 0,
      };
    }
  }, [payments]);

  // Memoize filtered payments to avoid recalculating on every render
  // CRITICAL FIX: "Unpaid" filter should include BOTH "Unpaid" AND "Overdue" payments
  // Apply search filter first, then status filter
  const searchFiltered = search.filteredData;
  const filteredPayments = useMemo(() => {
    // Ensure searchFiltered is an array
    const searchArray = Array.isArray(searchFiltered) ? searchFiltered : [];
    
    if (statusFilter === "All") {
      return searchArray;
    } else if (statusFilter === "Unpaid") {
      return searchArray.filter(p => p.status === 'Unpaid' || p.status === 'Overdue');
    } else {
      return searchArray.filter(p => p.status === statusFilter);
    }
  }, [searchFiltered, statusFilter]);

  async function handleRecordPayment(values) {
    setPartialPaymentLoading(true);
    try {
      const totalPaid = partialPayments.reduce((sum, pp) => sum + parseFloat(pp.amount), 0);
      const newPaymentAmount = parseFloat(values.amount);
      const totalAfterThisPayment = totalPaid + newPaymentAmount;
      const rentAmount = parseFloat(selectedPayment.amount);
      
      // Validate that total doesn't exceed rent amount
      if (totalAfterThisPayment > rentAmount) {
        notify.error(`Total payment (${landlordCountry === 'CA' ? '$' : '$'}${totalAfterThisPayment.toFixed(2)}) cannot exceed rent amount (${landlordCountry === 'CA' ? '$' : '$'}${rentAmount.toFixed(2)})`);
        return;
      }
      
      // Generate reference number
      const referenceNumber = generateReferenceNumber();
      
      // Create partial payment (v1 API)
      const response = await fetch(
        `/api/v1/rent-payments/${selectedPayment.id}/partial`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: newPaymentAmount,
            paidDate: values.paidDate.format('YYYY-MM-DD'),
            paymentMethod: values.paymentMethod,
            referenceNumber: referenceNumber,
            notes: values.notes || null,
            sendReceipt: false, // Receipt removed from UI
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to record payment');
      }
      const result = await response.json();
      const newPartialPayment = result.partialPayment;
      
      // Update local state
      setPartialPayments([...partialPayments, newPartialPayment]);
      
      // Refresh payments list
      await fetchPayments();
      
      // Check if full payment is complete
      if (totalAfterThisPayment >= rentAmount) {
        // Show success message with receipt information
        if (result.autoSentReceipt) {
          notify.success('🎉 Full payment recorded and receipt automatically sent to tenant!');
        } else if (result.receiptInfo?.error) {
          notify.warning(`Payment recorded successfully, but receipt failed to send: ${result.receiptInfo.error}`);
        } else {
          notify.success('Full payment recorded successfully!');
        }
        closeRecordModal();
        setPartialPayments([]);
        form.resetFields();
      } else {
        notify.success(`Partial payment recorded. Remaining: ${landlordCountry === 'CA' ? '$' : '$'}${(rentAmount - totalAfterThisPayment).toFixed(2)}`);
        // Reset form for next partial payment
        form.resetFields();
        form.setFieldsValue({
          amount: (rentAmount - totalAfterThisPayment).toFixed(2),
          paymentMethod: 'Cash',
          paidDate: dayjs(),
        });
      }
    } catch (error) {
      notify.error(error.message);
    }
  }

  async function handleSendReceipt(payment) {
    try {
      notify.loading('Generating receipt PDF...');
      
      // Use v1 API endpoint
      const response = await fetch(`/api/v1/rent-payments/${payment.id}/send-receipt`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to send receipt');
      }
      
      notify.success('Receipt generated and sent to tenant!');
      // Refresh payments to update UI (receipt buttons will change)
      await fetchPayments();
    } catch (error) {
      notify.error(error.message);
    }
  }

  // Handle editing partial payment
  // Start inline editing
  function handleEditPartialPayment(partialPayment) {
    setEditingPartialId(partialPayment.id);
    // Extract local date components to avoid UTC timezone shift when loading
    const paidDateObj = new Date(partialPayment.paidDate);
    const year = paidDateObj.getFullYear();
    const month = paidDateObj.getMonth() + 1;
    const day = paidDateObj.getDate();
    setEditingValues({
      paidDate: dayjs(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`),
      amount: partialPayment.amount,
      paymentMethod: partialPayment.paymentMethod,
      notes: partialPayment.notes || '',
    });
  }

  // Cancel inline editing
  function handleCancelEdit() {
    setEditingPartialId(null);
    setEditingValues({});
  }

  // Save inline edited partial payment (v1 API)
  async function handleSaveInlineEdit(partialPaymentId) {
    try {
      const response = await fetch(
        `/api/v1/rent-payments/${selectedPayment.id}/partial-payment/${partialPaymentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: editingValues.amount,
            // Format as YYYY-MM-DD to preserve local date (avoid UTC conversion)
            paidDate: dayjs.isDayjs(editingValues.paidDate) ? editingValues.paidDate.format('YYYY-MM-DD') : editingValues.paidDate,
            paymentMethod: editingValues.paymentMethod,
            notes: editingValues.notes || '',
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to update payment');
      }
      const result = await response.json();

      // Update local state
      setPartialPayments(result.payment.partialPayments);
      setSelectedPayment(result.payment);

      notify.success('Payment updated successfully');
      setEditingPartialId(null);
      setEditingValues({});

      // Refresh main payment list
      await fetchPayments();
    } catch (error) {
      notify.error(error.message);
    }
  }

  // Handle deleting partial payment (v1 API)
  async function handleDeletePartialPayment(partialPayment) {
    try {
      const response = await fetch(
        `/api/v1/rent-payments/${selectedPayment.id}/partial-payment/${partialPayment.id}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to delete payment');
      }
      const result = await response.json();

      // Update local state
      setPartialPayments(result.payment.partialPayments);
      setSelectedPayment(result.payment);

      notify.success('Partial payment deleted successfully');

      // If no more partial payments, close modal
      if (result.payment.partialPayments.length === 0 && result.payment.status !== 'Paid') {
        closeRecordModal();
        setPartialPayments([]);
        form.resetFields();
      }

      // Refresh main payment list
      await fetchPayments();
    } catch (error) {
      notify.error(error.message);
    }
  }

  const columns = [
    customizeColumn(STANDARD_COLUMNS.RECEIPT_NUMBER, {
      render: (num) => renderReceiptNumber(num),
    }),
    withSorter(
      customizeColumn(STANDARD_COLUMNS.TENANT_NAME, {
        key: 'tenant',
        render: (_, payment) => renderTenant(payment.lease),
      }),
      // Custom sorter for nested tenant name
      (a, b) => {
        const tenantA = a.lease?.leaseTenants?.[0]?.tenant;
        const tenantB = b.lease?.leaseTenants?.[0]?.tenant;
        
        if (!tenantA) return 1;
        if (!tenantB) return -1;
        
        const nameA = `${tenantA.firstName || ''} ${tenantA.lastName || ''}`.trim().toLowerCase();
        const nameB = `${tenantB.firstName || ''} ${tenantB.lastName || ''}`.trim().toLowerCase();
        
        return nameA.localeCompare(nameB);
      }
    ),
    withSorter(
      customizeColumn(STANDARD_COLUMNS.PROPERTY_NAME, {
        key: 'property',
        render: (_, payment) => renderProperty(payment.lease),
      }),
      // Custom sorter for nested property name
      (a, b) => {
        const propertyA = a.lease?.unit?.property;
        const propertyB = b.lease?.unit?.property;
        
        if (!propertyA) return 1;
        if (!propertyB) return -1;
        
        const nameA = (propertyA.propertyName || propertyA.addressLine1 || '').toLowerCase();
        const nameB = (propertyB.propertyName || propertyB.addressLine1 || '').toLowerCase();
        
        return nameA.localeCompare(nameB);
      }
    ),
    withSorter(
      customizeColumn(STANDARD_COLUMNS.MONTHLY_RENT, {
        dataIndex: 'amount',
        render: (amount) => (
          <CurrencyDisplay 
            value={amount} 
            country={landlordCountry}
            strong 
          />
        ),
      }),
      sortFunctions.number('amount')
    ),
    withSorter(
      customizeColumn(STANDARD_COLUMNS.DUE_DATE, {
        render: (date) => renderDate(date),
      }),
      sortFunctions.date('dueDate')
    ),
    customizeColumn(STANDARD_COLUMNS.DUE_AMOUNT, {
      render: (_, payment) => {
        // For paid payments, show $0.00
        if (payment.status === 'Paid') {
          return renderBalance(0);
        }
        
        // For unpaid/overdue/partial, show remaining balance
        const totalPaid = (payment.partialPayments || []).reduce(
          (sum, pp) => sum + parseFloat(pp.amount || 0),
          0
        );
        const remaining = parseFloat(payment.amount || 0) - totalPaid;
        return renderBalance(remaining);
      },
    }),
    customizeColumn(STANDARD_COLUMNS.PAID_DATE, {
      render: (date, payment) => {
        // CRITICAL FIX: Only show paid date when payment is FULLY paid
        // Partial payments should NOT show a paid date
        if (payment.status !== 'Paid') {
          return <Text type="secondary">—</Text>;
        }
        return renderDate(date);
      },
    }),
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      render: (status, payment) => <PaymentStatusTag payment={payment} stripePayment={payment.stripePayment} />,
    }),
    customizeColumn(STANDARD_COLUMNS.ACTIONS, {
      render: (_, payment) => {
        return (
          <Space size="small">
            {/* Mark as Unpaid button for disputed payments */}
            {payment.stripePayment?.disputeStatus === 'chargeback_pending' && payment.status !== 'Unpaid' && (
              <Tooltip title="Mark Rent as Unpaid (due to chargeback)">
                <Button
                  danger
                  size="small"
                  icon={<WarningOutlined />}
                  loading={markingUnpaid}
                  onClick={async () => {
                    setMarkingUnpaid(true);
                    try {
                      const response = await fetch(`/api/v1/rent-payments/${payment.id}/mark-unpaid`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      });
                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || errorData.message || 'Failed to mark payment as unpaid');
                      }
                      notify.success('Rent payment marked as unpaid');
                      await fetchPayments();
                    } catch (error) {
                      // Error already handled
                    } finally {
                      setMarkingUnpaid(false);
                    }
                  }}
                >
                  Mark Unpaid
                </Button>
              </Tooltip>
            )}
              
              {payment.status !== 'Paid' && (
                <Tooltip title="Record Payment">
                  <IconButton
                    icon={<DollarOutlined />}
                    onClick={() => {
                      setSelectedPayment(payment);
                      // Set existing partial payments
                      setPartialPayments(payment.partialPayments || []);
                      const totalPaid = (payment.partialPayments || []).reduce((sum, pp) => sum + parseFloat(pp.amount), 0);
                      const remaining = parseFloat(payment.amount) - totalPaid;
                      form.setFieldsValue({
                        amount: remaining > 0 ? remaining.toFixed(2) : payment.amount,
                        paymentMethod: 'Cash',
                        paidDate: dayjs(),
                      });
                      openRecordModalForEdit(payment);
                    }}
                    tooltip="Record Payment"
                    size="small"
                  />
                </Tooltip>
              )}
              {payment.status === 'Paid' && (
                <Tooltip title={payment.receiptSent ? "Send Receipt Again" : "Generate & Send Receipt"}>
                  <IconButton 
                    icon={<SendOutlined />} 
                    onClick={() => handleSendReceipt(payment)}
                    tooltip={payment.receiptSent ? "Send Receipt Again" : "Generate & Send Receipt"}
                    size="small"
                  />
                </Tooltip>
              )}
              {payment.receiptNumber && payment.receiptSent && (
                <>
                  <IconButton icon={<EyeOutlined />} onClick={() => handleViewReceipt(payment)} tooltip="View Receipt" size="small" />
                  <IconButton icon={<DownloadOutlined />} onClick={() => handleDownloadReceipt(payment)} tooltip="Download Receipt" size="small" />
                </>
              )}
            </Space>
        );
      },
    }),
  ];

  // Configure columns with standard settings (center alignment, ensure all are sortable)
  const configuredColumns = configureTableColumns(columns, {
    addSorting: false, // Keep existing sorters
    centerAlign: true, // Center align all columns
    addWidths: false, // Keep existing widths
  });

  // Use resizable table hook with column width persistence
  const { tableProps } = useResizableTable(configuredColumns, {
    defaultSort: { field: 'dueDate', order: 'ascend' }, // Ascending - show upcoming payments first
    storageKey: 'landlord-rent-payments-table',
  });

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* 3-Section Banner Header */}
      <Card 
        style={{ 
          marginBottom: 24,
          borderRadius: 8,
          background: '#ffffff',
          border: '1px solid #e8e8e8',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'auto auto 1fr auto auto',
          gap: '24px',
          alignItems: 'center'
        }}>
          {/* SECTION 1: Title (Left) */}
          <div>
            <Title level={2} style={{ margin: 0, color: '#1f1f1f' }}>Rent Payments</Title>
          </div>
          
          {/* DIVIDER 1 */}
          <div style={{ 
            width: '1px', 
            height: '40px', 
            background: '#e8e8e8',
            alignSelf: 'center'
          }} />
          
          {/* SECTION 2: Stats (Middle) */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 24,
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            {payments.length > 0 && (
              <>
                <Text style={{ fontSize: 16, color: '#595959', whiteSpace: 'nowrap' }}>
                  Overdue: <Text strong style={{ fontSize: 18, color: '#f5222d' }}>{stats.overdue}</Text>
                </Text>
                <Text style={{ fontSize: 16, color: '#595959', whiteSpace: 'nowrap' }}>
                  Amount Due: <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>
                    <CurrencyDisplay 
                      value={stats.unpaid} 
                      country={landlordCountry}
                      strong 
                    />
                  </Text>
                </Text>
              </>
            )}
          </div>
          
          {/* DIVIDER 2 */}
          <div style={{ 
            width: '1px', 
            height: '40px', 
            background: '#e8e8e8',
            alignSelf: 'center'
          }} />
          
          {/* SECTION 3: Actions (Right) - Order: Search, Filter, Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 'fit-content' }}>
            {/* Search First - Always reserves full width */}
            <div 
              style={{ 
                display: 'inline-flex',
                width: '350px', // Always reserve full width
                justifyContent: 'flex-end'
              }}
            >
              {searchExpanded ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <Input
                    autoFocus
                    size="large"
                    placeholder="Search payments by date, amount, status, tenant, or property..."
                    prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
                    value={search.searchTerm}
                    onChange={(e) => search.setSearchTerm(e.target.value)}
                    allowClear
                    onClear={() => search.clearSearch()}
                    onBlur={(e) => {
                      // Close search if empty and clicking outside
                      if (!search.searchTerm && !e.currentTarget.contains(e.relatedTarget)) {
                        setTimeout(() => setSearchExpanded(false), 150);
                      }
                    }}
                    style={{
                      flex: 1,
                      borderRadius: '8px',
                      border: '2px solid #1890ff',
                    }}
                  />
                  <Tooltip title="Close">
                    <IconButton
                      icon={<CloseOutlined />}
                      onClick={() => {
                        setSearchExpanded(false);
                        search.clearSearch();
                      }}
                      tooltip="Close"
                      style={{ background: '#fff', border: '1px solid #d9d9d9', flexShrink: 0 }}
                    />
                  </Tooltip>
                </div>
              ) : (
                <Tooltip title="Search">
                  <IconButton
                    icon={<SearchOutlined />}
                    onClick={() => setSearchExpanded(true)}
                    tooltip="Search"
                    style={{ background: '#fff', border: '1px solid #d9d9d9' }}
                  />
                </Tooltip>
              )}
            </div>
            
            {/* Filter Dropdown Second */}
            <Dropdown
              menu={{
                items: PAYMENT_STATUS_FILTERS.map(status => ({
                  key: status,
                  label: `${status}${status === statusFilter ? ' ✓' : ''}`,
                  onClick: () => setStatusFilter(status)
                }))
              }}
              trigger={['click']}
            >
              <Tooltip title="Filter by Status">
                <IconButton 
                  icon={<FilterOutlined />}
                  tooltip="Filter by Status"
                  style={{ background: '#fff', border: '1px solid #d9d9d9' }}
                />
              </Tooltip>
            </Dropdown>
            
            {/* Refresh Third */}
            <Tooltip title="Refresh">
              <IconButton 
                icon={<span style={{ fontSize: 16 }}>↻</span>}
                onClick={fetchPayments}
                tooltip="Refresh"
                style={{ background: '#fff', border: '1px solid #d9d9d9' }}
              />
            </Tooltip>
          </div>
        </div>
      </Card>

      {filteredPayments.length === 0 ? (
        <Card>
          <Empty
            image={<DollarOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
            description={
              <div>
                <Title level={5} type="secondary">No payments found</Title>
                <Text type="secondary">
                  {statusFilter === "All" 
                    ? "Rent payments will appear here once leases are created"
                    : `No ${statusFilter.toLowerCase()} payments`}
                </Text>
              </div>
            }
          />
        </Card>
      ) : (
        <Table
          {...tableProps}
          dataSource={filteredPayments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 25,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} payments`,
          }}
          scroll={{ y: 'calc(100vh - 320px)' }}
          sticky
          size="small"
          onRow={(record) => ({
            onDoubleClick: () => {
              // Open record payment modal (works for recording OR viewing)
              setSelectedPayment(record);
              setPartialPayments(record.partialPayments || []);
              const totalPaid = (record.partialPayments || []).reduce((sum, pp) => sum + parseFloat(pp.amount), 0);
              const remaining = parseFloat(record.amount) - totalPaid;
              form.setFieldsValue({
                amount: remaining > 0 ? remaining.toFixed(2) : record.amount,
                paymentMethod: 'Cash',
                paidDate: dayjs(),
              });
              setIsRecordModalOpen(true);
            },
            style: { cursor: 'pointer' }
          })}
        />
      )}

      {/* Record Payment Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '48px' }}>
            <span>Record Payment</span>
            <Tooltip title="Save Payment">
              <IconButton
                icon={<SaveOutlined />}
                onClick={() => form.submit()}
                loading={partialPaymentLoading}
                tooltip="Save Payment"
                size="middle"
              />
            </Tooltip>
          </div>
        }
        open={isRecordModalOpen}
        onCancel={() => {
          closeRecordModal();
          setPartialPayments([]);
          form.resetFields();
        }}
        footer={null}
        width={1100}
        closeIcon={<CloseOutlined style={{ fontSize: '16px' }} />}
      >
        {selectedPayment && (
          <>
            {/* Payment Summary - Single Row with Status and Due Date */}
            <Card size="small" style={{ marginBottom: 12, backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', padding: '6px 10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 0.7fr 0.9fr 0.9fr 0.9fr 1.1fr 1.1fr 0.8fr', gap: 6, alignItems: 'center' }}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #91d5ff', paddingRight: 6 }}>
                  <Text type="secondary" style={{ fontSize: 10, display: 'block', lineHeight: '1.3' }}>Rent for</Text>
                  <Text strong style={{ fontSize: 12 }}>
                    {formatDateMonthYear(selectedPayment.dueDate)}
                  </Text>
                </div>
                
                <div style={{ textAlign: 'center', borderRight: '1px solid #91d5ff', paddingRight: 6 }}>
                  <Text type="secondary" style={{ fontSize: 10, display: 'block', lineHeight: '1.3' }}>Due Date</Text>
                  <Text strong style={{ fontSize: 12 }}>
                    {formatDateShort(selectedPayment.dueDate)}
                  </Text>
                </div>
                
                <div style={{ textAlign: 'center', borderRight: '1px solid #91d5ff', paddingRight: 6 }}>
                  <Text type="secondary" style={{ fontSize: 10, display: 'block', lineHeight: '1.3' }}>Total Rent</Text>
                  <Text strong style={{ fontSize: 12 }}>
                    <CurrencyDisplay value={parseFloat(selectedPayment.amount)} country={landlordCountry} />
                  </Text>
                </div>
                
                <div style={{ textAlign: 'center', borderRight: '1px solid #91d5ff', paddingRight: 6 }}>
                  <Text type="secondary" style={{ fontSize: 10, display: 'block', lineHeight: '1.3' }}>Total Paid</Text>
                  <Text strong style={{ fontSize: 12, color: '#52c41a' }}>
                    <CurrencyDisplay 
                      value={partialPayments.reduce((sum, pp) => sum + parseFloat(pp.amount), 0)} 
                      country={landlordCountry} 
                    />
                  </Text>
                </div>
                
                <div style={{ textAlign: 'center', borderRight: '1px solid #91d5ff', paddingRight: 6 }}>
                  <Text type="secondary" style={{ fontSize: 10, display: 'block', lineHeight: '1.3' }}>Amount Owed</Text>
                  <Text strong style={{ fontSize: 12, color: '#ff4d4f' }}>
                    <CurrencyDisplay 
                      value={parseFloat(selectedPayment.amount) - partialPayments.reduce((sum, pp) => sum + parseFloat(pp.amount), 0)} 
                      country={landlordCountry} 
                    />
                  </Text>
                </div>
                
                <div style={{ textAlign: 'center', borderRight: '1px solid #91d5ff', paddingRight: 6 }}>
                  <Text type="secondary" style={{ fontSize: 10, display: 'block', lineHeight: '1.3' }}>Property</Text>
                  <Tooltip 
                    title={`${selectedPayment.lease?.unit?.property?.addressLine1}${selectedPayment.lease?.unit?.property?.addressLine2 ? ', ' + selectedPayment.lease?.unit?.property?.addressLine2 : ''}, ${selectedPayment.lease?.unit?.property?.city}, ${selectedPayment.lease?.unit?.property?.provinceState} ${selectedPayment.lease?.unit?.property?.postalZip}`}
                  >
                    <Text strong style={{ fontSize: 12, cursor: 'help', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                      {selectedPayment.lease?.unit?.property?.propertyName || '—'}
                    </Text>
                  </Tooltip>
                </div>
                
                <div style={{ textAlign: 'center', borderRight: '1px solid #91d5ff', paddingRight: 6 }}>
                  <Text type="secondary" style={{ fontSize: 10, display: 'block', lineHeight: '1.3' }}>Tenant</Text>
                  <Text strong style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                    {selectedPayment.lease?.leaseTenants?.[0]?.tenant?.firstName} {selectedPayment.lease?.leaseTenants?.[0]?.tenant?.lastName}
                  </Text>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 10, display: 'block', lineHeight: '1.3' }}>Status</Text>
                  <Tag color={getPaymentStatusColor(selectedPayment)} style={{ marginTop: 2, fontSize: 10, padding: '0 6px', lineHeight: '20px' }}>
                    {selectedPayment.status}
                  </Tag>
                </div>
              </div>
            </Card>

            {/* Payment Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleRecordPayment}
            >
              <Row gutter={8}>
                <Col span={5}>
                  <Form.Item
                    name="paymentMethod"
                    label="Payment Method"
                    rules={[rules.required('Payment method')]}
                  >
                    <Select>
                      {PAYMENT_METHODS.map(method => (
                        <Select.Option key={method} value={method}>{method}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="paidDate"
                    label="Date"
                    rules={[rules.required('Date')]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[rules.required('Amount')]}
                  >
                    <CurrencyInput
                      country={landlordCountry}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.amount !== currentValues.amount}
                  >
                    {() => {
                      const amountValue = form.getFieldValue('amount');
                      let paymentType = 'Partial Payment';
                      let paymentColor = '#faad14';
                      
                      if (amountValue) {
                        const amount = parseFloat(amountValue.toString().replace(/[^0-9.-]+/g, ''));
                        const totalPaid = partialPayments.reduce((sum, pp) => sum + parseFloat(pp.amount), 0);
                        const totalRent = parseFloat(selectedPayment.amount);
                        const willBeFull = (totalPaid + amount) >= totalRent;
                        
                        if (willBeFull) {
                          paymentType = 'Full Payment';
                          paymentColor = '#52c41a';
                        }
                      }
                      
                      return (
                        <Form.Item label="Type">
                          <Select
                            value={paymentType}
                            disabled
                            suffixIcon={null}
                          >
                            <Select.Option value="Full Payment">
                              <span style={{ color: '#52c41a', fontWeight: 'bold' }}>Full Payment</span>
                            </Select.Option>
                            <Select.Option value="Partial Payment">
                              <span style={{ color: '#faad14', fontWeight: 'bold' }}>Partial Payment</span>
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      );
                    }}
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item name="notes" label="Notes (Optional)">
                    <Input.TextArea rows={1} placeholder="Optional notes..." />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            {/* Payment History Grid */}
            {partialPayments.length > 0 && (
              <>
                <Divider style={{ margin: '16px 0 12px 0' }}>Payment History</Divider>
                <Table
                  dataSource={partialPayments}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  style={{ marginTop: 16 }}
                  columns={[
                    {
                      title: 'Reference #',
                      dataIndex: 'referenceNumber',
                      key: 'referenceNumber',
                      align: 'center',
                      width: 120,
                      render: (ref) => <Text code>{ref}</Text>,
                    },
                    {
                      title: 'Date',
                      dataIndex: 'paidDate',
                      key: 'paidDate',
                      align: 'center',
                      width: 140,
                      render: (date, record) => {
                        if (editingPartialId === record.id) {
                          return (
                            <DatePicker
                              value={editingValues.paidDate}
                              onChange={(date) => setEditingValues({...editingValues, paidDate: date})}
                              style={{ width: '100%' }}
                              size="small"
                            />
                          );
                        }
                        return <Text>{formatDateDisplay(date)}</Text>;
                      },
                    },
                    {
                      title: 'Amount',
                      dataIndex: 'amount',
                      key: 'amount',
                      align: 'center',
                      width: 130,
                      render: (amount, record) => {
                        if (editingPartialId === record.id) {
                          return (
                            <CurrencyInput
                              value={editingValues.amount}
                              onChange={(value) => setEditingValues({...editingValues, amount: value})}
                              country={landlordCountry}
                              style={{ width: '100%' }}
                              size="small"
                            />
                          );
                        }
                        return <CurrencyDisplay value={amount} country={landlordCountry} strong />;
                      },
                    },
                    {
                      title: 'Method',
                      dataIndex: 'paymentMethod',
                      key: 'paymentMethod',
                      align: 'center',
                      width: 130,
                      render: (method, record) => {
                        if (editingPartialId === record.id) {
                          return (
                            <Select
                              value={editingValues.paymentMethod}
                              onChange={(value) => setEditingValues({...editingValues, paymentMethod: value})}
                              style={{ width: '100%' }}
                              size="small"
                            >
                              {PAYMENT_METHODS.map(m => (
                                <Select.Option key={m} value={m}>{m}</Select.Option>
                              ))}
                            </Select>
                          );
                        }
                        return <Text>{method}</Text>;
                      },
                    },
                    {
                      title: 'Notes',
                      dataIndex: 'notes',
                      key: 'notes',
                      align: 'center',
                      render: (notes, record) => {
                        if (editingPartialId === record.id) {
                          return (
                            <Input
                              value={editingValues.notes}
                              onChange={(e) => setEditingValues({...editingValues, notes: e.target.value})}
                              placeholder="Optional notes..."
                              size="small"
                            />
                          );
                        }
                        return notes || <Text type="secondary">—</Text>;
                      },
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      align: 'center',
                      width: 100,
                      render: (_, partialPayment) => {
                        if (editingPartialId === partialPayment.id) {
                          return (
                            <Space size="small">
                              <Tooltip title="Save">
                                <IconButton
                                  size="small"
                                  icon={<SaveOutlined />}
                                  onClick={() => handleSaveInlineEdit(partialPayment.id)}
                                  tooltip="Save"
                                />
                              </Tooltip>
                              <Tooltip title="Cancel">
                                <IconButton
                                  size="small"
                                  icon={<CloseOutlined />}
                                  onClick={handleCancelEdit}
                                  tooltip="Cancel"
                                />
                              </Tooltip>
                            </Space>
                          );
                        }
                        return (
                          <Space size="small">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => handleEditPartialPayment(partialPayment)}
                                tooltip="Edit"
                              />
                            </Tooltip>
                            <Popconfirm
                              title="Delete Payment?"
                              description="This will recalculate the payment status."
                              onConfirm={() => handleDeletePartialPayment(partialPayment)}
                              okText="Delete"
                              cancelText="Cancel"
                              okButtonProps={{ danger: true }}
                            >
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  tooltip="Delete"
                                />
                              </Tooltip>
                            </Popconfirm>
                          </Space>
                        );
                      },
                    },
                  ]}
                />
              </>
            )}
          </>
        )}
      </Modal>

      {/* View Receipt Modal */}
      <PDFViewerModal
        open={isModalOpen}
        title="Rent Receipt"
        pdfUrl={pdfUrl}
        loading={pdfLoading}
        onClose={handleCloseModal}
        width={800}
        height={600}
      />

    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(RentPaymentsClient, (prevProps, nextProps) => {
  // Custom comparison: only re-render if leases array reference changes
  return prevProps.leases === nextProps.leases;
});

