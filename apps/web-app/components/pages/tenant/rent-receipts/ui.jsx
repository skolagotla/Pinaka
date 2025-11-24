"use client";
import { useState, useMemo } from 'react';
import { Card, Button, Badge, Select, TextInput, Label, Tooltip, Alert, Spinner } from 'flowbite-react';
import { HiEye, HiDownload, HiDocumentText, HiDocumentReport, HiCalculator, HiCheckCircle, HiClock, HiCurrencyDollar, HiRefresh } from 'react-icons/hi';
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
import { PageLayout, TableWrapper, FlowbiteTable, EmptyState } from '@/components/shared';

dayjs.extend(utc);

export default function RentReceiptsClient({ receipts = [] }) {
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
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
    } else if (viewMode === 'custom' && dateRangeStart && dateRangeEnd) {
      const start = dayjs(dateRangeStart);
      const end = dayjs(dateRangeEnd);
      filtered = filtered.filter(r => {
        const paidDate = r.paidDate ? dayjs(r.paidDate) : dayjs(r.dueDate);
        return paidDate.isAfter(start.subtract(1, 'day')) && paidDate.isBefore(end.add(1, 'day'));
      });
    }
    
    return filtered;
  }, [receipts, viewMode, selectedYear, dateRangeStart, dateRangeEnd]);

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
      prefix: <HiCheckCircle className="h-5 w-5" />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Partial',
      value: filteredReceipts.filter(r => r.status === 'Partial').length,
      prefix: <HiClock className="h-5 w-5" />,
      valueStyle: { color: '#faad14' },
    },
    {
      title: 'Total Amount',
      value: `$${filteredReceipts.filter(r => r.status === 'Paid' || r.status === 'Partial').reduce((sum, r) => sum + parseFloat(r.amount || 0), 0).toFixed(2)}`,
      prefix: <HiCurrencyDollar className="h-5 w-5" />,
    },
  ];

  const columns = [
    {
      header: 'Receipt #',
      accessorKey: 'receiptNumber',
      cell: ({ row }) => renderReceiptNumber(row.original.receiptNumber),
    },
    {
      header: 'Tenant',
      accessorKey: 'tenant',
      cell: ({ row }) => renderTenant(row.original.lease),
    },
    {
      header: 'Property',
      accessorKey: 'property',
      cell: ({ row }) => renderProperty(row.original.lease),
    },
    {
      header: 'Monthly Rent',
      accessorKey: 'amount',
      cell: ({ row }) => renderCurrency(row.original.amount, { strong: true }),
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      cell: ({ row }) => renderDate(row.original.dueDate),
    },
    {
      header: 'Due Amount',
      accessorKey: 'dueAmount',
      cell: ({ row }) => renderBalance(calculateBalance(row.original)),
    },
    {
      header: 'Paid Date',
      accessorKey: 'paidDate',
      cell: ({ row }) => renderDate(row.original.paidDate),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const statusColor = getPaymentStatusColor(row.original);
        return <Badge color={statusColor === 'green' ? 'success' : statusColor === 'orange' ? 'warning' : statusColor === 'red' ? 'failure' : 'gray'}row.original.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }) => (
        // Show actions for both Paid and Partial statuses if receipt exists
        (row.original.status === 'Paid' || row.original.status === 'Partial') && row.original.receiptNumber ? (
          <div className="flex items-center gap-2">
            <Tooltip content="View Receipt">
              <Button 
                color="light"
                size="sm"
                onClick={() => handleViewReceipt(row.original)}
              >
                <HiEye className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Download Receipt">
              <Button 
                color="light"
                size="sm"
                onClick={() => handleDownloadReceipt(row.original)}
              >
                <HiDownload className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        ) : null
      ),
    },
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
      headerTitle={<><HiDocumentText className="inline mr-2" /> Rent Receipts</>}
      headerActions={
        <Button
          key="refresh"
          onClick={() => window.location.reload()}
        >
          <HiRefresh className="mr-2 h-4 w-4" />
          Refresh
        </Button>,
      }
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
      <Card className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <HiCalculator className="h-5 w-5" />
            <h5 className="text-lg font-semibold">Tax Helper & Year-End Summary</h5>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-32"
            >
              <option value="all">All Receipts</option>
              <option value="year">By Year</option>
              <option value="custom">Custom Range</option>
            </Select>
            {viewMode === 'year' && (
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-24"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}year}</option>
                ))}
              </Select>
            )}
            {viewMode === 'custom' && (
              <div className="flex items-center gap-2">
                <TextInput
                  type="date"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                  placeholder="Start Date"
                />
                <span>to</span>
                <TextInput
                  type="date"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  placeholder="End Date"
                />
              </div>
            )}
            {(viewMode === 'year' || viewMode === 'custom') && (
              <Button
                color="light"
                onClick={handleExportSummary}
              >
                <HiDocumentReport className="mr-2 h-4 w-4" />
                Export Summary
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Total Receipts</div>
            <div className="text-2xl font-semibold">{taxSummary.totalReceipts} receipts</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Total Amount Paid</div>
            <div className="text-2xl font-semibold">
              <CurrencyDisplay value={taxSummary.totalAmount} country="CA" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Average Monthly</div>
            <div className="text-2xl font-semibold">
              <CurrencyDisplay 
                value={taxSummary.monthlyBreakdown.length > 0 
                  ? taxSummary.totalAmount / taxSummary.monthlyBreakdown.length 
                  : 0} 
                country="CA" 
              />
            </div>
          </div>
        </div>
        {taxSummary.monthlyBreakdown.length > 0 && (
          <>
            <hr className="my-4" />
            <Alert color="info">
              <div>
                <div className="font-semibold mb-2">Monthly Breakdown</div>
                <div className="space-y-2">
                  {taxSummary.monthlyBreakdown.map(m => (
                    <div key={m.month} className="flex justify-between">
                      <span>{formatDateMonthYear(m.month + '-01')}</span>
                      <span className="font-semibold">
                        <CurrencyDisplay value={m.amount} country="CA" /> ({m.count} payment{m.count > 1 ? 's' : ''})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Alert>
          </>
        )}
      </Card>

      {receipts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<HiDocumentText className="h-12 w-12 text-gray-400" />}
            title="No receipts yet"
            description="Your rent receipts will appear here once payments are made"
          />
        </Card>
      ) : filteredData.length === 0 ? (
        <Card>
          <EmptyState
            icon={<HiDocumentText className="h-12 w-12 text-gray-400" />}
            title="No receipts found"
            description="No receipts found for the selected period"
          />
        </Card>
      ) : (
        <TableWrapper>
          <FlowbiteTable
            {...tableProps}
            data={filteredData}
            columns={columns}
            keyField="id"
            pagination={{
              pageSize: 25,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} receipts`,
            }}
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
