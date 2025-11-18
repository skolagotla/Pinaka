"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Statistic, Table, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, Tabs, Empty, Typography, Spin, Badge, Divider, Avatar, Tooltip } from 'antd';
import { PageLayout, TableWrapper, StandardModal, FormTextInput, FormSelect, FormDatePicker, renderDate } from '@/components/shared';
import { renderStatus } from '@/components/shared/TableRenderers';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { DollarOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, FileTextOutlined, DownloadOutlined, BarChartOutlined, HomeOutlined, UserOutlined, ToolOutlined, BankOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useDataLoader, useTabNavigation, useModalState, useFormSubmission, useResizableTable } from '@/lib/hooks';
import { configureTableColumns } from '@/lib/utils/table-config';
import { processExpensesByCategory, processMonthlyTrend } from '@/lib/utils/chartDataProcessors';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { formatDateForInput, getDateComponents } from '@/lib/utils/date-utils';
import { formatDateDisplay, formatDateForAPI } from '@/lib/utils/safe-date-formatter';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';

// Dynamically import Recharts components to avoid SSR issues
const IncomeExpensesChart = dynamic(
  () => import('@/components/charts/IncomeExpensesChart'),
  { ssr: false, loading: () => <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div> }
);

const ExpensesPieChart = dynamic(
  () => import('@/components/charts/ExpensesPieChart'),
  { ssr: false, loading: () => <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div> }
);

const MonthlyExpenseChart = dynamic(
  () => import('@/components/charts/MonthlyExpenseChart'),
  { ssr: false, loading: () => <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div> }
);

// Lazy load TicketViewModal - only loads when viewing a ticket (reduces initial bundle size)
const TicketViewModal = dynamic(
  () => import('@/components/shared/TicketViewModal'),
  { ssr: false, loading: () => <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading ticket details...</div> }
);

const { Text } = Typography;

