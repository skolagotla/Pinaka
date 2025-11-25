"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Modal, Select, TextInput, Label, Tabs, Spinner, Badge, Tooltip } from 'flowbite-react';
import { PageLayout, TableWrapper, renderDate } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import FlowbiteStatistic from '@/components/shared/FlowbiteStatistic';
import { useFormState } from '@/lib/hooks/useFormState';
import {
  HiPlus,
  HiDownload,
  HiDocumentText,
  HiHome,
  HiUser,
  HiCog,
  HiCheckCircle,
  HiXCircle,
  HiChartBar,
  HiCurrencyDollar,
} from 'react-icons/hi';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { formatDateForInput, getDateComponents } from '@/lib/utils/date-utils';
import { formatDateDisplay, formatDateForAPI } from '@/lib/utils/safe-date-formatter';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';
import CurrencyInput from '@/components/rules/CurrencyInput';
import { rules } from '@/lib/utils/validation-rules';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
// useUnifiedApi removed - use v2Api from @/lib/api/v2-client';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useExpenses, useProperties, useCreateExpense } from '@/lib/hooks/useV2Data';
import { useDataLoader, useTabNavigation, useModalState, useFormSubmission, useResizableTable } from '@/lib/hooks';
import { configureTableColumns } from '@/lib/utils/table-config';
import { processExpensesByCategory, processMonthlyTrend } from '@/lib/utils/chartDataProcessors';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { renderStatus } from '@/components/shared/FlowbiteTableRenderers';

// Dynamically import Recharts components to avoid SSR issues
const IncomeExpensesChart = dynamic(
  () => import('@/components/charts/IncomeExpensesChart'),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center">Loading chart...</div> }
);

const ExpensesPieChart = dynamic(
  () => import('@/components/charts/ExpensesPieChart'),
  { ssr: false, loading: () => <div className="h-72 flex items-center justify-center">Loading chart...</div> }
);

const MonthlyExpenseChart = dynamic(
  () => import('@/components/charts/MonthlyExpenseChart'),
  { ssr: false, loading: () => <div className="h-72 flex items-center justify-center">Loading chart...</div> }
);

// Lazy load TicketViewModal
const TicketViewModal = dynamic(
  () => import('@/components/shared/TicketViewModal'),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center">Loading ticket details...</div> }
);

