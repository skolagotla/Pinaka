"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
  Card, Button, Modal, Select, TextInput, Label, Textarea, Badge, Tooltip, Spinner, Alert, Table
} from 'flowbite-react';
import { IconButton, ActionButton } from '@/components/shared/buttons';
import {
  HiCurrencyDollar,
  HiEye,
  HiPaperAirplane,
  HiCheckCircle,
  HiExclamation,
  HiXCircle,
  HiSave,
  HiX,
  HiTrash,
  HiDownload,
  HiPencil,
  HiFilter,
  HiSearch,
  HiRefresh
} from 'react-icons/hi';

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
import { useFormState } from '@/lib/hooks/useFormState';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import FlowbitePopconfirm from '@/components/shared/FlowbitePopconfirm';

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

// Helper function to generate 8-character alphanumeric reference number
function generateReferenceNumber() {
  const now = new Date();
  const timestamp = now.getTime().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
  return (timestamp + random).substring(0, 8).toUpperCase();
}

function RentPaymentsClient({ leases, landlordCountry }) {
  const { fetch } = useUnifiedApi({ showUserMessage: true });
  const form = useFormState();
  const { markingUnpaid, withLoading: withMarkingUnpaid, setLoading: setMarkingUnpaid } = useLoading();
  const [payments, setPayments] = useState([]);
  
  // Ensure payments is always an array - defensive wrapper
  const safeSetPayments = useCallback((value) => {
    const arrayValue = Array.isArray(value) ? value : [];
    setPayments(arrayValue);
  }, []);
  const { loading, withLoading: withLoadingPayments } = useLoading(true);
  const { isOpen: isRecordModalOpen, open: openRecordModal, close: closeRecordModal, editingItem: selectedPayment, setEditingItem: setSelectedPayment, openForEdit: openRecordModalForEdit } = useModalState();
  const [partialPayments, setPartialPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  
  const { loading: partialPaymentLoading, withLoading: withPartialPaymentLoading, setLoading: setPartialPaymentLoading } = useLoading();
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
  const paymentsForSearch = Array.isArray(payments) ? payments : [];
  const search = useSearch(
    paymentsForSearch,
    ['dueDate', 'paidDate', 'amount', 'status', 'receiptNumber', 'lease.unit.unitName', 'lease.unit.property.propertyName', 'lease.unit.property.addressLine1', 'lease.leaseTenants.tenant.firstName', 'lease.leaseTenants.tenant.lastName'],
    { debounceMs: 300 }
  );

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoize fetchPayments to prevent unnecessary re-renders (v1 API)
  const fetchPayments = useCallback(async () => {
    try {
      await withLoadingPayments(async () => {
        const { v1Api } = await import('@/lib/api/v1-client');
        const response = await v1Api.rentPayments.list({ page: 1, limit: 1000 });
        const paymentsData = response.data?.data || response.data || [];
        safeSetPayments(Array.isArray(paymentsData) ? paymentsData : []);
      });
    } catch (error) {
      console.error('Error fetching rent payments:', error);
      safeSetPayments([]);
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

  // Memoize stats calculations
  const stats = useMemo(() => {
    let paymentsArray = [];
    
    try {
      if (payments && Array.isArray(payments)) {
        paymentsArray = payments;
      } else if (payments && typeof payments === 'object' && payments.data && Array.isArray(payments.data)) {
        paymentsArray = payments.data;
      } else {
        paymentsArray = [];
      }
    } catch (e) {
      paymentsArray = [];
    }
    
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

  // Memoize filtered payments
  const searchFiltered = search.filteredData;
  const filteredPayments = useMemo(() => {
    const searchArray = Array.isArray(searchFiltered) ? searchFiltered : [];
    
    if (statusFilter === "All") {
      return searchArray;
    } else if (statusFilter === "Unpaid") {
      return searchArray.filter(p => p.status === 'Unpaid' || p.status === 'Overdue');
    } else {
      return searchArray.filter(p => p.status === statusFilter);
    }
  }, [searchFiltered, statusFilter]);

  async function handleRecordPayment(e) {
    e?.preventDefault();
    setPartialPaymentLoading(true);
    try {
      const values = form.getFieldsValue();
      const totalPaid = partialPayments.reduce((sum, pp) => sum + parseFloat(pp.amount), 0);
      const newPaymentAmount = parseFloat(values.amount);
      const totalAfterThisPayment = totalPaid + newPaymentAmount;
      const rentAmount = parseFloat(selectedPayment.amount);
      
      if (totalAfterThisPayment > rentAmount) {
        notify.error(`Total payment (${landlordCountry === 'CA' ? '$' : '$'}${totalAfterThisPayment.toFixed(2)}) cannot exceed rent amount (${landlordCountry === 'CA' ? '$' : '$'}${rentAmount.toFixed(2)})`);
        setPartialPaymentLoading(false);
        return;
      }
      
      const referenceNumber = generateReferenceNumber();
      
      const response = await fetch(
        `/api/v1/rent-payments/${selectedPayment.id}/partial`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: newPaymentAmount,
            paidDate: values.paidDate ? (dayjs.isDayjs(values.paidDate) ? values.paidDate.format('YYYY-MM-DD') : values.paidDate) : dayjs().format('YYYY-MM-DD'),
            paymentMethod: values.paymentMethod,
            referenceNumber: referenceNumber,
            notes: values.notes || null,
            sendReceipt: false,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to record payment');
      }
      const result = await response.json();
      const newPartialPayment = result.partialPayment;
      
      setPartialPayments([...partialPayments, newPartialPayment]);
      
      await fetchPayments();
      
      if (totalAfterThisPayment >= rentAmount) {
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
        form.resetFields();
        form.setFieldsValue({
          amount: (rentAmount - totalAfterThisPayment).toFixed(2),
          paymentMethod: 'Cash',
          paidDate: dayjs().format('YYYY-MM-DD'),
        });
      }
    } catch (error) {
      notify.error(error.message);
    } finally {
      setPartialPaymentLoading(false);
    }
  }

  async function handleSendReceipt(payment) {
    try {
      notify.loading('Generating receipt PDF...');
      
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.specialized.sendRentPaymentReceipt(payment.id);
      
      notify.success('Receipt generated and sent to tenant!');
      await fetchPayments();
    } catch (error) {
      notify.error(error.message || 'Failed to send receipt');
    }
  }

  function handleEditPartialPayment(partialPayment) {
    setEditingPartialId(partialPayment.id);
    const paidDateObj = new Date(partialPayment.paidDate);
    const year = paidDateObj.getFullYear();
    const month = paidDateObj.getMonth() + 1;
    const day = paidDateObj.getDate();
    setEditingValues({
      paidDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      amount: partialPayment.amount,
      paymentMethod: partialPayment.paymentMethod,
      notes: partialPayment.notes || '',
    });
  }

  function handleCancelEdit() {
    setEditingPartialId(null);
    setEditingValues({});
  }

  async function handleSaveInlineEdit(partialPaymentId) {
    try {
      const response = await fetch(
        `/api/v1/rent-payments/${selectedPayment.id}/partial-payment/${partialPaymentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: editingValues.amount,
            paidDate: editingValues.paidDate,
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

      setPartialPayments(result.payment.partialPayments);
      setSelectedPayment(result.payment);

      notify.success('Payment updated successfully');
      setEditingPartialId(null);
      setEditingValues({});

      await fetchPayments();
    } catch (error) {
      notify.error(error.message);
    }
  }

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

      setPartialPayments(result.payment.partialPayments);
      setSelectedPayment(result.payment);

      notify.success('Partial payment deleted successfully');

      if (result.payment.partialPayments.length === 0 && result.payment.status !== 'Paid') {
        closeRecordModal();
        setPartialPayments([]);
        form.resetFields();
      }

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
        if (payment.status === 'Paid') {
          return renderBalance(0);
        }
        
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
        if (payment.status !== 'Paid') {
          return <span className="text-gray-400">—</span>;
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
          <div className="flex items-center gap-2">
            {payment.stripePayment?.disputeStatus === 'chargeback_pending' && payment.status !== 'Unpaid' && (
              <Tooltip content="Mark Rent as Unpaid (due to chargeback)">
                <Button
                  color="failure"
                  size="sm"
                  onClick={async () => {
                    setMarkingUnpaid(true);
                    try {
                      const { v1Api } = await import('@/lib/api/v1-client');
                      await v1Api.specialized.markRentPaymentUnpaid(payment.id);
                      notify.success('Rent payment marked as unpaid');
                      await fetchPayments();
                    } catch (error) {
                      notify.error(error.message || 'Failed to mark payment as unpaid');
                    } finally {
                      setMarkingUnpaid(false);
                    }
                  }}
                  disabled={markingUnpaid}
                >
                  <HiExclamation className="h-4 w-4 mr-1" />
                  Mark Unpaid
                </Button>
              </Tooltip>
            )}
              
            {payment.status !== 'Paid' && (
              <Tooltip content="Record Payment">
                <IconButton
                  icon={<HiCurrencyDollar />}
                  onClick={() => {
                    setSelectedPayment(payment);
                    setPartialPayments(payment.partialPayments || []);
                    const totalPaid = (payment.partialPayments || []).reduce((sum, pp) => sum + parseFloat(pp.amount), 0);
                    const remaining = parseFloat(payment.amount) - totalPaid;
                    form.setFieldsValue({
                      amount: remaining > 0 ? remaining.toFixed(2) : payment.amount,
                      paymentMethod: 'Cash',
                      paidDate: dayjs().format('YYYY-MM-DD'),
                    });
                    openRecordModalForEdit(payment);
                  }}
                  tooltip="Record Payment"
                  size="small"
                />
              </Tooltip>
            )}
            {payment.status === 'Paid' && (
              <Tooltip content={payment.receiptSent ? "Send Receipt Again" : "Generate & Send Receipt"}>
                <IconButton 
                  icon={<HiPaperAirplane />} 
                  onClick={() => handleSendReceipt(payment)}
                  tooltip={payment.receiptSent ? "Send Receipt Again" : "Generate & Send Receipt"}
                  size="small"
                />
              </Tooltip>
            )}
            {payment.receiptNumber && payment.receiptSent && (
              <>
                <IconButton icon={<HiEye />} onClick={() => handleViewReceipt(payment)} tooltip="View Receipt" size="small" />
                <IconButton icon={<HiDownload />} onClick={() => handleDownloadReceipt(payment)} tooltip="Download Receipt" size="small" />
              </>
            )}
          </div>
        );
      },
    }),
  ];

  // Configure columns
  const configuredColumns = configureTableColumns(columns, {
    addSorting: false,
    centerAlign: true,
    addWidths: false,
  });

  // Use resizable table hook
  const { tableProps } = useResizableTable(configuredColumns, {
    defaultSort: { field: 'dueDate', order: 'ascend' },
    storageKey: 'landlord-rent-payments-table',
  });

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* 3-Section Banner Header */}
      <Card className="mb-6">
        <div className="grid grid-cols-[auto_auto_1fr_auto_auto] gap-6 items-center">
          {/* SECTION 1: Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 m-0">Rent Payments</h2>
          </div>
          
          {/* DIVIDER 1 */}
          <div className="w-px h-10 bg-gray-300 self-center" />
          
          {/* SECTION 2: Stats */}
          <div className="flex items-center gap-6 justify-center overflow-hidden">
            {payments.length > 0 && (
              <>
                <span className="text-base text-gray-600 whitespace-nowrap">
                  Overdue: <span className="text-lg font-semibold text-red-600">{stats.overdue}</span>
                </span>
                <span className="text-base text-gray-600 whitespace-nowrap">
                  Amount Due: <span className="text-lg font-semibold text-red-600">
                    <CurrencyDisplay 
                      value={stats.unpaid} 
                      country={landlordCountry}
                      strong 
                    />
                  </span>
                </span>
              </>
            )}
          </div>
          
          {/* DIVIDER 2 */}
          <div className="w-px h-10 bg-gray-300 self-center" />
          
          {/* SECTION 3: Actions */}
          <div className="flex items-center gap-2 min-w-fit">
            {/* Search */}
            <div className="inline-flex w-[350px] justify-end">
              {searchExpanded ? (
                <div className="flex items-center gap-2 w-full">
                  <TextInput
                    autoFocus
                    type="text"
                    placeholder="Search payments by date, amount, status, tenant, or property..."
                    icon={HiSearch}
                    value={search.searchTerm}
                    onChange={(e) => search.setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Tooltip content="Close">
                    <IconButton
                      icon={<HiX />}
                      onClick={() => {
                        setSearchExpanded(false);
                        search.clearSearch();
                      }}
                      tooltip="Close"
                    />
                  </Tooltip>
                </div>
              ) : (
                <Tooltip content="Search">
                  <IconButton
                    icon={<HiSearch />}
                    onClick={() => setSearchExpanded(true)}
                    tooltip="Search"
                  />
                </Tooltip>
              )}
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <Tooltip content="Filter by Status">
                <IconButton 
                  icon={<HiFilter />}
                  tooltip="Filter by Status"
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                />
              </Tooltip>
              {filterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {PAYMENT_STATUS_FILTERS.map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${statusFilter === status ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      {status}{status === statusFilter ? ' ✓' : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Refresh */}
            <Tooltip content="Refresh">
              <IconButton 
                icon={<HiRefresh />}
                onClick={fetchPayments}
                tooltip="Refresh"
              />
            </Tooltip>
          </div>
        </div>
      </Card>

      {filteredPayments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <HiCurrencyDollar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h5 className="text-lg font-semibold text-gray-500 mb-2">No payments found</h5>
            <p className="text-gray-400">
              {statusFilter === "All" 
                ? "Rent payments will appear here once leases are created"
                : `No ${statusFilter.toLowerCase()} payments`}
            </p>
          </div>
        </Card>
      ) : (
        <FlowbiteTable
          {...tableProps}
          dataSource={filteredPayments}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 25, showSizeChanger: true }}
          onRow={(record) => ({
            onDoubleClick: () => {
              setSelectedPayment(record);
              setPartialPayments(record.partialPayments || []);
              const totalPaid = (record.partialPayments || []).reduce((sum, pp) => sum + parseFloat(pp.amount), 0);
              const remaining = parseFloat(record.amount) - totalPaid;
              form.setFieldsValue({
                amount: remaining > 0 ? remaining.toFixed(2) : record.amount,
                paymentMethod: 'Cash',
                paidDate: dayjs().format('YYYY-MM-DD'),
              });
              openRecordModal();
            },
            className: 'cursor-pointer'
          })}
        />
      )}

      {/* Record Payment Modal */}
      <Modal
        show={isRecordModalOpen}
        onClose={() => {
          closeRecordModal();
          setPartialPayments([]);
          form.resetFields();
        }}
        size="6xl"
      >
        <Modal.Header>
          <div className="flex justify-between items-center w-full pr-12">
            <span>Record Payment</span>
            <Tooltip content="Save Payment">
              <Button
                color="blue"
                onClick={handleRecordPayment}
                disabled={partialPaymentLoading}
                className="flex items-center gap-2"
              >
                {partialPaymentLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <HiSave className="h-4 w-4" />
                    Save Payment
                  </>
                )}
              </Button>
            </Tooltip>
          </div>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <>
              {/* Payment Summary */}
              <Card className="mb-3 bg-blue-50 border border-blue-200 p-2">
                <div className="grid grid-cols-8 gap-2 items-center text-xs">
                  <div className="text-center border-r border-blue-300 pr-2">
                    <span className="text-gray-500 block leading-tight">Rent for</span>
                    <span className="font-semibold text-sm">
                      {formatDateMonthYear(selectedPayment.dueDate)}
                    </span>
                  </div>
                  
                  <div className="text-center border-r border-blue-300 pr-2">
                    <span className="text-gray-500 block leading-tight">Due Date</span>
                    <span className="font-semibold text-sm">
                      {formatDateShort(selectedPayment.dueDate)}
                    </span>
                  </div>
                  
                  <div className="text-center border-r border-blue-300 pr-2">
                    <span className="text-gray-500 block leading-tight">Total Rent</span>
                    <span className="font-semibold text-sm">
                      <CurrencyDisplay value={parseFloat(selectedPayment.amount)} country={landlordCountry} />
                    </span>
                  </div>
                  
                  <div className="text-center border-r border-blue-300 pr-2">
                    <span className="text-gray-500 block leading-tight">Total Paid</span>
                    <span className="font-semibold text-sm text-green-600">
                      <CurrencyDisplay 
                        value={partialPayments.reduce((sum, pp) => sum + parseFloat(pp.amount), 0)} 
                        country={landlordCountry} 
                      />
                    </span>
                  </div>
                  
                  <div className="text-center border-r border-blue-300 pr-2">
                    <span className="text-gray-500 block leading-tight">Amount Owed</span>
                    <span className="font-semibold text-sm text-red-600">
                      <CurrencyDisplay 
                        value={parseFloat(selectedPayment.amount) - partialPayments.reduce((sum, pp) => sum + parseFloat(pp.amount), 0)} 
                        country={landlordCountry} 
                      />
                    </span>
                  </div>
                  
                  <div className="text-center border-r border-blue-300 pr-2">
                    <span className="text-gray-500 block leading-tight">Property</span>
                    <Tooltip 
                      content={`${selectedPayment.lease?.unit?.property?.addressLine1}${selectedPayment.lease?.unit?.property?.addressLine2 ? ', ' + selectedPayment.lease?.unit?.property?.addressLine2 : ''}, ${selectedPayment.lease?.unit?.property?.city}, ${selectedPayment.lease?.unit?.property?.provinceState} ${selectedPayment.lease?.unit?.property?.postalZip}`}
                    >
                      <span className="font-semibold text-sm cursor-help truncate block">
                        {selectedPayment.lease?.unit?.property?.propertyName || '—'}
                      </span>
                    </Tooltip>
                  </div>
                  
                  <div className="text-center border-r border-blue-300 pr-2">
                    <span className="text-gray-500 block leading-tight">Tenant</span>
                    <span className="font-semibold text-sm truncate block">
                      {selectedPayment.lease?.leaseTenants?.[0]?.tenant?.firstName} {selectedPayment.lease?.leaseTenants?.[0]?.tenant?.lastName}
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <span className="text-gray-500 block leading-tight">Status</span>
                    <Badge color={getPaymentStatusColor(selectedPayment) === 'red' ? 'failure' : getPaymentStatusColor(selectedPayment) === 'green' ? 'success' : 'warning'} className="mt-1 text-xs px-2 py-0.5">
                      {selectedPayment.status}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Payment Form */}
              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <Label htmlFor="paymentMethod" className="mb-2">Payment Method <span className="text-red-500">*</span></Label>
                    <Select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={form.values.paymentMethod || ''}
                      onChange={(e) => form.setFieldsValue({ paymentMethod: e.target.value })}
                      required
                    >
                      {PAYMENT_METHODS.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paidDate" className="mb-2">Date <span className="text-red-500">*</span></Label>
                    <TextInput
                      id="paidDate"
                      name="paidDate"
                      type="date"
                      value={form.values.paidDate || ''}
                      onChange={(e) => form.setFieldsValue({ paidDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount" className="mb-2">Amount <span className="text-red-500">*</span></Label>
                    <CurrencyInput
                      country={landlordCountry}
                      value={form.values.amount}
                      onChange={(value) => form.setFieldsValue({ amount: value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentType" className="mb-2">Type</Label>
                    <Select
                      id="paymentType"
                      name="paymentType"
                      value={
                        form.values.amount && selectedPayment
                          ? (() => {
                              const amount = parseFloat(String(form.values.amount).replace(/[^0-9.-]+/g, ''));
                              const totalPaid = partialPayments.reduce((sum, pp) => sum + parseFloat(pp.amount), 0);
                              const totalRent = parseFloat(selectedPayment.amount);
                              return (totalPaid + amount) >= totalRent ? 'Full Payment' : 'Partial Payment';
                            })()
                          : 'Partial Payment'
                      }
                      disabled
                    >
                      <option value="Full Payment">Full Payment</option>
                      <option value="Partial Payment">Partial Payment</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes" className="mb-2">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      rows={1}
                      placeholder="Optional notes..."
                      value={form.values.notes || ''}
                      onChange={(e) => form.setFieldsValue({ notes: e.target.value })}
                    />
                  </div>
                </div>
              </form>

              {/* Payment History Table */}
              {partialPayments.length > 0 && (
                <>
                  <div className="my-4 flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-sm font-medium text-gray-500">Payment History</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <Table.Head>
                        <Table.HeadCell>Reference #</Table.HeadCell>
                        <Table.HeadCell>Date</Table.HeadCell>
                        <Table.HeadCell>Amount</Table.HeadCell>
                        <Table.HeadCell>Method</Table.HeadCell>
                        <Table.HeadCell>Notes</Table.HeadCell>
                        <Table.HeadCell>Actions</Table.HeadCell>
                      </Table.Head>
                      <Table.Body>
                        {partialPayments.map((partialPayment) => (
                          <Table.Row key={partialPayment.id}>
                            <Table.Cell>
                              <code className="text-xs">{partialPayment.referenceNumber}</code>
                            </Table.Cell>
                            <Table.Cell>
                              {editingPartialId === partialPayment.id ? (
                                <TextInput
                                  type="date"
                                  value={editingValues.paidDate}
                                  onChange={(e) => setEditingValues({...editingValues, paidDate: e.target.value})}
                                  className="w-full"
                                />
                              ) : (
                                <span>{formatDateDisplay(partialPayment.paidDate)}</span>
                              )}
                            </Table.Cell>
                            <Table.Cell>
                              {editingPartialId === partialPayment.id ? (
                                <CurrencyInput
                                  value={editingValues.amount}
                                  onChange={(value) => setEditingValues({...editingValues, amount: value})}
                                  country={landlordCountry}
                                  className="w-full"
                                />
                              ) : (
                                <CurrencyDisplay value={partialPayment.amount} country={landlordCountry} strong />
                              )}
                            </Table.Cell>
                            <Table.Cell>
                              {editingPartialId === partialPayment.id ? (
                                <Select
                                  value={editingValues.paymentMethod}
                                  onChange={(e) => setEditingValues({...editingValues, paymentMethod: e.target.value})}
                                  className="w-full"
                                >
                                  {PAYMENT_METHODS.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </Select>
                              ) : (
                                <span>{partialPayment.paymentMethod}</span>
                              )}
                            </Table.Cell>
                            <Table.Cell>
                              {editingPartialId === partialPayment.id ? (
                                <TextInput
                                  value={editingValues.notes}
                                  onChange={(e) => setEditingValues({...editingValues, notes: e.target.value})}
                                  placeholder="Optional notes..."
                                  className="w-full"
                                />
                              ) : (
                                <span>{partialPayment.notes || <span className="text-gray-400">—</span>}</span>
                              )}
                            </Table.Cell>
                            <Table.Cell>
                              {editingPartialId === partialPayment.id ? (
                                <div className="flex items-center gap-2">
                                  <Tooltip content="Save">
                                    <IconButton
                                      size="small"
                                      icon={<HiSave />}
                                      onClick={() => handleSaveInlineEdit(partialPayment.id)}
                                      tooltip="Save"
                                    />
                                  </Tooltip>
                                  <Tooltip content="Cancel">
                                    <IconButton
                                      size="small"
                                      icon={<HiX />}
                                      onClick={handleCancelEdit}
                                      tooltip="Cancel"
                                    />
                                  </Tooltip>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Tooltip content="Edit">
                                    <IconButton
                                      size="small"
                                      icon={<HiPencil />}
                                      onClick={() => handleEditPartialPayment(partialPayment)}
                                      tooltip="Edit"
                                    />
                                  </Tooltip>
                                  <FlowbitePopconfirm
                                    title="Delete Payment?"
                                    description="This will recalculate the payment status."
                                    onConfirm={() => handleDeletePartialPayment(partialPayment)}
                                    okText="Delete"
                                    cancelText="Cancel"
                                    danger={true}
                                  >
                                    <Tooltip content="Delete">
                                      <IconButton
                                        size="small"
                                        icon={<HiTrash />}
                                        tooltip="Delete"
                                      />
                                    </Tooltip>
                                  </FlowbitePopconfirm>
                                </div>
                              )}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>
                </>
              )}
            </>
          )}
        </Modal.Body>
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
  return prevProps.leases === nextProps.leases;
});
