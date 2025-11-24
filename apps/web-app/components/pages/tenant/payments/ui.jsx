"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge, Tooltip, Tabs, Alert, Spinner, Table } from 'flowbite-react';
import { 
  HiCheckCircle, 
  HiClock, 
  HiExclamationCircle, 
  HiDownload, 
  HiEye, 
  HiCalendar, 
  HiBell, 
  HiCurrencyDollar, 
  HiDocumentText, 
  HiXCircle
} from 'react-icons/hi';
import { PageLayout, TableWrapper, renderDate } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { renderReceiptNumber } from '@/components/shared/TableRenderers';
import PaymentStatusTag from '@/components/shared/PaymentStatusTag';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useRentReceipts, useResizableTable } from '@/lib/hooks';
import { configureTableColumns } from '@/lib/utils/table-config';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useRentPayments } from '@/lib/hooks/useV2Data';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { formatDateDisplay, formatDateShort } from '@/lib/utils/safe-date-formatter';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';

// Dynamically import PDF viewer to avoid SSR issues
const PDFViewerModal = dynamic(
  () => import('@/components/shared/PDFViewerModal'),
  { ssr: false }
);

export default function PaymentsClient() {
  const { fetch } = useUnifiedApi({ showUserMessage: false });
  const { user } = useV2Auth();
  const tenantId = user?.id;
  const { data: rentPaymentsData, isLoading: rentPaymentsLoading, refetch: refetchRentPayments } = useRentPayments(undefined, undefined, tenantId);
  const { loading, withLoading } = useLoading(rentPaymentsLoading);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  
  const payments = rentPaymentsData || [];
  
  // Filter payments
  const filteredPaymentsForTable = useMemo(() => {
    let filtered = payments;
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p => {
        if (p.receiptNumber && p.receiptNumber.toLowerCase().includes(searchLower)) return true;
        if (p.lease?.unit?.property?.propertyName?.toLowerCase().includes(searchLower)) return true;
        if (p.lease?.unit?.property?.addressLine1?.toLowerCase().includes(searchLower)) return true;
        if (p.lease?.unit?.unitName?.toLowerCase().includes(searchLower)) return true;
        if (p.status?.toLowerCase().includes(searchLower)) return true;
        if (p.amount?.toString().includes(searchTerm)) return true;
        if (p.dueDate && formatDateDisplay(p.dueDate).toLowerCase().includes(searchLower)) return true;
        if (p.paidDate && formatDateDisplay(p.paidDate).toLowerCase().includes(searchLower)) return true;
        return false;
      });
    }
    
    return filtered;
  }, [payments, searchTerm]);
  
  // Receipt viewing functionality
  const {
    isModalOpen,
    selectedReceipt: viewingReceipt,
    pdfUrl,
    pdfLoading,
    handleViewReceipt,
    handleDownloadReceipt,
    handleCloseModal,
  } = useRentReceipts();

  // Payments are loaded via v2 hooks above
  useEffect(() => {
    // Calculate summary from payments
    if (payments.length > 0) {
      const totalPaid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const totalUnpaid = payments.filter(p => p.status === 'Unpaid' || p.status === 'Overdue').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      setSummary({
        totalPaid,
        totalUnpaid,
        totalPayments: payments.length,
        paidCount: payments.filter(p => p.status === 'Paid').length,
      });
    }
  }, [payments]);

  const handleViewReceiptWrapper = (payment) => {
    handleViewReceipt(payment, '/api/tenant-rent-receipts');
  };

  const handleDownloadReceiptWrapper = (payment) => {
    handleDownloadReceipt(payment, '/api/tenant-rent-receipts');
  };

  const baseColumns = [
    {
      title: 'Receipt #',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      render: (num) => renderReceiptNumber(num),
    },
    customizeColumn(STANDARD_COLUMNS.DUE_DATE, {
      defaultSortOrder: 'descend',
      render: (_, record) => renderDate(record.dueDate),
    }),
    customizeColumn(STANDARD_COLUMNS.PROPERTY_NAME, {
      render: (_, record) => {
        if (!record?.lease?.unit?.property) {
          return <span className="text-gray-400">N/A</span>;
        }
        
        const property = record.lease.unit.property;
        const propertyName = property.propertyName || property.addressLine1 || 'Unknown Property';
        
        if (property.unitCount === 1) {
          return <span className="font-medium">{propertyName}</span>;
        }
        
        const unitName = record.lease.unit?.unitName || '';
        return <span className="font-medium">{unitName} - {propertyName}</span>;
      }
    }),
    {
      title: 'Rent Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Amount Paid',
      key: 'amountPaid',
      render: (_, record) => {
        const paid = record.totalPartialPaid || (record.status === 'Paid' ? record.amount : 0);
        return <span className={paid > 0 ? 'font-semibold text-green-600' : 'text-gray-400'}>
          ${paid.toFixed(2)}
        </span>;
      }
    },
    {
      title: 'Balance',
      key: 'balance',
      render: (_, record) => {
        const balance = record.remainingBalance || 0;
        if (balance === 0) {
          return <span className="text-green-600">$0.00</span>;
        }
        return <span className={`font-semibold ${balance > 0 ? 'text-red-600' : 'text-gray-400'}`}>
          ${balance.toFixed(2)}
        </span>;
      }
    },
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      render: (_, record) => <PaymentStatusTag payment={record} stripePayment={record.stripePayment} />,
    }),
    customizeColumn(STANDARD_COLUMNS.PAYMENT_DATE, {
      render: (_, record) => renderDate(record.paidDate),
    }),
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const actions = [];
        
        if (record.stripePayment?.requiresTenantApproval && record.stripePayment?.tenantApprovedRetry === null) {
          actions.push(
            <Tooltip key="approve" content="Approve Payment Retry">
              <Button
                color="success"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `/api/payments/${record.stripePayment.id}/retry/approve`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      }
                    );
                    if (response.ok) {
                      notify.success('Payment retry approved');
                      loadPayments();
                    }
                  } catch (error) {
                    // Error already handled
                  }
                }}
              >
                <HiCheckCircle className="h-4 w-4 mr-1" />
                Approve Retry
              </Button>
            </Tooltip>,
            <Tooltip key="reject" content="Reject Payment Retry">
              <Button
                color="failure"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `/api/payments/${record.stripePayment.id}/retry/reject`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      }
                    );
                    if (response.ok) {
                      notify.success('Payment retry rejected');
                      loadPayments();
                    }
                  } catch (error) {
                    // Error already handled
                  }
                }}
              >
                <HiXCircle className="h-4 w-4 mr-1" />
                Reject Retry
              </Button>
            </Tooltip>
          );
        }
        
        if (record.receiptSent && record.receiptNumber && (record.status === 'Paid' || record.status === 'Partial')) {
          actions.push(
            <Tooltip key="view" content="View Receipt">
              <Button
                color="gray"
                size="sm"
                onClick={() => handleViewReceiptWrapper(record)}
              >
                <HiEye className="h-4 w-4" />
              </Button>
            </Tooltip>,
            <Tooltip key="download" content="Download Receipt">
              <Button
                color="gray"
                size="sm"
                onClick={() => handleDownloadReceiptWrapper(record)}
              >
                <HiDownload className="h-4 w-4" />
              </Button>
            </Tooltip>
          );
        }
        
        return actions.length > 0 ? <div className="flex items-center gap-2">{actions}</div> : null;
      }
    }
  ];

  const columns = configureTableColumns(baseColumns);
  
  const { tableProps } = useResizableTable(columns, {
    storageKey: 'tenant-payments-table',
    defaultSort: { field: 'dueDate', order: 'descend' },
  });

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  // Calendar data processing
  const calendarData = useMemo(() => {
    const data = {};
    const today = dayjs().startOf('day');
    
    payments.forEach(payment => {
      const dueDate = dayjs(payment.dueDate).startOf('day');
      const paidDate = payment.paidDate ? dayjs(payment.paidDate).startOf('day') : null;
      const isPaid = payment.status === 'Paid' || payment.status === 'Partial';
      const isOverdue = !isPaid && dueDate.isBefore(today);
      const isUpcoming = !isPaid && (dueDate.isAfter(today) || dueDate.isSame(today));
      
      if (isPaid && paidDate) {
        const paidDateStr = paidDate.format('YYYY-MM-DD');
        if (!data[paidDateStr]) {
          data[paidDateStr] = [];
        }
        data[paidDateStr].push({ ...payment, type: 'paid', date: paidDateStr });
      } else if (isUpcoming) {
        const dueDateStr = dueDate.format('YYYY-MM-DD');
        if (!data[dueDateStr]) {
          data[dueDateStr] = [];
        }
        data[dueDateStr].push({ ...payment, type: 'upcoming', date: dueDateStr });
      } else if (isOverdue) {
        const dueDateStr = dueDate.format('YYYY-MM-DD');
        if (!data[dueDateStr]) {
          data[dueDateStr] = [];
        }
        data[dueDateStr].push({ ...payment, type: 'overdue', date: dueDateStr });
      }
    });
    return data;
  }, [payments]);

  const upcomingPayments = useMemo(() => {
    const today = dayjs();
    const thirtyDaysFromNow = today.add(30, 'days');
    return payments
      .filter(p => {
        const dueDate = dayjs(p.dueDate);
        return dueDate.isAfter(today) && dueDate.isBefore(thirtyDaysFromNow) && p.status !== 'Paid';
      })
      .sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf())
      .slice(0, 5);
  }, [payments]);

  const selectedDatePayments = useMemo(() => {
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const dayData = calendarData[dateStr];
    if (!dayData) return [];
    return dayData;
  }, [selectedDate, calendarData]);

  const statsData = summary ? [
    {
      title: 'Total Rent',
      value: `$${summary.totalRent.toFixed(2)}`,
      prefix: <HiCurrencyDollar className="h-5 w-5" />,
    },
    {
      title: 'Total Paid',
      value: `$${summary.totalPaid.toFixed(2)}`,
      prefix: <HiCheckCircle className="h-5 w-5" />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Outstanding',
      value: `$${summary.totalOutstanding.toFixed(2)}`,
      prefix: <HiExclamationCircle className="h-5 w-5" />,
      valueStyle: { color: summary.totalOutstanding > 0 ? '#ff4d4f' : '#52c41a' },
    },
    {
      title: 'Receipts',
      value: payments.filter(p => p.receiptSent && (p.status === 'Paid' || p.status === 'Partial')).length,
      prefix: <HiDocumentText className="h-5 w-5" />,
    },
  ] : [];

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiCurrencyDollar className="h-5 w-5" />
          <span>Payments</span>
        </div>
      }
      stats={statsData}
      statsCols={4}
      showSearch={true}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onSearchClear={handleSearchClear}
      searchPlaceholder="Search by receipt number, property, amount, date, or status..."
    >
      {loading ? (
        <div className="text-center py-12">
          <Spinner size="xl" />
        </div>
      ) : payments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No payment history found</p>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <Tabs activeTab={activeTab} onActiveTabChange={setActiveTab}>
              <Tabs.Item active={activeTab === 'payments'} title={`Payments (${payments.length})`}>
                <TableWrapper>
                  <FlowbiteTable
                    {...tableProps}
                    dataSource={filteredPaymentsForTable}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true
                    }}
                  />
                </TableWrapper>
              </Tabs.Item>
              <Tabs.Item active={activeTab === 'calendar'} title={
                <div className="flex items-center gap-2">
                  <HiCalendar className="h-4 w-4" />
                  <span>Calendar View</span>
                </div>
              }>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Select Date</label>
                      <input
                        type="date"
                        value={selectedDate.format('YYYY-MM-DD')}
                        onChange={(e) => setSelectedDate(dayjs(e.target.value))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>
                    {selectedDatePayments.length > 0 && (
                      <Card className="mt-4">
                        <h3 className="text-lg font-semibold mb-4">
                          Payments for {selectedDate.format('MMMM D, YYYY')}
                        </h3>
                        <div className="space-y-3">
                          {selectedDatePayments.map((item, idx) => {
                            const isOverdue = item.type === 'overdue';
                            const isPaid = item.type === 'paid';
                            const isUpcoming = item.type === 'upcoming';
                            
                            return (
                              <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {isOverdue ? (
                                      <Badge color="failure">
                                        Overdue: <CurrencyDisplay value={item.amount} country="CA" />
                                      </Badge>
                                    ) : isPaid ? (
                                      <Badge color="success">
                                        Paid: <CurrencyDisplay value={item.amount} country="CA" />
                                      </Badge>
                                    ) : (
                                      <Badge color="blue">
                                        Upcoming: <CurrencyDisplay value={item.amount} country="CA" />
                                      </Badge>
                                    )}
                                    <span className="font-semibold">
                                      {item.lease?.unit?.property?.propertyName || item.lease?.unit?.property?.addressLine1}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span>
                                    {isPaid ? '✓ Paid' : item.status === 'Partial' ? 'Partial Payment' : isOverdue ? 'Overdue' : 'Upcoming'}
                                  </span>
                                  {isPaid && item.receiptNumber && item.receiptSent && (
                                    <Button
                                      color="blue"
                                      size="xs"
                                      onClick={() => handleViewReceiptWrapper(item)}
                                    >
                                      <HiEye className="h-3 w-3 mr-1" />
                                      View Receipt
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    )}
                  </div>
                  <div className="space-y-4">
                    <Card>
                      <h3 className="text-lg font-semibold mb-4">Upcoming Payments</h3>
                      {upcomingPayments.length > 0 ? (
                        <div className="space-y-3">
                          {upcomingPayments.map((payment) => (
                            <div key={payment.id} className="p-3 border border-gray-200 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">{formatDateShort(payment.dueDate)}</span>
                                <CurrencyDisplay value={payment.amount} country="CA" strong />
                              </div>
                              <p className="text-sm text-gray-600">
                                {payment.lease?.unit?.property?.propertyName || payment.lease?.unit?.property?.addressLine1}
                              </p>
                              {dayjs(payment.dueDate).diff(dayjs(), 'days') <= 7 && (
                                <Alert color="warning" className="mt-2 text-xs">
                                  Due in {dayjs(payment.dueDate).diff(dayjs(), 'days')} days
                                </Alert>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No upcoming payments</p>
                        </div>
                      )}
                    </Card>
                    <Card>
                      <h3 className="text-lg font-semibold mb-4">Payment Reminders</h3>
                      {payments.filter(p => p.isOverdue).length > 0 ? (
                        <div className="space-y-3">
                          {payments.filter(p => p.isOverdue).map((payment) => (
                            <Alert key={payment.id} color="failure">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <HiBell className="h-4 w-4" />
                                  <span className="font-semibold">Overdue Payment</span>
                                </div>
                                <p className="text-sm">Due: {formatDateDisplay(payment.dueDate)}</p>
                                <p className="text-sm font-semibold text-red-600">
                                  <CurrencyDisplay value={payment.remainingBalance || payment.amount} country="CA" />
                                </p>
                              </div>
                            </Alert>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No overdue payments</p>
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              </Tabs.Item>
            </Tabs>
          </Card>
        </>
      )}

      <PDFViewerModal
        open={isModalOpen}
        title={`Receipt #${viewingReceipt?.receiptNumber || ''}`}
        pdfUrl={pdfUrl}
        loading={pdfLoading}
        onClose={handleCloseModal}
        onDownload={() => handleDownloadReceiptWrapper(viewingReceipt)}
        downloadFileName={`Receipt_${viewingReceipt?.receiptNumber}.pdf`}
        width={800}
        height={600}
      />
    </PageLayout>
  );
}
