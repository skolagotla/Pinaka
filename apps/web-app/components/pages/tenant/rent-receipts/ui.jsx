"use client";
import { useState, useMemo } from 'react';
import { Table, Tag, Button, Space, Typography, Card, Empty, Tooltip, DatePicker, Select, Statistic, Row, Col, Alert, Divider } from 'antd';
import { EyeOutlined, DownloadOutlined, FileTextOutlined, FileExcelOutlined, CalculatorOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatDateMonthYear } from '@/lib/utils/safe-date-formatter';
import utc from 'dayjs/plugin/utc';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';

// Shared components
import dynamic from 'next/dynamic';

// Dynamically import PDF viewer to avoid SSR issues with pdf.js
const PDFViewerModal = dynamic(
  () => import('@/components/shared/PDFViewerModal'),
  { ssr: false }
);
import {
  renderDate,
  renderCurrency,
  renderBalance,
  renderProperty,
  renderTenant,
  renderReceiptNumber,
} from '@/components/shared/TableRenderers';

// Shared hooks and utilities
import { useRentReceipts, useResizableTable, withSorter, sortFunctions, configureTableColumns } from '@/lib/hooks';
import {
  calculateBalance,
  getPaymentStatusColor,
} from '@/lib/utils/rent-display-helpers';
import { STANDARD_COLUMNS, COLUMN_NAMES, customizeColumn } from '@/lib/constants/standard-columns';
import { PageLayout, TableWrapper } from '@/components/shared';