export default function FinancialsClient() {
  const router = useRouter();
  const { user } = useV2Auth();
  const organizationId = user?.organization_id;
  const { fetch: fetchApi } = useUnifiedApi({ showUserMessage: false });
  const { activeTab, setActiveTab } = useTabNavigation({ 
    defaultTab: 'expenses',
    tabs: ['expenses', 'income', 'mortgage', 'charts']
  });
  const { isOpen: expenseModalOpen, open: openExpenseModal, close: closeExpenseModal, reset: resetExpenseModal } = useModalState();
  const form = useFormState();
  
  // Load expenses and properties using v2 API
  const { data: expensesData, isLoading: expensesLoading, refetch: refetchExpenses } = useExpenses(organizationId);
  const expenses = expensesData && Array.isArray(expensesData) ? expensesData : [];
  
  const { data: propertiesData } = useProperties(organizationId);
  const properties = propertiesData && Array.isArray(propertiesData) ? propertiesData : [];
  
  const createExpense = useCreateExpense();

  // Mortgage state
  const [mortgageData, setMortgageData] = useState(null);
  const { loading: mortgageLoading, withLoading: withMortgageLoading } = useLoading();
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Ticket view modal state
  const { isOpen: ticketModalOpen, open: openTicketModal, close: closeTicketModal, editingItem: selectedTicket, setEditingItem: setSelectedTicket } = useModalState();
  const { loading: ticketLoading, withLoading: withTicketLoading } = useLoading();

  // Dashboard data - TODO: implement v2 analytics endpoint
  const dashboard = null;

  // Load mortgage data when mortgage tab is active
  const loadMortgageData = useCallback(async () => {
    await withMortgageLoading(async () => {
      try {
        const { apiClient } = await import('@/lib/utils/api-client');
        const response = await apiClient('/api/v2/analytics/mortgage', {
          method: 'GET',
        });
        const data = await response.json();
        if (data.success && data.data) {
          setMortgageData(data.data);
        } else {
          setMortgageData(data);
        }
      } catch (error) {
        console.error('Error loading mortgage data:', error);
      }
    });
  }, [withMortgageLoading]);

  useEffect(() => {
    if (activeTab === 'mortgage' && !mortgageData) {
      loadMortgageData();
    }
  }, [activeTab, mortgageData, loadMortgageData]);

  const handleViewTicket = useCallback(async (ticketId) => {
    await withTicketLoading(async () => {
      try {
        const { v2Api } = await import('@/lib/api/v2-client');
        const ticketData = await v2Api.maintenance.get(ticketId);
        const ticket = ticketData.data || ticketData;
        if (ticket) {
          setSelectedTicket(ticket);
          openTicketModal();
        }
      } catch (error) {
        console.error('Error loading ticket:', error);
        notify.error('Failed to load ticket details');
      }
    });
  }, [fetchApi, withTicketLoading, openTicketModal, setSelectedTicket]);

  const handleApproveExpense = useCallback(async (approvalId) => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      await adminApi.approveApproval(approvalId, null);
      notify.success('Expense approved successfully');
      refetchExpenses();
    } catch (error) {
      console.error('Error approving expense:', error);
      notify.error(error.message || 'Failed to approve expense');
    }
  }, [refetchExpenses]);

  const { isOpen: rejectModalOpen, open: openRejectModal, close: closeRejectModal, editingItem: rejectingApprovalId, openForEdit: openRejectModalForEdit } = useModalState();
  const rejectForm = useFormState();

  const handleRejectExpense = useCallback((approvalId) => {
    openRejectModalForEdit(approvalId);
    rejectForm.resetFields();
  }, [rejectForm, openRejectModalForEdit]);

  const handleRejectSubmit = useCallback(async (values) => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      await adminApi.rejectApproval(rejectingApprovalId, values.reason);
      notify.success('Expense rejected');
      closeRejectModal();
      rejectForm.resetFields();
      refetchExpenses();
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      console.error('Error rejecting expense:', error);
      notify.error(error.message || 'Failed to reject expense');
    }
  }, [refetchExpenses, rejectForm, rejectingApprovalId, closeRejectModal]);

  // Listen for expense updates
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleExpenseUpdate = () => {
      refetchExpenses();
    };

    window.addEventListener('expenseUpdated', handleExpenseUpdate);
    
    return () => {
      window.removeEventListener('expenseUpdated', handleExpenseUpdate);
    };
  }, [refetchExpenses]);

  // Expenses and properties are loaded via v2 API hooks above

  const handleAddExpense = useCallback(async (values) => {
    try {
      let dateString;
      if (dayjs.isDayjs(values.date)) {
        dateString = values.date.format('YYYY-MM-DD');
      } else if (values.date instanceof Date) {
        const { year, month, day } = getDateComponents(values.date);
        dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else {
        dateString = formatDateForInput(values.date);
      }
      
      await createExpense.mutateAsync({
        organization_id: organizationId,
        category: values.category,
        amount: parseFloat(values.amount),
        expense_date: dateString,
        description: values.description,
        property_id: values.propertyId || null,
        work_order_id: values.workOrderId || null,
        vendor_id: values.vendorId || null,
      });
      
      notify.success('Expense added successfully');
      closeExpenseModal();
      form.reset();
      refetchExpenses();
    } catch (error) {
      console.error('[FinancialsClient] Error adding expense:', error);
      notify.error(error.message || 'Failed to add expense');
    }
  }, [createExpense, organizationId, form, closeExpenseModal, refetch]);

  const handleExportCSV = useCallback(() => {
    try {
      const headers = ['Date', 'Category', 'Description', 'Paid To', 'Amount', 'Payment Method'];
      const rows = expenses.map(exp => [
        formatDateForAPI(exp.expense_date || exp.date),
        exp.category,
        exp.description || '',
        exp.vendor?.company_name || exp.paidTo || '',
        parseFloat(exp.amount || 0).toFixed(2),
        exp.payment_method || exp.paymentMethod || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses_${formatDateForAPI(new Date())}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notify.success('Expenses exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      notify.error('Failed to export expenses');
    }
  }, [expenses]);

  const handleExportReport = useCallback(() => {
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        summary: {
          totalIncome: dashboard?.totalIncome || 0,
          totalExpenses: dashboard?.totalExpenses || 0,
          netIncome: dashboard?.netIncome || 0,
          occupancyRate: dashboard?.occupancyRate || 0
        },
        expenses: expenses.map(exp => ({
          date: formatDateForAPI(exp.expense_date || exp.date),
          category: exp.category,
          amount: parseFloat(exp.amount || 0),
          description: exp.description || '',
          paidTo: exp.vendor?.company_name || exp.paidTo || '',
          paymentMethod: exp.payment_method || exp.paymentMethod || ''
        }))
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial_report_${formatDateForAPI(new Date())}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notify.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      notify.error('Failed to export report');
    }
  }, [dashboard, expenses]);

  // Memoize expense columns
  const expenseColumns = useMemo(() => [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (_, record) => renderDate(record.date),
      width: 120,
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Badge color="blue">{cat}</Badge>,
      width: 120
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span>{text || '—'}</span>,
      width: 200
    },
    {
      title: 'Ticket Number',
      key: 'ticketNumber',
      render: (_, record) => {
        if (!record.maintenanceRequest || !record.maintenanceRequest.ticketNumber) {
          return <span className="text-gray-400">—</span>;
        }
        return (
          <button
            onClick={async (e) => {
              e.preventDefault();
              await handleViewTicket(record.maintenanceRequest.id);
            }}
            className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
            title={`View ticket ${record.maintenanceRequest.ticketNumber}`}
          >
            <HiCog className="h-4 w-4" />
            {record.maintenanceRequest.ticketNumber}
          </button>
        );
      },
      width: 150,
      align: 'center'
    },
    {
      title: 'Property',
      dataIndex: 'property',
      key: 'property',
      render: (property, record) => {
        const prop = property || record.maintenanceRequest?.property;
        if (!prop) return 'N/A';
        return prop.propertyName || prop.addressLine1 || 'N/A';
      },
      width: 150
    },
    {
      title: 'Paid To',
      dataIndex: 'paidTo',
      key: 'paidTo',
      width: 150
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span className="font-semibold text-red-600">
          ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
      width: 120,
      align: 'right',
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120
    },
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      title: 'Approval Status',
      width: 150,
      render: (_, record) => {
        if (!record.pmcApprovalRequest) {
          return <Badge color="gray">No Approval Needed</Badge>;
        }
        const status = record.pmcApprovalRequest.status;
        return renderStatus(status, {
          customColors: {
            'PENDING': 'warning',
            'APPROVED': 'success',
            'REJECTED': 'failure',
            'CANCELLED': 'gray'
          }
        });
      },
    }),
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => {
        if (!record.pmcApprovalRequest || record.pmcApprovalRequest.status !== 'PENDING') {
          return null;
        }
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              color="blue"
              onClick={() => handleApproveExpense(record.pmcApprovalRequest.id)}
            >
              <HiCheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              color="failure"
              onClick={() => handleRejectExpense(record.pmcApprovalRequest.id)}
            >
              <HiXCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        );
      },
    }
  ], [handleViewTicket, handleApproveExpense, handleRejectExpense]);

  // Memoize payment columns
  const paymentColumns = useMemo(() => [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (_, record) => renderDate(record.date),
      width: 120,
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
    },
    {
      title: 'Property',
      dataIndex: 'property',
      key: 'property',
      render: (text) => (
        <div className="flex items-center gap-2">
          <HiHome className="h-4 w-4" />
          <span>{text}</span>
        </div>
      ),
      width: 150
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 100
    },
    {
      title: 'Tenant',
      dataIndex: 'tenant',
      key: 'tenant',
      render: (text) => (
        <div className="flex items-center gap-2">
          <HiUser className="h-4 w-4" />
          <span>{text}</span>
        </div>
      ),
      width: 150
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Badge color="success" className="text-sm font-bold">
          ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Badge>
      ),
      width: 120,
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120
    }
  ], []);

  // Configure expense columns
  const configuredExpenseColumns = configureTableColumns(expenseColumns);
  
  // Use resizable table hook for expenses
  const { tableProps: expenseTableProps } = useResizableTable(configuredExpenseColumns, {
    storageKey: 'financials-expenses-table',
    defaultSort: { field: 'date', order: 'descend' },
  });

  // Configure payment columns
  const configuredPaymentColumns = configureTableColumns(paymentColumns);
  
  // Use resizable table hook for payments
  const { tableProps: paymentTableProps } = useResizableTable(configuredPaymentColumns, {
    storageKey: 'financials-payments-table',
    defaultSort: { field: 'date', order: 'descend' },
  });

  // Process chart data
  const { pieData, trendData } = useMemo(() => {
    let pie = [];
    let trend = [];
    
    try {
      pie = processExpensesByCategory(expenses);
      trend = processMonthlyTrend(expenses, 'date', 'amount');
    } catch (chartError) {
      console.error('[FinancialsClient] Error processing chart data:', chartError);
      pie = [];
      trend = [];
    }
    
    return { pieData: pie, trendData: trend };
  }, [expenses]);

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const values = form.getFieldsValue();
      await handleAddExpense(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Handle reject form submission
  const handleRejectFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const values = rejectForm.getFieldsValue();
      await handleRejectSubmit(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  return (
    <PageLayout
      headerTitle="Financial Dashboard"
      headerActions={[
        <Button
          key="add-expense"
          color="blue"
          onClick={openExpenseModal}
          className="flex items-center gap-2"
        >
          <HiPlus className="h-4 w-4" />
          Add Expense
        </Button>,
        <Button
          key="export-csv"
          color="gray"
          onClick={handleExportCSV}
          className="flex items-center gap-2"
        >
          <HiDownload className="h-4 w-4" />
          Export CSV
        </Button>,
        <Button
          key="export-report"
          color="gray"
          onClick={handleExportReport}
          className="flex items-center gap-2"
        >
          <HiDocumentText className="h-4 w-4" />
          Export Report
        </Button>
      ]}
    >
      {/* All Metrics in One Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-sm font-semibold mb-3 text-center text-gray-700">
            Total Income
          </div>
          <div className="flex justify-between items-center gap-3">
            <div className="flex-1 text-center border-r border-gray-200 pr-3">
              <div className="text-xs text-gray-500 mb-1">MTD</div>
              <div className="text-lg font-bold text-green-600">
                ${(dashboard?.totalIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex-1 text-center pl-3">
              <div className="text-xs text-gray-500 mb-1">YTD</div>
              <div className="text-lg font-bold text-green-600">
                ${(dashboard?.totalIncomeYTD || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-sm font-semibold mb-3 text-center text-gray-700">
            Total Expenses
          </div>
          <div className="flex justify-between items-center gap-3">
            <div className="flex-1 text-center border-r border-gray-200 pr-3">
              <div className="text-xs text-gray-500 mb-1">MTD</div>
              <div className="text-lg font-bold text-red-600">
                ${(dashboard?.totalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex-1 text-center pl-3">
              <div className="text-xs text-gray-500 mb-1">YTD</div>
              <div className="text-lg font-bold text-red-600">
                ${(dashboard?.totalExpensesYTD || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-sm font-semibold mb-3 text-center text-gray-700">
            Net Income
          </div>
          <div className="flex justify-between items-center gap-3">
            <div className="flex-1 text-center border-r border-gray-200 pr-3">
              <div className="text-xs text-gray-500 mb-1">MTD</div>
              <div className={`text-lg font-bold ${(dashboard?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(dashboard?.netIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex-1 text-center pl-3">
              <div className="text-xs text-gray-500 mb-1">YTD</div>
              <div className={`text-lg font-bold ${(dashboard?.netIncomeYTD || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(dashboard?.netIncomeYTD || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <FlowbiteStatistic
            title="Occupancy Rate"
            value={dashboard?.occupancyRate || 0}
            precision={1}
            suffix="%"
          />
        </Card>
      </div>

      {/* Tabs for different views */}
      <Card>
        <Tabs aria-label="Financial tabs" onActiveTabChange={(tab) => setActiveTab(tab)}>
          <Tabs.Item active={activeTab === 'expenses'} title="Expenses">
            <TableWrapper>
              <FlowbiteTable
                {...expenseTableProps}
                dataSource={expenses}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </TableWrapper>
          </Tabs.Item>
          
          <Tabs.Item active={activeTab === 'income'} title="Income">
            {dashboard?.recentPayments && dashboard.recentPayments.length > 0 ? (
              <TableWrapper>
                <FlowbiteTable
                  {...paymentTableProps}
                  dataSource={dashboard.recentPayments}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              </TableWrapper>
            ) : (
              <div className="text-center py-12 text-gray-500">No payments recorded</div>
            )}
          </Tabs.Item>
          
          <Tabs.Item active={activeTab === 'mortgage'} title={
            <div className="flex items-center gap-2">
              <HiCurrencyDollar className="h-4 w-4" />
              <span>Mortgage</span>
            </div>
          }>
            {mortgageLoading ? (
              <div className="text-center py-12">
                <Spinner size="xl" />
                <div className="mt-4 text-gray-600">Loading mortgage data...</div>
              </div>
            ) : !mortgageData || !mortgageData.properties || mortgageData.properties.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2">No mortgage data available</p>
                <p className="text-sm">Add mortgage information to your properties to see payment breakdowns here.</p>
              </div>
            ) : (
              <div>
                {mortgageData.totals && (
                  <Card className="mb-6">
                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Interest Paid (To Date)</div>
                        <div className="text-xl font-bold text-red-600">
                          <CurrencyDisplay value={mortgageData.totals.totalInterest} country="CA" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Principal Paid (To Date)</div>
                        <div className="text-xl font-bold text-green-600">
                          <CurrencyDisplay value={mortgageData.totals.totalPrincipal} country="CA" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Total Paid (To Date)</div>
                        <div className="text-xl font-bold">
                          <CurrencyDisplay value={mortgageData.totals.totalAmount} country="CA" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Remaining Balance</div>
                        <div className="text-xl font-bold text-blue-600">
                          <CurrencyDisplay value={mortgageData.totals.totalRemainingBalance} country="CA" />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {!selectedProperty ? (
                  <Card>
                    <h3 className="text-lg font-semibold mb-4">Properties with Mortgages</h3>
                    <FlowbiteTable
                      dataSource={mortgageData.properties}
                      rowKey="propertyId"
                      pagination={{ pageSize: 10 }}
                      columns={[
                        {
                          title: 'Property',
                          key: 'property',
                          render: (_, record) => (
                            <div>
                              <div className="font-semibold">{record.propertyName}</div>
                              <div className="text-sm text-gray-500">{record.address}</div>
                            </div>
                          ),
                        },
                        {
                          title: 'Mortgage Amount',
                          key: 'mortgageAmount',
                          align: 'right',
                          render: (_, record) => (
                            <CurrencyDisplay value={record.mortgageAmount} country="CA" strong />
                          ),
                        },
                        {
                          title: 'Interest Rate',
                          key: 'interestRate',
                          align: 'center',
                          render: (_, record) => (
                            <Badge color="blue">{record.interestRate}%</Badge>
                          ),
                        },
                        {
                          title: 'Term',
                          key: 'term',
                          align: 'center',
                          render: (_, record) => (
                            <span>{record.termYears} years</span>
                          ),
                        },
                        {
                          title: 'Payment Frequency',
                          key: 'frequency',
                          align: 'center',
                          render: (_, record) => (
                            <Badge color={record.paymentFrequency === 'biweekly' ? 'success' : 'warning'}>
                              {record.paymentFrequency === 'biweekly' ? 'Bi-weekly' : 'Monthly'}
                            </Badge>
                          ),
                        },
                        {
                          title: 'Total Interest',
                          key: 'totalInterest',
                          align: 'right',
                          render: (_, record) => (
                            <span className="font-semibold text-red-600">
                              <CurrencyDisplay value={record.summary.totalInterest} country="CA" />
                            </span>
                          ),
                        },
                        {
                          title: 'Remaining Balance',
                          key: 'remainingBalance',
                          align: 'right',
                          render: (_, record) => (
                            <span className="font-semibold text-green-600">
                              <CurrencyDisplay value={record.summary.remainingBalance} country="CA" />
                            </span>
                          ),
                        },
                        {
                          title: 'Actions',
                          key: 'actions',
                          align: 'center',
                          render: (_, record) => (
                            <button
                              onClick={() => setSelectedProperty(record)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View Breakdown
                            </button>
                          ),
                        },
                      ]}
                    />
                  </Card>
                ) : (
                  <div>
                    <Card className="mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <button
                            onClick={() => setSelectedProperty(null)}
                            className="text-blue-600 hover:text-blue-800 mr-4"
                          >
                            ← Back to Properties
                          </button>
                          <span className="font-semibold">{selectedProperty.propertyName}</span>
                          <span className="ml-2 text-gray-500">{selectedProperty.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge color="blue">{selectedProperty.interestRate}% interest</Badge>
                          <Badge color={selectedProperty.paymentFrequency === 'biweekly' ? 'success' : 'warning'}>
                            {selectedProperty.paymentFrequency === 'biweekly' ? 'Bi-weekly' : 'Monthly'} payments
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-gray-500">Mortgage Amount: </span>
                          <span className="font-semibold">
                            <CurrencyDisplay value={selectedProperty.mortgageAmount} country="CA" />
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Interest Paid (To Date): </span>
                          <span className="font-semibold text-red-600">
                            <CurrencyDisplay value={selectedProperty.summary.totalInterest} country="CA" />
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Principal Paid (To Date): </span>
                          <span className="font-semibold text-green-600">
                            <CurrencyDisplay value={selectedProperty.summary.totalPrincipal} country="CA" />
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Remaining Balance: </span>
                          <span className="font-semibold text-green-600">
                            <CurrencyDisplay value={selectedProperty.summary.remainingBalance} country="CA" />
                          </span>
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <h3 className="text-lg font-semibold mb-4">Payment Breakdown (Paid to Date)</h3>
                      <FlowbiteTable
                        dataSource={selectedProperty.breakdown}
                        rowKey="paymentNumber"
                        pagination={{ 
                          pageSize: 50,
                          showSizeChanger: true,
                          showTotal: (total) => `${total} payments made to date`
                        }}
                        columns={[
                          {
                            title: 'Payment #',
                            dataIndex: 'paymentNumber',
                            key: 'paymentNumber',
                            width: 100,
                            align: 'center',
                          },
                          {
                            title: 'Payment Date',
                            dataIndex: 'date',
                            key: 'date',
                            width: 150,
                            render: (_, record) => renderDate(record.date),
                          },
                          {
                            title: 'Payment Amount',
                            dataIndex: 'paymentAmount',
                            key: 'paymentAmount',
                            align: 'right',
                            width: 150,
                            render: (amount) => (
                              <CurrencyDisplay value={amount} country="CA" strong />
                            ),
                          },
                          {
                            title: 'Principal',
                            dataIndex: 'principal',
                            key: 'principal',
                            align: 'right',
                            width: 150,
                            render: (principal) => (
                              <span className="font-semibold text-green-600">
                                <CurrencyDisplay value={principal} country="CA" />
                              </span>
                            ),
                          },
                          {
                            title: 'Interest',
                            dataIndex: 'interest',
                            key: 'interest',
                            align: 'right',
                            width: 150,
                            render: (interest) => (
                              <span className="font-semibold text-red-600">
                                <CurrencyDisplay value={interest} country="CA" />
                              </span>
                            ),
                          },
                          {
                            title: 'Remaining Balance',
                            dataIndex: 'remainingBalance',
                            key: 'remainingBalance',
                            align: 'right',
                            width: 180,
                            render: (balance) => (
                              <CurrencyDisplay value={balance} country="CA" />
                            ),
                          },
                        ]}
                      />
                    </Card>
                  </div>
                )}
              </div>
            )}
          </Tabs.Item>
          
          <Tabs.Item active={activeTab === 'charts'} title={
            <div className="flex items-center gap-2">
              <HiChartBar className="h-4 w-4" />
              <span>Charts</span>
            </div>
          }>
            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-semibold mb-4">Income vs Expenses (Last 6 Months)</h3>
                {loading ? (
                  <div className="h-96 flex items-center justify-center">
                    <span>Loading chart...</span>
                  </div>
                ) : dashboard?.incomeTrends && dashboard.incomeTrends.length > 0 ? (
                  <IncomeExpensesChart data={dashboard.incomeTrends} />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No trend data available</p>
                    {dashboard && !dashboard.incomeTrends && (
                      <p className="text-sm mt-2">Dashboard loaded but incomeTrends is missing</p>
                    )}
                    {!dashboard && (
                      <p className="text-sm mt-2">Dashboard data not loaded yet</p>
                    )}
                  </div>
                )}
              </Card>
              
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
                  {loading ? (
                    <div className="h-72 flex items-center justify-center">
                      <span>Loading chart...</span>
                    </div>
                  ) : pieData.length > 0 ? (
                    <ExpensesPieChart data={pieData} />
                  ) : (
                    <div className="text-center py-12 text-gray-500">No expense data</div>
                  )}
                </Card>
                
                <Card>
                  <h3 className="text-lg font-semibold mb-4">Monthly Expense Trend</h3>
                  {loading ? (
                    <div className="h-72 flex items-center justify-center">
                      <span>Loading chart...</span>
                    </div>
                  ) : trendData.length > 0 ? (
                    <MonthlyExpenseChart data={trendData} />
                  ) : (
                    <div className="text-center py-12 text-gray-500">No expense trend data</div>
                  )}
                </Card>
              </div>
              
              {dashboard?.propertyIncomeBreakdown && Object.keys(dashboard.propertyIncomeBreakdown).length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold mb-4">Income by Property (This Month)</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {Object.entries(dashboard.propertyIncomeBreakdown).map(([property, amount]) => (
                      <Card key={property} className="p-4">
                        <FlowbiteStatistic
                          title={property}
                          value={typeof amount === 'number' ? amount : 0}
                          precision={2}
                          prefix="$"
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Card>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </Tabs.Item>
        </Tabs>
      </Card>

      {/* Add Expense Modal */}
      <Modal
        show={expenseModalOpen}
        onClose={() => {
          closeExpenseModal();
          form.resetFields();
        }}
        size="md"
      >
        <Modal.Header>Add Expense</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="propertyId" className="mb-2">Property (Optional)</Label>
              <Select
                id="propertyId"
                name="propertyId"
                value={form.values.propertyId || ''}
                onChange={(e) => form.setFieldsValue({ propertyId: e.target.value || undefined })}
              >
                <option value="">Select a property</option>
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>
                    {prop.propertyName || prop.addressLine1}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="category" className="mb-2">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                id="category"
                name="category"
                value={form.values.category || ''}
                onChange={(e) => form.setFieldsValue({ category: e.target.value })}
                required
                color={form.errors.category ? 'failure' : 'gray'}
                helperText={form.errors.category}
              >
                <option value="">Select category</option>
                <option value="repairs">Repairs</option>
                <option value="utilities">Utilities</option>
                <option value="insurance">Insurance</option>
                <option value="taxes">Property Taxes</option>
                <option value="legal">Legal</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount" className="mb-2">
                Amount <span className="text-red-500">*</span>
              </Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg">
                  $
                </span>
                <TextInput
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={form.values.amount || ''}
                  onChange={(e) => form.setFieldsValue({ amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                  required
                  className="rounded-l-none"
                  color={form.errors.amount ? 'failure' : 'gray'}
                  helperText={form.errors.amount}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="date" className="mb-2">
                Date <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="date"
                name="date"
                type="date"
                value={form.values.date || ''}
                onChange={(e) => form.setFieldsValue({ date: e.target.value })}
                required
                color={form.errors.date ? 'failure' : 'gray'}
                helperText={form.errors.date}
              />
            </div>

            <div>
              <Label htmlFor="description" className="mb-2">
                Description <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={form.values.description || ''}
                onChange={(e) => form.setFieldsValue({ description: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="paidTo" className="mb-2">Paid To</Label>
              <TextInput
                id="paidTo"
                name="paidTo"
                value={form.values.paidTo || ''}
                onChange={(e) => form.setFieldsValue({ paidTo: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod" className="mb-2">Payment Method</Label>
              <Select
                id="paymentMethod"
                name="paymentMethod"
                value={form.values.paymentMethod || ''}
                onChange={(e) => form.setFieldsValue({ paymentMethod: e.target.value })}
              >
                <option value="">Select payment method</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
              </Select>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                color="gray"
                onClick={() => {
                  closeExpenseModal();
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" color="blue" disabled={submittingExpense}>
                {submittingExpense ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add'
                )}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Ticket View Modal */}
      {ticketModalOpen && selectedTicket && (
        <TicketViewModal
          ticket={selectedTicket}
          open={ticketModalOpen}
          onClose={() => {
            closeTicketModal();
            setSelectedTicket(null);
          }}
          userRole="landlord"
          loading={ticketLoading}
          readOnly={true}
        />
      )}

      {/* Reject Approval Modal */}
      <Modal
        show={rejectModalOpen}
        onClose={() => {
          closeRejectModal();
          rejectForm.resetFields();
        }}
        size="md"
      >
        <Modal.Header>Reject Approval Request</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleRejectFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reason" className="mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="reason"
                name="reason"
                rows={4}
                value={rejectForm.values.reason || ''}
                onChange={(e) => rejectForm.setFieldsValue({ reason: e.target.value })}
                placeholder="Enter rejection reason..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                color="gray"
                onClick={() => {
                  closeRejectModal();
                  rejectForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" color="failure">
                Reject
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </PageLayout>
  );
}
