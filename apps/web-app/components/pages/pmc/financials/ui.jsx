"use client";

import { useState, useMemo } from 'react';
import {
  Card, Select, Badge, Tooltip, Table
} from 'flowbite-react';
import { 
  HiCurrencyDollar, 
  HiArrowUp, 
  HiArrowDown,
  HiClock, 
  HiCheckCircle, 
  HiXCircle
} from 'react-icons/hi';
import { PageLayout, TableWrapper } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import FlowbiteStatistic from '@/components/shared/FlowbiteStatistic';
import { renderStatus } from '@/components/shared/FlowbiteTableRenderers';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { formatCurrency } from '@/lib/currency-utils.js';

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
        <span>
          {record.property?.addressLine1 || record.property?.propertyName || 'N/A'}
        </span>
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
      render: (cat) => <Badge color="gray">{cat || 'N/A'}</Badge>,
    },
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      title: 'Approval Status',
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
  ];

  const paymentColumns = [
    {
      title: 'Property',
      key: 'property',
      render: (_, record) => (
        <span>
          {record.lease?.unit?.property?.addressLine1 || record.lease?.unit?.property?.propertyName || 'N/A'}
        </span>
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
          Paid: 'success',
          Partial: 'warning',
          Unpaid: 'failure',
          Overdue: 'failure',
        };
        return <Badge color={colors[status] || 'gray'}>{status}</Badge>;
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
          prefix: <HiCurrencyDollar className="h-5 w-5" />,
          valueStyle: { color: '#52c41a' },
        },
        {
          title: 'Total Expenses',
          value: formatCurrency(safeFinancialData.totalExpenses, 'CAD'),
          prefix: <HiArrowDown className="h-5 w-5" />,
          valueStyle: { color: '#ff4d4f' },
        },
        {
          title: 'Net Income',
          value: formatCurrency(safeFinancialData.netIncome, 'CAD'),
          prefix: <HiArrowUp className="h-5 w-5" />,
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
      headerTitle={
        <div className="flex items-center gap-2">
          <HiCurrencyDollar className="h-5 w-5" />
          <span>Financials</span>
        </div>
      }
      stats={statsData}
      statsCols={3}
      contentStyle={{ maxWidth: 1400, margin: '0 auto' }}
    >
      {/* Rent Payments */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Rent Payments (This Month)</h3>
        {safeFinancialData.rentPayments.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-gray-500">No rent payments this month</span>
          </div>
        ) : (
          <TableWrapper>
            <FlowbiteTable
              dataSource={safeFinancialData.rentPayments}
              columns={paymentColumns}
              rowKey={(record) => record?.id || record?.leaseId || Math.random()}
              pagination={{ pageSize: 20 }}
            />
          </TableWrapper>
        )}
      </Card>

      {/* Expenses */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Expenses (This Month)</h3>
          <Select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">All Expenses</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="no-approval">No Approval Needed</option>
          </Select>
        </div>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-gray-500">
              No expenses {approvalFilter !== 'all' ? 'matching filter' : 'this month'}
            </span>
          </div>
        ) : (
          <TableWrapper>
            <FlowbiteTable
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
