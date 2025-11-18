"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, Table, Tag, Empty, Spin, Typography, Button, Space, Tooltip, Tabs, Calendar, Badge, Alert, List, Divider } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, DownloadOutlined, EyeOutlined, CalendarOutlined, BellOutlined, DollarOutlined, FileTextOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { PageLayout, TableWrapper, renderDate } from '@/components/shared';
import { renderReceiptNumber } from '@/components/shared/TableRenderers';
import PaymentStatusTag from '@/components/shared/PaymentStatusTag';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import PaymentCalendar from '@/components/shared/PaymentCalendar';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useRentReceipts, useResizableTable } from '@/lib/hooks';
import { configureTableColumns } from '@/lib/utils/table-config';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { formatDateDisplay, formatDateShort } from '@/lib/utils/safe-date-formatter';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';

// Dynamically import PDF viewer to avoid SSR issues
const PDFViewerModal = dynamic(
  () => import('@/components/shared/PDFViewerModal'),
  { ssr: false }
);

const { Text } = Typography;

export default function PaymentsClient() {
  const { fetch } = useUnifiedApi({ showUserMessage: false });
  const { loading, withLoading } = useLoading(true);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  
  // Filter payments - remove the separate receipts filter since all payments with receipts are already shown
  const filteredPaymentsForTable = useMemo(() => {
    let filtered = payments;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p => {
        // Search in receipt number
        if (p.receiptNumber && p.receiptNumber.toLowerCase().includes(searchLower)) return true;
        // Search in property name
        if (p.lease?.unit?.property?.propertyName?.toLowerCase().includes(searchLower)) return true;
        // Search in property address
        if (p.lease?.unit?.property?.addressLine1?.toLowerCase().includes(searchLower)) return true;
        // Search in unit name
        if (p.lease?.unit?.unitName?.toLowerCase().includes(searchLower)) return true;
        // Search in status
        if (p.status?.toLowerCase().includes(searchLower)) return true;
        // Search in amount
        if (p.amount?.toString().includes(searchTerm)) return true;
        // Search in dates
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

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    await withLoading(async () => {
      try {
        const response = await fetch(
          '/api/tenants/payments',
          {},
          { operation: 'Load payment history', showUserMessage: false }
        );
        const data = await response.json();
        if (data.success) {
          setPayments(data.payments || []);
          setSummary(data.summary || null);
        }
      } catch (error) {
        // Error already handled
      }
    });
  };


  // Wrapper for receipt viewing with tenant API path
  const handleViewReceiptWrapper = (payment) => {
    handleViewReceipt(payment, '/api/tenant-rent-receipts');
  };

  const handleDownloadReceiptWrapper = (payment) => {
    handleDownloadReceipt(payment, '/api/tenant-rent-receipts');
  };

  // Status tag now uses shared PaymentStatusTag component

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
        // Add null checks for nested property access
        if (!record?.lease?.unit?.property) {
          return <Text type="secondary">N/A</Text>;
        }
        
        const property = record.lease.unit.property;
        const propertyName = property.propertyName || property.addressLine1 || 'Unknown Property';
        
        // Single unit: show property name only
        if (property.unitCount === 1) {
          return <Text style={{ fontWeight: 500 }}>{propertyName}</Text>;
        }
        
        // Multiple units: show "Unit# - Property Name" (e.g., "1801 Aspen")
        const unitName = record.lease.unit?.unitName || '';
        return <Text style={{ fontWeight: 500 }}>{unitName} - {propertyName}</Text>;
      }
    }),
    {
      title: 'Rent Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right', // Keep right alignment for amounts
      render: (amount) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Amount Paid',
      key: 'amountPaid',
      align: 'right', // Keep right alignment for amounts
      render: (_, record) => {
        const paid = record.totalPartialPaid || (record.status === 'Paid' ? record.amount : 0);
        return <Text strong={paid > 0} style={{ color: paid > 0 ? '#34a853' : '#999' }}>
          ${paid.toFixed(2)}
        </Text>;
      }
    },
    {
      title: 'Balance',
      key: 'balance',
      align: 'right', // Keep right alignment for amounts
      render: (_, record) => {
        const balance = record.remainingBalance || 0;
        if (balance === 0) {
          return <Text style={{ color: '#34a853' }}>$0.00</Text>;
        }
        return <Text strong style={{ color: balance > 0 ? '#ea4335' : '#999' }}>
          ${balance.toFixed(2)}
        </Text>;
      }
    },
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      render: (_, record) => <PaymentStatusTag payment={record} stripePayment={record.stripePayment} />,
      filters: [
        { text: 'Paid', value: 'Paid' },
        { text: 'Partial', value: 'Partial' },
        { text: 'Unpaid', value: 'Unpaid' },
        { text: 'Overdue', value: 'Overdue' }
      ],
      onFilter: (value, record) => {
        if (value === 'Overdue') return record.isOverdue;
        return record.status === value;
      }
    }),
    customizeColumn(STANDARD_COLUMNS.PAYMENT_DATE, {
      render: (_, record) => renderDate(record.paidDate),
    }),
    {
      title: 'Actions',
      key: 'actions',
      sorter: false, // Disable sorting for actions
      render: (_, record) => {
        const actions = [];
        
        // Show retry approval/rejection buttons if retry requires approval
        if (record.stripePayment?.requiresTenantApproval && record.stripePayment?.tenantApprovedRetry === null) {
          actions.push(
            <Tooltip key="approve" title="Approve Payment Retry">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `/api/payments/${record.stripePayment.id}/retry/approve`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      },
                      { operation: 'Approve payment retry' }
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
                Approve Retry
              </Button>
            </Tooltip>,
            <Tooltip key="reject" title="Reject Payment Retry">
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `/api/payments/${record.stripePayment.id}/retry/reject`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      },
                      { operation: 'Reject payment retry' }
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
                Reject Retry
              </Button>
            </Tooltip>
          );
        }
        
        // Show receipt actions if payment has a receipt
        if (record.receiptSent && record.receiptNumber && (record.status === 'Paid' || record.status === 'Partial')) {
          actions.push(
            <Tooltip key="view" title="View Receipt">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewReceiptWrapper(record)}
              />
            </Tooltip>,
            <Tooltip key="download" title="Download Receipt">
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadReceiptWrapper(record)}
              />
            </Tooltip>
          );
        }
        
        return actions.length > 0 ? <Space>{actions}</Space> : null;
      }
    }
  ];

  // Configure columns with standard settings (sorting, center alignment, resizable)
  const columns = configureTableColumns(baseColumns);
  
  // Use resizable table hook
  const { tableProps } = useResizableTable(columns, {
    storageKey: 'tenant-payments-table',
    defaultSort: { field: 'dueDate', order: 'descend' },
  });


  const handleSearchClear = () => {
    setSearchTerm('');
  };

  // Calendar data processing - only show upcoming and paid dates
  const calendarData = useMemo(() => {
    const data = {};
    const today = dayjs().startOf('day');
    
    payments.forEach(payment => {
      const dueDate = dayjs(payment.dueDate).startOf('day');
      const paidDate = payment.paidDate ? dayjs(payment.paidDate).startOf('day') : null;
      const isPaid = payment.status === 'Paid' || payment.status === 'Partial';
      const isOverdue = !isPaid && dueDate.isBefore(today);
      const isUpcoming = !isPaid && (dueDate.isAfter(today) || dueDate.isSame(today));
      
      // Only include if paid or upcoming
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
        // Show overdue payments in red
        const dueDateStr = dueDate.format('YYYY-MM-DD');
        if (!data[dueDateStr]) {
          data[dueDateStr] = [];
        }
        data[dueDateStr].push({ ...payment, type: 'overdue', date: dueDateStr });
      }
    });
    return data;
  }, [payments]);

  // Get upcoming payments (next 30 days)
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

  // Calendar cell renderer - only show upcoming and paid dates
  const dateCellRender = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayData = calendarData[dateStr];
    if (!dayData || dayData.length === 0) return null;

    return (
      <div style={{ fontSize: '11px' }}>
        {dayData.map((item, index) => {
          const isOverdue = item.type === 'overdue';
          const isPaid = item.type === 'paid';
          const isUpcoming = item.type === 'upcoming';
          
          return (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                // If paid and has receipt, open receipt
                if (isPaid && item.receiptNumber && item.receiptSent) {
                  handleViewReceiptWrapper(item);
                } else if (isOverdue || isUpcoming) {
                  // For overdue/upcoming, could show payment details or do nothing
                  // For now, just prevent default calendar selection
                }
              }}
              style={{
                marginBottom: '2px',
                padding: '2px 4px',
                borderRadius: '2px',
                backgroundColor: isOverdue ? '#ff4d4f' : isPaid ? '#52c41a' : '#1890ff',
                color: 'white',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: (isPaid && item.receiptNumber && item.receiptSent) ? 'pointer' : 'default'
              }}
              title={isPaid && item.receiptNumber ? 'Click to view receipt' : ''}
            >
              {isOverdue ? '⚠️ ' : isPaid ? '✓ ' : ''}
              ${item.amount.toFixed(0)}
            </div>
          );
        })}
      </div>
    );
  };

  // Get payments for selected date
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
      prefix: <DollarOutlined />,
    },
    {
      title: 'Total Paid',
      value: `$${summary.totalPaid.toFixed(2)}`,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Outstanding',
      value: `$${summary.totalOutstanding.toFixed(2)}`,
      prefix: <ExclamationCircleOutlined />,
      valueStyle: { color: summary.totalOutstanding > 0 ? '#ff4d4f' : '#52c41a' },
    },
    {
      title: 'Receipts',
      value: payments.filter(p => p.receiptSent && (p.status === 'Paid' || p.status === 'Partial')).length,
      prefix: <FileTextOutlined />,
    },
  ] : [];

  return (
    <PageLayout
      headerTitle={<><DollarOutlined /> Payments</>}
      stats={statsData}
      statsCols={4}
      showSearch={true}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onSearchClear={handleSearchClear}
      searchPlaceholder="Search by receipt number, property, amount, date, or status..."
    >

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : payments.length === 0 ? (
        <Card>
          <Empty description="No payment history found" />
        </Card>
      ) : (
        <>
          {/* Payments with Tabs: Calendar and Table */}
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'payments',
                  label: `Payments (${payments.length})`,
                  children: (
                    <TableWrapper>
                      <Table
                        {...tableProps}
                        dataSource={filteredPaymentsForTable}
                        rowKey="id"
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          showTotal: (total) => `Total ${total} payments`
                        }}
                      />
                    </TableWrapper>
                  )
                },
                {
                  key: 'calendar',
                  label: (
                    <span>
                      <CalendarOutlined /> Calendar View
                    </span>
                  ),
                  children: (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                      <div>
                        <Calendar
                          dateCellRender={dateCellRender}
                          onSelect={(date) => setSelectedDate(date)}
                          value={selectedDate}
                        />
                        {selectedDatePayments.length > 0 && (
                          <Card 
                            title={`Payments for ${selectedDate.format('MMMM D, YYYY')}`}
                            style={{ marginTop: 16 }}
                            size="small"
                          >
                            <List
                              dataSource={selectedDatePayments}
                              renderItem={(item) => {
                                const isOverdue = item.type === 'overdue';
                                const isPaid = item.type === 'paid';
                                const isUpcoming = item.type === 'upcoming';
                                
                                return (
                                  <List.Item>
                                    <List.Item.Meta
                                      title={
                                        <Space>
                                          {isOverdue ? (
                                            <Tag color="red">
                                              Overdue: <CurrencyDisplay value={item.amount} country="CA" />
                                            </Tag>
                                          ) : isPaid ? (
                                            <Tag color="green">
                                              Paid: <CurrencyDisplay value={item.amount} country="CA" />
                                            </Tag>
                                          ) : (
                                            <Tag color="blue">
                                              Upcoming: <CurrencyDisplay value={item.amount} country="CA" />
                                            </Tag>
                                          )}
                                          <Text strong>
                                            {item.lease?.unit?.property?.propertyName || item.lease?.unit?.property?.addressLine1}
                                          </Text>
                                        </Space>
                                      }
                                      description={
                                        <Space>
                                          <Text type="secondary">
                                            {isPaid ? '✓ Paid' : item.status === 'Partial' ? 'Partial Payment' : isOverdue ? 'Overdue' : 'Upcoming'}
                                          </Text>
                                          {isPaid && item.receiptNumber && item.receiptSent && (
                                            <Button
                                              type="link"
                                              size="small"
                                              icon={<EyeOutlined />}
                                              onClick={() => handleViewReceiptWrapper(item)}
                                            >
                                              View Receipt
                                            </Button>
                                          )}
                                        </Space>
                                      }
                                    />
                                  </List.Item>
                                );
                              }}
                            />
                          </Card>
                        )}
                      </div>
                      <div>
                        <Card title="Upcoming Payments" size="small" style={{ marginBottom: 16 }}>
                          {upcomingPayments.length > 0 ? (
                            <List
                              dataSource={upcomingPayments}
                              renderItem={(payment) => (
                                <List.Item>
                                  <div style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                      <Text strong>{formatDateShort(payment.dueDate)}</Text>
                                      <CurrencyDisplay value={payment.amount} country="CA" strong />
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {payment.lease?.unit?.property?.propertyName || payment.lease?.unit?.property?.addressLine1}
                                    </Text>
                                    {dayjs(payment.dueDate).diff(dayjs(), 'days') <= 7 && (
                                      <Alert
                                        message={`Due in ${dayjs(payment.dueDate).diff(dayjs(), 'days')} days`}
                                        type="warning"
                                        showIcon
                                        style={{ marginTop: 8 }}
                                        size="small"
                                      />
                                    )}
                                  </div>
                                </List.Item>
                              )}
                            />
                          ) : (
                            <Empty description="No upcoming payments" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          )}
                        </Card>
                        <Card title="Payment Reminders" size="small">
                          <List
                            dataSource={payments.filter(p => p.isOverdue)}
                            renderItem={(payment) => (
                              <List.Item>
                                <Alert
                                  message={
                                    <Space>
                                      <BellOutlined />
                                      <Text strong>Overdue Payment</Text>
                                    </Space>
                                  }
                                  description={
                                    <div>
                                      <Text>Due: {formatDateDisplay(payment.dueDate)}</Text>
                                      <br />
                                      <CurrencyDisplay value={payment.remainingBalance || payment.amount} country="CA" strong style={{ color: '#ff4d4f' }} />
                                    </div>
                                  }
                                  type="error"
                                  showIcon
                                  style={{ width: '100%' }}
                                />
                              </List.Item>
                            )}
                          />
                        </Card>
                      </div>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </>
      )}

      {/* PDF Viewer Modal */}
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