dayjs.extend(utc);

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function RentReceiptsClient({ receipts = [] }) {
  const [dateRange, setDateRange] = useState(null);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [viewMode, setViewMode] = useState('all'); // 'all', 'year', 'custom'
  // Use shared receipt viewing hook
  const {
    isModalOpen,
    selectedReceipt: viewingReceipt,
    pdfUrl,
    pdfLoading,
    handleViewReceipt: viewReceipt,
    handleDownloadReceipt: downloadReceipt,
    handleCloseModal,
  } = useRentReceipts();

  // Wrapper functions to use tenant-specific API path
  const handleViewReceipt = (receipt) => {
    viewReceipt(receipt, '/api/tenant-rent-receipts');
  };

  const handleDownloadReceipt = (receipt) => {
    downloadReceipt(receipt, '/api/tenant-rent-receipts');
  };

  // Filter receipts based on view mode
  const filteredReceipts = useMemo(() => {
    let filtered = receipts;
    
    if (viewMode === 'year') {
      filtered = filtered.filter(r => {
        const paidDate = r.paidDate ? dayjs(r.paidDate) : dayjs(r.dueDate);
        return paidDate.year() === selectedYear;
      });
    } else if (viewMode === 'custom' && dateRange) {
      const [start, end] = dateRange;
      filtered = filtered.filter(r => {
        const paidDate = r.paidDate ? dayjs(r.paidDate) : dayjs(r.dueDate);
        return paidDate.isAfter(start.subtract(1, 'day')) && paidDate.isBefore(end.add(1, 'day'));
      });
    }
    
    return filtered;
  }, [receipts, viewMode, selectedYear, dateRange]);

  // Calculate tax summary
  const taxSummary = useMemo(() => {
    const paidReceipts = filteredReceipts.filter(r => r.status === 'Paid' || r.status === 'Partial');
    const totalAmount = paidReceipts.reduce((sum, r) => {
      // For partial payments, use the amount actually paid
      if (r.status === 'Partial' && r.partialPayments) {
        return sum + r.partialPayments.reduce((pSum, pp) => pSum + (pp.amount || 0), 0);
      }
      return sum + parseFloat(r.amount || 0);
    }, 0);
    
    const monthlyBreakdown = {};
    paidReceipts.forEach(r => {
      const paidDate = r.paidDate ? dayjs(r.paidDate) : dayjs(r.dueDate);
      const monthKey = paidDate.format('YYYY-MM');
      if (!monthlyBreakdown[monthKey]) {
        monthlyBreakdown[monthKey] = { amount: 0, count: 0 };
      }
      const amount = r.status === 'Partial' && r.partialPayments
        ? r.partialPayments.reduce((sum, pp) => sum + (pp.amount || 0), 0)
        : parseFloat(r.amount || 0);
      monthlyBreakdown[monthKey].amount += amount;
      monthlyBreakdown[monthKey].count += 1;
    });

    return {
      totalAmount,
      totalReceipts: paidReceipts.length,
      monthlyBreakdown: Object.entries(monthlyBreakdown)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month))
    };
  }, [filteredReceipts]);

  // Generate year-end summary text
  const generateYearEndSummary = () => {
    const summary = taxSummary;
    const year = viewMode === 'year' ? selectedYear : dayjs().year();
    return `RENT RECEIPTS SUMMARY - ${year}\n\n` +
      `Total Receipts: ${summary.totalReceipts}\n` +
      `Total Amount Paid: $${summary.totalAmount.toFixed(2)}\n\n` +
      `MONTHLY BREAKDOWN:\n` +
      summary.monthlyBreakdown.map(m => 
        `${formatDateMonthYear(m.month + '-01')}: $${m.amount.toFixed(2)} (${m.count} payment${m.count > 1 ? 's' : ''})`
      ).join('\n');
  };

  const handleExportSummary = () => {
    const summaryText = generateYearEndSummary();
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rent-receipts-summary-${selectedYear}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [searchTerm, setSearchTerm] = useState('');

  // Search filter
  const searchFilteredData = useMemo(() => {
    if (!searchTerm) return filteredReceipts;
    const searchLower = searchTerm.toLowerCase();
    return filteredReceipts.filter(receipt => {
      const searchFields = [
        receipt.receiptNumber,
        receipt.dueDate ? dayjs(receipt.dueDate).format('YYYY-MM-DD') : '',
        receipt.paidDate ? dayjs(receipt.paidDate).format('YYYY-MM-DD') : '',
        receipt.amount?.toString(),
        receipt.status,
        receipt.lease?.unit?.unitName,
        receipt.lease?.unit?.property?.propertyName,
        receipt.lease?.unit?.property?.addressLine1,
      ];
      return searchFields.some(field => field?.toLowerCase().includes(searchLower));
    });
  }, [filteredReceipts, searchTerm]);

  // Apply search filter on top of date filter
  const filteredData = searchFilteredData;

  const statsData = [
    {
      title: 'Paid',
      value: filteredReceipts.filter(r => r.status === 'Paid').length,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Partial',
      value: filteredReceipts.filter(r => r.status === 'Partial').length,
      prefix: <ClockCircleOutlined />,
      valueStyle: { color: '#faad14' },
    },
    {
      title: 'Total Amount',
      value: `$${filteredReceipts.filter(r => r.status === 'Paid' || r.status === 'Partial').reduce((sum, r) => sum + parseFloat(r.amount || 0), 0).toFixed(2)}`,
      prefix: <DollarOutlined />,
    },
  ];

  const columns = [
    customizeColumn(STANDARD_COLUMNS.RECEIPT_NUMBER, {
      render: (num) => renderReceiptNumber(num),
    }),
    customizeColumn(STANDARD_COLUMNS.TENANT_NAME, {
      key: 'tenant',
      render: (_, receipt) => renderTenant(receipt.lease),
    }),
    customizeColumn(STANDARD_COLUMNS.PROPERTY_NAME, {
      key: 'property',
      render: (_, receipt) => renderProperty(receipt.lease),
    }),
    customizeColumn(STANDARD_COLUMNS.MONTHLY_RENT, {
      dataIndex: 'amount',
      render: (amount) => renderCurrency(amount, { strong: true }),
    }),
    withSorter(
      customizeColumn(STANDARD_COLUMNS.DUE_DATE, {
        render: (date) => renderDate(date),
      }),
      sortFunctions.date('dueDate')
    ),
    customizeColumn(STANDARD_COLUMNS.DUE_AMOUNT, {
      render: (_, receipt) => renderBalance(calculateBalance(receipt)),
    }),
    customizeColumn(STANDARD_COLUMNS.PAID_DATE, {
      render: (date) => renderDate(date),
    }),
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      render: (status, receipt) => {
        const statusColor = getPaymentStatusColor(receipt);
        return <Tag color={statusColor}>{status}</Tag>;
      },
      filters: [
        { text: 'Paid', value: 'Paid' },
        { text: 'Partial', value: 'Partial' },
        { text: 'Unpaid', value: 'Unpaid' },
        { text: 'Overdue', value: 'Overdue' },
      ],
      onFilter: (value, record) => record.status === value,
    }),
    customizeColumn(STANDARD_COLUMNS.ACTIONS, {
      render: (_, receipt) => (
        // Show actions for both Paid and Partial statuses if receipt exists
        (receipt.status === 'Paid' || receipt.status === 'Partial') && receipt.receiptNumber ? (
          <Space size="small">
            <Tooltip title="View Receipt">
              <Button 
                type="text" 
                size="small"
                icon={<EyeOutlined />} 
                onClick={() => handleViewReceipt(receipt)}
              />
            </Tooltip>
            <Tooltip title="Download Receipt">
              <Button 
                type="text" 
                size="small"
                icon={<DownloadOutlined />} 
                onClick={() => handleDownloadReceipt(receipt)}
              />
            </Tooltip>
          </Space>
        ) : null
      ),
    }),
  ];

  // Configure columns with standard settings
  const configuredColumns = configureTableColumns(columns, {
    addSorting: false, // Keep existing sorters
    centerAlign: true,
    addWidths: false, // Keep existing widths
  });

  // Use resizable table hook with column width persistence
  const { tableProps } = useResizableTable(configuredColumns, {
    defaultSort: { field: 'paidDate', order: 'descend' },
    storageKey: 'tenant-rent-receipts-table',
  });

  // Get available years from receipts
  const availableYears = useMemo(() => {
    const years = new Set();
    receipts.forEach(r => {
      const paidDate = r.paidDate ? dayjs(r.paidDate) : dayjs(r.dueDate);
      years.add(paidDate.year());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [receipts]);

  return (
    <PageLayout
      headerTitle={<><FileTextOutlined /> Rent Receipts</>}
      headerActions={[
        <Button
          key="refresh"
          icon={<ReloadOutlined />}
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>,
      ]}
      stats={statsData}
      statsCols={3}
      showSearch={true}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onSearchClear={() => setSearchTerm('')}
      searchPlaceholder="Search receipts by number, date, amount, or property..."
      contentStyle={{ maxWidth: 1400, margin: '0 auto' }}
    >

      {/* Tax Helper Section */}
      <Card 
        title={
          <Space>
            <CalculatorOutlined />
            <Text strong>Tax Helper & Year-End Summary</Text>
          </Space>
        }
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            <Select
              value={viewMode}
              onChange={setViewMode}
              style={{ width: 120 }}
            >
              <Option value="all">All Receipts</Option>
              <Option value="year">By Year</Option>
              <Option value="custom">Custom Range</Option>
            </Select>
            {viewMode === 'year' && (
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: 100 }}
              >
                {availableYears.map(year => (
                  <Option key={year} value={year}>{year}</Option>
                ))}
              </Select>
            )}
            {viewMode === 'custom' && (
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="MMM D, YYYY"
              />
            )}
            {(viewMode === 'year' || viewMode === 'custom') && (
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportSummary}
              >
                Export Summary
              </Button>
            )}
          </Space>
        }
      >
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Total Receipts"
              value={taxSummary.totalReceipts}
              suffix="receipts"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Total Amount Paid"
              value={taxSummary.totalAmount}
              prefix="$"
              precision={2}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Average Monthly"
              value={taxSummary.monthlyBreakdown.length > 0 
                ? taxSummary.totalAmount / taxSummary.monthlyBreakdown.length 
                : 0}
              prefix="$"
              precision={2}
            />
          </Col>
        </Row>
        {taxSummary.monthlyBreakdown.length > 0 && (
          <>
            <Divider />
            <Alert
              message="Monthly Breakdown"
              description={
                <div style={{ marginTop: 8 }}>
                  {taxSummary.monthlyBreakdown.map(m => (
                    <div key={m.month} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text>{formatDateMonthYear(m.month + '-01')}</Text>
                      <Text strong>
                        <CurrencyDisplay value={m.amount} country="CA" /> ({m.count} payment{m.count > 1 ? 's' : ''})
                      </Text>
                    </div>
                  ))}
                </div>
              }
              type="info"
              showIcon
            />
          </>
        )}
      </Card>

      {receipts.length === 0 ? (
        <Card>
          <Empty
            image={<FileTextOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
            description={
              <div>
                <Title level={5} type="secondary">No receipts yet</Title>
                <Text type="secondary">Your rent receipts will appear here once payments are made</Text>
              </div>
            }
          />
        </Card>
      ) : filteredData.length === 0 ? (
        <Card>
          <Empty description="No receipts found for the selected period" />
        </Card>
      ) : (
        <TableWrapper>
          <Table
            {...tableProps}
            dataSource={filteredData}
            rowKey="id"
            pagination={{
              pageSize: 25,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} receipts`,
            }}
            size="middle"
          />
        </TableWrapper>
      )}

      <PDFViewerModal
        open={isModalOpen}
        title={`Receipt #${viewingReceipt?.receiptNumber || ''}`}
        pdfUrl={pdfUrl}
        loading={pdfLoading}
        onClose={handleCloseModal}
        onDownload={() => handleDownloadReceipt(viewingReceipt)}
        downloadFileName={`Receipt_${viewingReceipt?.receiptNumber}.pdf`}
        width={800}
        height={600}
      />
    </PageLayout>
  );
}
