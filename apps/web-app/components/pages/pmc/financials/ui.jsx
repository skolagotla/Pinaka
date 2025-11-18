"use client";

import { useState, useMemo } from 'react';
import {
  Typography, Table, Tag, Space, Row, Col,
  Statistic, Card, Tooltip, Select
} from 'antd';
import { 
  DollarOutlined, ArrowUpOutlined, ArrowDownOutlined,
  WalletOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import { PageLayout, TableWrapper } from '@/components/shared';
import { renderStatus } from '@/components/shared/TableRenderers';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { formatCurrency } from '@/lib/currency-utils.js';

const { Text } = Typography;

export default function PMCFinancialsClient({ pmc, financialData = null }) {
  const [approvalFilter, setApprovalFilter] = useState('all');

  // Ensure financialData has default values - handle null explicitly
  const safeFinancialData = useMemo(() => {
    if (financialData == null) {
      return {
        expenses: [],
        rentPayments: [],
        totalRent: 0,
        totalExpenses: 0,
        netIncome: 0,
      };
    }
    // Use optional chaining to safely access properties
    return {
      expenses: Array.isArray(financialData?.expenses) ? (financialData?.expenses || []) : [],
      rentPayments: Array.isArray(financialData?.rentPayments) ? (financialData?.rentPayments || []) : [],
      totalRent: typeof financialData?.totalRent === 'number' ? (financialData?.totalRent || 0) : 0,
      totalExpenses: typeof financialData?.totalExpenses === 'number' ? (financialData?.totalExpenses || 0) : 0,
      netIncome: typeof financialData?.netIncome === 'number' ? (financialData?.netIncome || 0) : 0,
    };
  }, [financialData]);

  const filteredExpenses = useMemo(() => {
    if (approvalFilter === 'all') return safeFinancialData.expenses;
    if (approvalFilter === 'pending') {
      return safeFinancialData.expenses.filter(e => 
        e.pmcApprovalRequest?.status === 'PENDING'
      );
    }
    if (approvalFilter === 'approved') {
      return safeFinancialData.expenses.filter(e => 
        e.pmcApprovalRequest?.status === 'APPROVED'
      );
    }
    if (approvalFilter === 'rejected') {
      return safeFinancialData.expenses.filter(e => 
        e.pmcApprovalRequest?.status === 'REJECTED'
      );
    }
    if (approvalFilter === 'no-approval') {
      return safeFinancialData.expenses.filter(e => !e.pmcApprovalRequest);
    }
    return safeFinancialData.expenses;
  }, [safeFinancialData.expenses, approvalFilter]);
  const expenseColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Property',
      key: 'property',
      render: (_, record) => (
        <Text>
          {record.property?.addressLine1 || record.property?.propertyName || 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => amount != null ? formatCurrency(amount, 'CAD') : '-',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag>{cat || 'N/A'}</Tag>,
    },
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      title: 'Approval Status',
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
  ];

  const paymentColumns = [
    {
      title: 'Property',
      key: 'property',
      render: (_, record) => (
        <Text>
          {record.lease?.unit?.property?.addressLine1 || record.lease?.unit?.property?.propertyName || 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => amount != null ? formatCurrency(amount, 'CAD') : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          Paid: 'green',
          Partial: 'orange',
          Unpaid: 'red',
          Overdue: 'red',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Paid Date',
      dataIndex: 'paidDate',
      key: 'paidDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
  ];

  const statsData = useMemo(() => {
    try {
      return [
        {
          title: 'Total Rent Collected',
          value: formatCurrency(safeFinancialData.totalRent, 'CAD'),
          prefix: <DollarOutlined />,
          valueStyle: { color: '#52c41a' },
        },
        {
          title: 'Total Expenses',
          value: formatCurrency(safeFinancialData.totalExpenses, 'CAD'),
          prefix: <ArrowDownOutlined />,
          valueStyle: { color: '#ff4d4f' },
        },
        {
          title: 'Net Income',
          value: formatCurrency(safeFinancialData.netIncome, 'CAD'),
          prefix: <ArrowUpOutlined />,
          valueStyle: { color: safeFinancialData.netIncome >= 0 ? '#52c41a' : '#ff4d4f' },
        },
      ];
    } catch (error) {
      console.error('[PMCFinancialsClient] Error creating stats data:', error);
      return [];
    }
  }, [safeFinancialData.totalRent, safeFinancialData.totalExpenses, safeFinancialData.netIncome]);

  return (
    <PageLayout
      headerTitle={<><WalletOutlined /> Financials</>}
      stats={statsData}
      statsCols={3}
      contentStyle={{ maxWidth: 1400, margin: '0 auto' }}
    >
      {/* Rent Payments */}
      <Card title="Rent Payments (This Month)" style={{ marginBottom: 24 }}>
        {safeFinancialData.rentPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">No rent payments this month</Text>
          </div>
        ) : (
          <TableWrapper>
            <Table
              dataSource={safeFinancialData.rentPayments}
              columns={paymentColumns}
              rowKey={(record) => record?.id || record?.leaseId || Math.random()}
              pagination={{ pageSize: 20 }}
            />
          </TableWrapper>
        )}
      </Card>

      {/* Expenses */}
      <Card 
        title="Expenses (This Month)"
        extra={
          <Select
            value={approvalFilter}
            onChange={setApprovalFilter}
            style={{ width: 200 }}
            options={[
              { value: 'all', label: 'All Expenses' },
              { value: 'pending', label: 'Pending Approval' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'no-approval', label: 'No Approval Needed' },
            ]}
          />
        }
      >
        {filteredExpenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">No expenses {approvalFilter !== 'all' ? 'matching filter' : 'this month'}</Text>
          </div>
        ) : (
          <TableWrapper>
            <Table
              dataSource={filteredExpenses}
              columns={expenseColumns}
              rowKey={(record) => record?.id || Math.random()}
              pagination={{ pageSize: 20 }}
            />
          </TableWrapper>
        )}
      </Card>
    </PageLayout>
  );
}

