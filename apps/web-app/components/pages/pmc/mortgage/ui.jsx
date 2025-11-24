"use client";
import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Spinner, Badge } from 'flowbite-react';
import { HiBanknotes } from 'react-icons/hi';
// useUnifiedApi removed - use v2Api from @/lib/api/v2-client';
import { safeJsonParse } from '@/lib/utils/safe-json-parser';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';
import { PageLayout, TableWrapper, EmptyState, LoadingWrapper, renderDate } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import dayjs from 'dayjs';

export default function PMCMortgageClient() {
  const { fetch, loading } = useUnifiedApi({ showUserMessage: true });
  const [mortgageData, setMortgageData] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const loadMortgageData = useCallback(async () => {
    try {
      // Use v1Api for mortgage analytics
      const { apiClient } = await import('@/lib/utils/api-client');
      const response = await apiClient('/api/v1/analytics/mortgage', {
        method: 'GET',
      });
      if (response && response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setMortgageData(data.data);
        } else {
          setMortgageData(data);
        }
      }
    } catch (error) {
      console.error('Error loading mortgage data:', error);
      setMortgageData(null);
    }
  }, []);

  useEffect(() => {
    loadMortgageData();
  }, [loadMortgageData]);

  if (loading) {
    return (
      <PageLayout headerTitle={<><HiBanknotes className="inline mr-2" /> Mortgage Breakdown</>}>
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner size="xl" />
        </div>
      </PageLayout>
    );
  }

  if (!mortgageData || !mortgageData.properties || mortgageData.properties.length === 0) {
    return (
      <PageLayout headerTitle={<><BankOutlined /> Mortgage Breakdown</>}>
        <EmptyState
          icon={<BankOutlined />}
          title="No mortgage data available"
          description="Add mortgage information to your properties to see payment breakdowns here."
        />
      </PageLayout>
    );
  }

  // Property summary columns
  const propertyColumns = [
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
  ];

  // Payment breakdown columns (shown when a property is selected)
  const paymentColumns = [
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
  ];

  const stats = mortgageData.totals ? {
    {
      title: 'Interest Paid (To Date)',
      value: <CurrencyDisplay value={mortgageData.totals.totalInterest} country="CA" />,
      prefix: <BankOutlined />,
      valueStyle: { color: '#ff4d4f' },
    },
    {
      title: 'Principal Paid (To Date)',
      value: <CurrencyDisplay value={mortgageData.totals.totalPrincipal} country="CA" />,
      prefix: <BankOutlined />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Total Paid (To Date)',
      value: <CurrencyDisplay value={mortgageData.totals.totalAmount} country="CA" />,
      prefix: <BankOutlined />,
    },
    {
      title: 'Remaining Balance',
      value: <CurrencyDisplay value={mortgageData.totals.totalRemainingBalance} country="CA" />,
      prefix: <BankOutlined />,
      valueStyle: { color: '#1890ff' },
    },
  ] : [];

  return (
    <PageLayout
      headerTitle={<><BankOutlined /> Mortgage Breakdown</>}
      headerDescription="View payment breakdowns (paid to date) with principal and interest for each property"
      stats={stats}
      statsCols={4}
      contentStyle={{ maxWidth: 1400, margin: '0 auto' }}
    >
      {!selectedProperty ? (
        <TableWrapper>
          <Table
            columns={propertyColumns}
            dataSource={mortgageData.properties}
            rowKey="propertyId"
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} properties` }}
            size="middle"
          />
        </TableWrapper>
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

          <TableWrapper>
            <Table
              columns={paymentColumns}
              dataSource={selectedProperty.breakdown}
              rowKey="paymentNumber"
              pagination={{ 
                pageSize: 50,
                showSizeChanger: true,
                showTotal: (total) => `${total} payments made to date`
              }}
              scroll={{ x: 'max-content', y: 600 }}
              size="middle"
            />
          </TableWrapper>
        </div>
      )}
    </PageLayout>
  );
}