export default function FinancialsClient() {
  const router = useRouter();
  const { fetch: fetchApi } = useUnifiedApi({ showUserMessage: false });
  // Note: Chart components from useChartComponents are not used - we use recharts directly
  // const { Line, Column, Pie, DualAxes, ChartLoader } = useChartComponents();
  const { activeTab, setActiveTab } = useTabNavigation({ 
    defaultTab: 'expenses',
    tabs: ['expenses', 'income', 'mortgage', 'charts']
  });
  const { isOpen: expenseModalOpen, open: openExpenseModal, close: closeExpenseModal, reset: resetExpenseModal } = useModalState();
  const [form] = Form.useForm();

  // Mortgage state
  const [mortgageData, setMortgageData] = useState(null);
  const { loading: mortgageLoading, withLoading: withMortgageLoading } = useLoading();
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Ticket view modal state
  const { isOpen: ticketModalOpen, open: openTicketModal, close: closeTicketModal, editingItem: selectedTicket, setEditingItem: setSelectedTicket } = useModalState();
  const { loading: ticketLoading, withLoading: withTicketLoading } = useLoading();

  // Use the new useDataLoader hook for cleaner data fetching (v1 API)
  const { 
    data, 
    loading, 
    refetch,
    error: dataLoaderError
  } = useDataLoader({
    endpoints: {
      dashboard: '/api/financials/dashboard', // Keep legacy dashboard endpoint
      expenses: '/api/v1/expenses', // v1 endpoint
      properties: '/api/v1/properties' // v1 endpoint
    },
    showUserMessages: false,
    onError: (err) => {
      console.error('[FinancialsClient] Data loading error:', err);
    }
  });

  // Load mortgage data when mortgage tab is active - Memoized function
  const loadMortgageData = useCallback(async () => {
    await withMortgageLoading(async () => {
      try {
        const response = await fetchApi(
          '/api/financials/mortgage',
          { method: 'GET' },
          { operation: 'Load mortgage data', showUserMessage: false }
        );
        if (response) {
          const data = await response.json();
          setMortgageData(data);
        }
      } catch (error) {
        console.error('Error loading mortgage data:', error);
      }
    });
  }, [fetchApi, withMortgageLoading]);

  useEffect(() => {
    if (activeTab === 'mortgage' && !mortgageData) {
      loadMortgageData();
    }
  }, [activeTab, mortgageData, loadMortgageData]);

  const handleViewTicket = useCallback(async (ticketId) => {
    await withTicketLoading(async () => {
      try {
        const response = await fetchApi(
          `/api/maintenance/${ticketId}`,
          { method: 'GET' },
          { operation: 'Load ticket details', showUserMessage: false }
        );
        if (response) {
          const ticket = await response.json();
          setSelectedTicket(ticket);
          openTicketModal();
        }
      } catch (error) {
        console.error('Error loading ticket:', error);
        notify.error('Failed to load ticket details');
      }
    });
  }, [fetchApi, withTicketLoading]);

  const handleApproveExpense = useCallback(async (approvalId) => {
    try {
      const response = await fetchApi(
        `/api/approvals/${approvalId}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: null }),
        },
        { operation: 'Approve expense', showUserMessage: true }
      );
      if (response && response.ok) {
        notify.success('Expense approved successfully');
        refetch();
      }
    } catch (error) {
      console.error('Error approving expense:', error);
    }
  }, [fetchApi, refetch]);

  const { isOpen: rejectModalOpen, open: openRejectModal, close: closeRejectModal, editingItem: rejectingApprovalId, openForEdit: openRejectModalForEdit } = useModalState();
  const [rejectForm] = Form.useForm();

  const handleRejectExpense = useCallback((approvalId) => {
    openRejectModalForEdit(approvalId);
    rejectForm.resetFields();
  }, [rejectForm, openRejectModalForEdit]);

  const handleRejectSubmit = useCallback(async (values) => {
    try {
      const response = await fetchApi(
        `/api/approvals/${rejectingApprovalId}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: values.reason }),
        },
        { operation: 'Reject expense', showUserMessage: true }
      );
      if (response.success) {
        notify.success('Expense rejected');
        closeRejectModal();
        rejectForm.resetFields();
        refetch();
      }
    } catch (error) {
      if (error.errorFields) {
        // Form validation error, don't show message
        return;
      }
      console.error('Error rejecting expense:', error);
    }
  }, [fetchApi, refetch, rejectForm, rejectingApprovalId]);

  // Listen for expense updates from other parts of the app (e.g., maintenance tickets)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleExpenseUpdate = () => {
      // Refresh expenses when updated elsewhere
      refetch();
    };

    window.addEventListener('expenseUpdated', handleExpenseUpdate);
    
    return () => {
      window.removeEventListener('expenseUpdated', handleExpenseUpdate);
    };
  }, [refetch]);

  // Extract data with fallbacks - memoized to prevent unnecessary recalculations
  const dashboard = useMemo(() => data?.dashboard || null, [data?.dashboard]);
  const expenses = useMemo(() => Array.isArray(data?.expenses) ? data.expenses : [], [data?.expenses]);
  const properties = useMemo(() => Array.isArray(data?.properties) ? data.properties : (data?.properties?.properties || []), [data?.properties]);

  const { submit: submitExpense, submitting: submittingExpense } = useFormSubmission({
    endpoint: '/api/v1/expenses', // v1 endpoint
    method: 'POST',
    successMessage: 'Expense added successfully',
    transformData: (values) => {
      // Extract local date components to avoid UTC conversion
      let dateString;
      if (dayjs.isDayjs(values.date)) {
        // If it's already a dayjs object, format it directly
        dateString = values.date.format('YYYY-MM-DD');
      } else if (values.date instanceof Date) {
        // Extract local date components from Date object
        const { year, month, day } = getDateComponents(values.date);
        dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else {
        // Fallback: use formatDateForInput
        dateString = formatDateForInput(values.date);
      }
      
      return {
        ...values,
        date: dateString
      };
    },
    onSuccess: () => {
      closeExpenseModal();
      form.resetFields();
      refetch();
    }
  });

  const handleAddExpense = useCallback(async (values) => {
    await submitExpense(values);
  }, [submitExpense]);

  const handleExportCSV = useCallback(() => {
    try {
      // Prepare CSV data
      const headers = ['Date', 'Category', 'Description', 'Paid To', 'Amount', 'Payment Method'];
      const rows = expenses.map(exp => [
        formatDateForAPI(exp.date),
        exp.category,
        exp.description,
        exp.paidTo || '',
        exp.amount.toFixed(2),
        exp.paymentMethod || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create download link
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
      // Generate comprehensive report
      const reportData = {
        generatedAt: new Date().toISOString(),
        summary: {
          totalIncome: dashboard?.totalIncome || 0,
          totalExpenses: dashboard?.totalExpenses || 0,
          netIncome: dashboard?.netIncome || 0,
          occupancyRate: dashboard?.occupancyRate || 0
        },
        expenses: expenses.map(exp => ({
          date: formatDateForAPI(exp.date),
          category: exp.category,
          amount: exp.amount,
          description: exp.description,
          paidTo: exp.paidTo,
          paymentMethod: exp.paymentMethod
        }))
      };

      // Create download link
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

  // Memoize expense columns to prevent recreation on every render
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
      render: (cat) => <Tag color="blue">{cat}</Tag>,
      width: 120
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <Text>{text || '—'}</Text>,
      width: 200
    },
    {
      title: 'Ticket Number',
      key: 'ticketNumber',
      render: (_, record) => {
        if (!record.maintenanceRequest || !record.maintenanceRequest.ticketNumber) {
          return <Text type="secondary">—</Text>;
        }
        return (
          <a
            onClick={async (e) => {
              e.preventDefault();
              // Fetch and display ticket in modal
              await handleViewTicket(record.maintenanceRequest.id);
            }}
            style={{ cursor: 'pointer', color: '#1890ff' }}
            title={`View ticket ${record.maintenanceRequest.ticketNumber}`}
          >
            <ToolOutlined style={{ marginRight: 4 }} />
            {record.maintenanceRequest.ticketNumber}
          </a>
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
        <Text strong style={{ color: '#ff4d4f' }}>
          ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
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
          return <Tag>No Approval Needed</Tag>;
        }
        const status = record.pmcApprovalRequest.status;
        return renderStatus(status, {
          customColors: {
            'PENDING': 'orange',
            'APPROVED': 'green',
            'REJECTED': 'red',
            'CANCELLED': 'default'
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
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApproveExpense(record.pmcApprovalRequest.id)}
            >
              Approve
            </Button>
            <Button
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleRejectExpense(record.pmcApprovalRequest.id)}
            >
              Reject
            </Button>
          </Space>
        );
      },
    }
  ], [handleViewTicket]);

  // Memoize payment columns to prevent recreation on every render
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
        <Space>
          <HomeOutlined />
          {text}
        </Space>
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
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
      width: 150
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Tag color="green" style={{ fontSize: 14, fontWeight: 'bold' }}>
          ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Tag>
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

  // Configure expense columns with standard settings
  const configuredExpenseColumns = configureTableColumns(expenseColumns);
  
  // Use resizable table hook for expenses
  const { tableProps: expenseTableProps } = useResizableTable(configuredExpenseColumns, {
    storageKey: 'financials-expenses-table',
    defaultSort: { field: 'date', order: 'descend' },
  });

  // Configure payment columns with standard settings
  const configuredPaymentColumns = configureTableColumns(paymentColumns);
  
  // Use resizable table hook for payments
  const { tableProps: paymentTableProps } = useResizableTable(configuredPaymentColumns, {
    storageKey: 'financials-payments-table',
    defaultSort: { field: 'date', order: 'descend' },
  });

  // Use chart data processors for cleaner data transformation
  // Process chart data with error handling - memoized to prevent recalculation on every render
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

  return (
    <PageLayout
      title="Financial Dashboard"
      actions={[
        {
          key: 'add-expense',
          icon: <PlusOutlined />,
          label: 'Add Expense',
          type: 'primary',
          onClick: openExpenseModal
        },
        {
          key: 'export-csv',
          icon: <DownloadOutlined />,
          label: 'Export CSV',
          onClick: handleExportCSV
        },
        {
          key: 'export-report',
          icon: <FileTextOutlined />,
          label: 'Export Report',
          onClick: handleExportReport
        }
      ]}
    >

      {/* All Metrics in One Row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card styles={{ body: { padding: '16px' } }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#262626', textAlign: 'center' }}>
              Total Income
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #f0f0f0', paddingRight: 12 }}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>MTD</div>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#3f8600' }}>
                  ${(dashboard?.totalIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', paddingLeft: 12 }}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>YTD</div>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#3f8600' }}>
                  ${(dashboard?.totalIncomeYTD || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '16px' } }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#262626', textAlign: 'center' }}>
              Total Expenses
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #f0f0f0', paddingRight: 12 }}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>MTD</div>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#cf1322' }}>
                  ${(dashboard?.totalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', paddingLeft: 12 }}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>YTD</div>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#cf1322' }}>
                  ${(dashboard?.totalExpensesYTD || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '16px' } }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#262626', textAlign: 'center' }}>
              Net Income
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #f0f0f0', paddingRight: 12 }}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>MTD</div>
                <div style={{ 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  color: (dashboard?.netIncome || 0) >= 0 ? '#3f8600' : '#cf1322'
                }}>
                  ${(dashboard?.netIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', paddingLeft: 12 }}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>YTD</div>
                <div style={{ 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  color: (dashboard?.netIncomeYTD || 0) >= 0 ? '#3f8600' : '#cf1322'
                }}>
                  ${(dashboard?.netIncomeYTD || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '16px' } }}>
            <Statistic
              title="Occupancy Rate"
              value={dashboard?.occupancyRate || 0}
              precision={1}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs for different views */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'expenses',
              label: 'Expenses',
              children: (
                <TableWrapper>
                  <Table
                    {...expenseTableProps}
                    dataSource={expenses}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    locale={{
                      emptyText: <Empty description="No expenses recorded" />
                    }}
                  />
                </TableWrapper>
              )
            },
            {
              key: 'income',
              label: 'Income',
              children: (
                <div>
                  {dashboard?.recentPayments && dashboard.recentPayments.length > 0 ? (
                    <TableWrapper>
                      <Table
                        {...paymentTableProps}
                        dataSource={dashboard.recentPayments}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                      />
                    </TableWrapper>
                  ) : (
                    <Empty description="No payments recorded" />
                  )}
                </div>
              )
            },
            {
              key: 'mortgage',
              label: (<span><BankOutlined /> Mortgage</span>),
              children: (
                <div>
                  {mortgageLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      <Spin size="large" />
                      <div style={{ marginTop: 16 }}>
                        <Text>Loading mortgage data...</Text>
                      </div>
                    </div>
                  ) : !mortgageData || !mortgageData.properties || mortgageData.properties.length === 0 ? (
                    <Empty
                      description="No mortgage data available"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Text type="secondary">
                        Add mortgage information to your properties to see payment breakdowns here.
                      </Text>
                    </Empty>
                  ) : (
                    <div>
                      {mortgageData.totals && (
                        <Card style={{ marginBottom: 24 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                            <div>
                              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                                Interest Paid (To Date)
                              </Text>
                              <Text strong style={{ fontSize: 20, color: '#ff4d4f' }}>
                                <CurrencyDisplay value={mortgageData.totals.totalInterest} country="CA" />
                              </Text>
                            </div>
                            <div>
                              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                                Principal Paid (To Date)
                              </Text>
                              <Text strong style={{ fontSize: 20, color: '#52c41a' }}>
                                <CurrencyDisplay value={mortgageData.totals.totalPrincipal} country="CA" />
                              </Text>
                            </div>
                            <div>
                              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                                Total Paid (To Date)
                              </Text>
                              <Text strong style={{ fontSize: 20 }}>
                                <CurrencyDisplay value={mortgageData.totals.totalAmount} country="CA" />
                              </Text>
                            </div>
                            <div>
                              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                                Remaining Balance
                              </Text>
                              <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
                                <CurrencyDisplay value={mortgageData.totals.totalRemainingBalance} country="CA" />
                              </Text>
                            </div>
                          </div>
                        </Card>
                      )}

                      {!selectedProperty ? (
                        <Card title="Properties with Mortgages">
                          <Table
                            columns={[
                              {
                                title: 'Property',
                                key: 'property',
                                render: (_, record) => (
                                  <div>
                                    <Text strong>{record.propertyName}</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {record.address}
                                    </Text>
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
                                  <Tag color="blue">{record.interestRate}%</Tag>
                                ),
                              },
                              {
                                title: 'Term',
                                key: 'term',
                                align: 'center',
                                render: (_, record) => (
                                  <Text>{record.termYears} years</Text>
                                ),
                              },
                              {
                                title: 'Payment Frequency',
                                key: 'frequency',
                                align: 'center',
                                render: (_, record) => (
                                  <Tag color={record.paymentFrequency === 'biweekly' ? 'green' : 'orange'}>
                                    {record.paymentFrequency === 'biweekly' ? 'Bi-weekly' : 'Monthly'}
                                  </Tag>
                                ),
                              },
                              {
                                title: 'Total Interest',
                                key: 'totalInterest',
                                align: 'right',
                                render: (_, record) => (
                                  <Text strong style={{ color: '#ff4d4f' }}>
                                    <CurrencyDisplay value={record.summary.totalInterest} country="CA" />
                                  </Text>
                                ),
                              },
                              {
                                title: 'Remaining Balance',
                                key: 'remainingBalance',
                                align: 'right',
                                render: (_, record) => (
                                  <Text strong style={{ color: '#52c41a' }}>
                                    <CurrencyDisplay value={record.summary.remainingBalance} country="CA" />
                                  </Text>
                                ),
                              },
                              {
                                title: 'Actions',
                                key: 'actions',
                                align: 'center',
                                render: (_, record) => (
                                  <Space>
                                    <a onClick={() => setSelectedProperty(record)}>
                                      View Breakdown
                                    </a>
                                  </Space>
                                ),
                              },
                            ]}
                            dataSource={mortgageData.properties}
                            rowKey="propertyId"
                            pagination={{ pageSize: 10 }}
                          />
                        </Card>
                      ) : (
                        <div>
                          <Card
                            style={{ marginBottom: 16 }}
                            title={
                              <div>
                                <a onClick={() => setSelectedProperty(null)} style={{ marginRight: 16 }}>
                                  ← Back to Properties
                                </a>
                                <Text strong>{selectedProperty.propertyName}</Text>
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                  {selectedProperty.address}
                                </Text>
                              </div>
                            }
                            extra={
                              <Space>
                                <Tag color="blue">
                                  {selectedProperty.interestRate}% interest
                                </Tag>
                                <Tag color={selectedProperty.paymentFrequency === 'biweekly' ? 'green' : 'orange'}>
                                  {selectedProperty.paymentFrequency === 'biweekly' ? 'Bi-weekly' : 'Monthly'} payments
                                </Tag>
                              </Space>
                            }
                          >
                            <div style={{ marginBottom: 16 }}>
                              <Space size="large">
                                <div>
                                  <Text type="secondary">Mortgage Amount: </Text>
                                  <Text strong>
                                    <CurrencyDisplay value={selectedProperty.mortgageAmount} country="CA" />
                                  </Text>
                                </div>
                                <div>
                                  <Text type="secondary">Interest Paid (To Date): </Text>
                                  <Text strong style={{ color: '#ff4d4f' }}>
                                    <CurrencyDisplay value={selectedProperty.summary.totalInterest} country="CA" />
                                  </Text>
                                </div>
                                <div>
                                  <Text type="secondary">Principal Paid (To Date): </Text>
                                  <Text strong style={{ color: '#52c41a' }}>
                                    <CurrencyDisplay value={selectedProperty.summary.totalPrincipal} country="CA" />
                                  </Text>
                                </div>
                                <div>
                                  <Text type="secondary">Remaining Balance: </Text>
                                  <Text strong style={{ color: '#52c41a' }}>
                                    <CurrencyDisplay value={selectedProperty.summary.remainingBalance} country="CA" />
                                  </Text>
                                </div>
                              </Space>
                            </div>
                          </Card>

                          <Card title="Payment Breakdown (Paid to Date)">
                            <Table
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
                                    <Text strong style={{ color: '#52c41a' }}>
                                      <CurrencyDisplay value={principal} country="CA" />
                                    </Text>
                                  ),
                                },
                                {
                                  title: 'Interest',
                                  dataIndex: 'interest',
                                  key: 'interest',
                                  align: 'right',
                                  width: 150,
                                  render: (interest) => (
                                    <Text strong style={{ color: '#ff4d4f' }}>
                                      <CurrencyDisplay value={interest} country="CA" />
                                    </Text>
                                  ),
                                },
                                {
                                  title: 'Remaining Balance',
                                  dataIndex: 'remainingBalance',
                                  key: 'remainingBalance',
                                  align: 'right',
                                  width: 180,
                                  render: (balance) => (
                                    <Text>
                                      <CurrencyDisplay value={balance} country="CA" />
                                    </Text>
                                  ),
                                },
                              ]}
                              dataSource={selectedProperty.breakdown}
                              rowKey="paymentNumber"
                              pagination={{ 
                                pageSize: 50,
                                showSizeChanger: true,
                                showTotal: (total) => `${total} payments made to date`
                              }}
                              scroll={{ x: 'max-content', y: 600 }}
                            />
                          </Card>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'charts',
              label: (<span><BarChartOutlined /> Charts</span>),
              children: (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Card title="Income vs Expenses (Last 6 Months)">
                        {loading ? (
                          <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span>Loading chart...</span>
                          </div>
                        ) : dashboard?.incomeTrends && dashboard.incomeTrends.length > 0 ? (
                          <IncomeExpensesChart data={dashboard.incomeTrends} />
                        ) : (
                          <Empty 
                            description={
                              <div>
                                <div>No trend data available</div>
                                {dashboard && !dashboard.incomeTrends && (
                                  <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                                    Dashboard loaded but incomeTrends is missing
                                  </div>
                                )}
                                {!dashboard && (
                                  <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                                    Dashboard data not loaded yet
                                  </div>
                                )}
                              </div>
                            } 
                          />
                        )}
                      </Card>
                    </Col>
                  <Col span={12}>
                    <Card title="Expenses by Category">
                      {loading ? (
                        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span>Loading chart...</span>
                        </div>
                      ) : pieData.length > 0 ? (
                        <ExpensesPieChart data={pieData} />
                      ) : (
                        <Empty description="No expense data" />
                      )}
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Monthly Expense Trend">
                      {loading ? (
                        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span>Loading chart...</span>
                        </div>
                      ) : trendData.length > 0 ? (
                        <MonthlyExpenseChart data={trendData} />
                      ) : (
                        <Empty description="No expense trend data" />
                      )}
                    </Card>
                  </Col>
                  {dashboard?.propertyIncomeBreakdown && Object.keys(dashboard.propertyIncomeBreakdown).length > 0 && (
                    <Col span={24}>
                      <Card title="Income by Property (This Month)">
                        <Row gutter={[16, 16]}>
                          {Object.entries(dashboard.propertyIncomeBreakdown).map(([property, amount]) => (
                            <Col span={6} key={property}>
                              <Card size="small">
                                <Statistic
                                  title={property}
                                  value={typeof amount === 'number' ? amount : 0}
                                  precision={2}
                                  prefix="$"
                                  valueStyle={{ color: '#3f8600' }}
                                />
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </Card>
                    </Col>
                  )}
                </Row>
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Add Expense Modal */}
      <StandardModal
        title="Add Expense"
        open={expenseModalOpen}
        form={form}
        loading={submittingExpense}
        submitText="Add"
        onCancel={() => {
          closeExpenseModal();
          form.resetFields();
        }}
        onFinish={handleAddExpense}
      >
        <FormSelect
          name="propertyId"
          label="Property (Optional)"
          options={properties.map(prop => ({
            label: prop.propertyName || prop.addressLine1,
            value: prop.id
          }))}
          allowClear
          placeholder="Select a property"
        />

        <FormSelect
          name="category"
          label="Category"
          required
          options={[
            { label: 'Repairs', value: 'repairs' },
            { label: 'Utilities', value: 'utilities' },
            { label: 'Insurance', value: 'insurance' },
            { label: 'Property Taxes', value: 'taxes' },
            { label: 'Legal', value: 'legal' },
            { label: 'Maintenance', value: 'maintenance' },
            { label: 'Other', value: 'other' }
          ]}
        />

        <Form.Item
          name="amount"
          label="Amount"
          rules={[rules.required('Amount')]}
        >
          <Input prefix="$" type="number" step="0.01" />
        </Form.Item>

        <FormDatePicker
          name="date"
          label="Date"
          required
        />

        <FormTextInput
          name="description"
          label="Description"
          textArea
          rows={3}
          required
        />

        <FormTextInput
          name="paidTo"
          label="Paid To"
        />

        <FormSelect
          name="paymentMethod"
          label="Payment Method"
          options={[
            { label: 'Cash', value: 'cash' },
            { label: 'Check', value: 'check' },
            { label: 'Bank Transfer', value: 'transfer' },
            { label: 'Credit Card', value: 'credit_card' }
          ]}
        />
      </StandardModal>

      {/* Ticket View Modal - Reuse MaintenanceClient's view */}
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
      <StandardModal
        title="Reject Approval Request"
        open={rejectModalOpen}
        form={rejectForm}
        loading={false}
        submitText="Reject"
        onCancel={() => {
          closeRejectModal();
          rejectForm.resetFields();
        }}
        onFinish={handleRejectSubmit}
      >
        <FormTextInput
          name="reason"
          label="Rejection Reason"
          textArea
          rows={4}
          required
          placeholder="Enter rejection reason..."
        />
      </StandardModal>
    </PageLayout>
  );
}

