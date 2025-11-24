"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Button,
  Select,
  Badge,
  Tooltip,
  Spinner,
  Alert,
  Tabs,
  Table,
} from 'flowbite-react';
import {
  HiCurrencyDollar,
  HiHome,
  HiUser,
  HiArrowUp,
  HiArrowDown,
  HiDownload,
  HiChartBar,
  HiChartLine,
  HiExclamation,
} from 'react-icons/hi';
import { PageLayout, FilterBar, LoadingWrapper } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import FlowbiteStatistic from '@/components/shared/FlowbiteStatistic';
import { useLoading } from '@/lib/hooks/useLoading';
// useUnifiedApi removed - use v2Api from @/lib/api/v2-client';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useProperties, useTenants } from '@/lib/hooks/useV2Data';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';

// Dynamically import charts
const CashFlowChart = dynamic(
  () => import('@/components/charts/CashFlowChart'),
  { ssr: false, loading: () => <div className="h-[400px] flex items-center justify-center">Loading chart...</div> }
);

const PortfolioPerformanceChart = dynamic(
  () => import('@/components/charts/PortfolioPerformanceChart'),
  { ssr: false, loading: () => <div className="h-[400px] flex items-center justify-center">Loading chart...</div> }
);

const DelinquencyRiskChart = dynamic(
  () => import('@/components/charts/DelinquencyRiskChart'),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center">Loading chart...</div> }
);

export default function AnalyticsDashboardClient({ user, userRole }) {
  const { user: currentUser } = useV2Auth();
  const organizationId = currentUser?.organization_id;
  // useUnifiedApi removed({ showUserMessage: false });
  const { loading, withLoading } = useLoading(true);
  const [dateRange, setDateRange] = useState([dayjs().subtract(12, 'month'), dayjs()]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Load properties and tenants using v2 API
  const { data: propertiesData } = useProperties(organizationId);
  const properties = propertiesData && Array.isArray(propertiesData) ? propertiesData : [];
  
  const { data: tenantsData } = useTenants(organizationId);
  const tenants = tenantsData && Array.isArray(tenantsData) ? tenantsData : [];
  
  // Analytics data
  const [portfolioData, setPortfolioData] = useState(null);
  const [propertyData, setPropertyData] = useState(null);
  const [cashFlowData, setCashFlowData] = useState(null);
  const [tenantRisks, setTenantRisks] = useState([]);

  useEffect(() => {
    loadData();
  }, [dateRange, selectedProperty]);

  const loadData = async () => {
    await withLoading(async () => {
      try {
        const [startDate, endDate] = dateRange;

      // Load portfolio performance
      const { v2Api } = await import('@/lib/api/v2-client');
      const portfolioResponse = await v2Api.specialized.portfolioperformance({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      if (portfolioResponse.success) {
        setPortfolioData(portfolioResponse.data);
      }

      // Load property performance if property selected
      if (selectedProperty) {
        const propertyResponse = await v2Api.specialized.propertyperformance({
          propertyId: selectedProperty,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        if (propertyResponse.success) {
          setPropertyData(propertyResponse.data);
        }
      }

      // Load cash flow forecast
      const cashFlowResponse = await v2Api.specialized.cashflowforecast({ months: 12 });
      if (cashFlowResponse.success) {
        setCashFlowData(cashFlowResponse.data);
      }

      // Properties and tenants are loaded via v2 API hooks above
      // Load risk data for each tenant
      const riskPromises = tenants.map(async (tenant) => {
        try {
          const riskResponse = await v2Api.specialized.tenantdelinquencyrisk({ tenantId: tenant.id });
          if (riskResponse.success) {
            return {
              tenantId: tenant.id,
              firstName: tenant.first_name || tenant.name?.split(' ')[0] || '',
              lastName: tenant.last_name || tenant.name?.split(' ').slice(1).join(' ') || '',
              ...riskResponse.data,
            };
          }
        } catch (error) {
          // Skip if error
        }
        return null;
      });
      const risks = (await Promise.all(riskPromises)).filter(r => r !== null);
      setTenantRisks(risks);
      } catch (error) {
        // Error already handled
      }
    });
  };

  const handleExport = async (format, type) => {
    try {
      const [startDate, endDate] = dateRange;
      const params = new URLSearchParams({
        format,
        type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      if (selectedProperty) {
        params.append('propertyId', selectedProperty);
      }

      const { v2Api } = await import('@/lib/api/v2-client');
      const query = {
        type,
        format,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...(selectedProperty && { propertyId: selectedProperty }),
      };
      const response = await v2Api.specialized.exportAnalytics(query);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${type}-${new Date().toISOString().split('T')[0].${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const tenantRiskColumns = [
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_, record) => `${record.firstName || ''} ${record.lastName || ''}`.trim() || 'Unknown',
    },
    {
      title: 'Risk Score',
      dataIndex: 'riskScore',
      key: 'riskScore',
      render: (score) => {
        let color = 'success';
        if (score >= 70) color = 'failure';
        else if (score >= 40) color = 'warning';
        return <Badge color={color}score}/100</Badge>;
      },
    },
    {
      title: 'Risk Level',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (level) => {
        const colors = { high: 'failure', medium: 'warning', low: 'success' };
        return <Badge color={colors[level}level.toUpperCase()}</Badge>;
      },
    },
    {
      title: 'Late Payments',
      dataIndex: 'latePayments',
      key: 'latePayments',
    },
    {
      title: 'Missed Payments',
      dataIndex: 'missedPayments',
      key: 'missedPayments',
    },
  ];

  const filterConfig = [
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'dateRange',
    },
    {
      key: 'property',
      label: 'Property',
      type: 'select',
      options: properties.map(p => ({
        label: p.name || p.address_line1,
        value: p.id,
      })),
    },
  ];

  const activeFilters = {
    dateRange: dateRange || null,
    property: selectedProperty || null,
  };

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiChartBar className="h-5 w-5" />
          <span>Analytics Dashboard</span>
        </div>
      }
      headerDescription="Advanced insights and performance metrics"
      headerActions={
        <Button
          key="export-json"
          color="blue"
          onClick={() => handleExport('json', 'portfolio')}
          className="flex items-center gap-2"
        >
          <HiDownload className="h-4 w-4" />
          Export JSON
        </Button>,
        <Button
          key="export-csv"
          color="blue"
          onClick={() => handleExport('csv', 'portfolio')}
          className="flex items-center gap-2"
        >
          <HiDownload className="h-4 w-4" />
          Export CSV
        </Button>,
      }
      contentStyle={{ padding: 0, display: 'flex', flexDirection: 'column' }}
    >
      <FilterBar
        filters={filterConfig}
        activeFilters={activeFilters}
        onFilterChange={(newFilters) => {
          if (newFilters.dateRange) {
            setDateRange(newFilters.dateRange);
          } else if (newFilters.dateRange === null) {
            setDateRange([dayjs().subtract(12, 'month'), dayjs()]);
          }
          if (newFilters.property !== undefined) {
            setSelectedProperty(newFilters.property || null);
          }
        }}
        onReset={() => {
          setSelectedProperty(null);
          setDateRange([dayjs().subtract(12, 'month'), dayjs()]);
        }}
        showSearch={false}
      />

      {loading ? (
        <LoadingWrapper loading={loading} />
      ) : (
        <Tabs activeTab={activeTab} onActiveTabChange={setActiveTab}>
          <Tabs.Item active={activeTab === 'overview'} title={
            <div className="flex items-center gap-2">
              <HiChartBar className="h-4 w-4" />
              <span>Overview</span>
            </div>
          }>
            <div>
              {/* Portfolio Metrics */}
              {portfolioData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  <Card>
                    <FlowbiteStatistic
                      title="Total Properties"
                      value={portfolioData.totalProperties}
                      prefix={<HiHome className="h-5 w-5" />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                  <Card>
                    <FlowbiteStatistic
                      title="Total Rent"
                      value={portfolioData.totalRent}
                      prefix={<HiCurrencyDollar className="h-5 w-5" />}
                      precision={2}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                  <Card>
                    <FlowbiteStatistic
                      title="Total Expenses"
                      value={portfolioData.totalExpenses}
                      prefix={<HiCurrencyDollar className="h-5 w-5" />}
                      precision={2}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Card>
                  <Card>
                    <FlowbiteStatistic
                      title="Net Income"
                      value={portfolioData.netIncome}
                      prefix={<HiCurrencyDollar className="h-5 w-5" />}
                      precision={2}
                      valueStyle={{ color: portfolioData.netIncome >= 0 ? '#3f8600' : '#cf1322' }}
                    />
                  </Card>
                  <Card>
                    <FlowbiteStatistic
                      title="Occupancy Rate"
                      value={portfolioData.occupancyRate}
                      suffix="%"
                      prefix={<HiUser className="h-5 w-5" />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                  <Card>
                    <FlowbiteStatistic
                      title="Occupied Units"
                      value={portfolioData.occupiedUnits}
                      suffix={`/ ${portfolioData.totalUnits}`}
                      prefix={<HiHome className="h-5 w-5" />}
                    />
                  </Card>
                </div>
              )}

              {/* Property Performance Chart */}
              {portfolioData && (
                <Card className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
                  <PortfolioPerformanceChart data={portfolioData} />
                </Card>
              )}

              {/* Property-specific metrics */}
              {propertyData && (
                <Card className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Property: {propertyData.propertyName}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <FlowbiteStatistic
                      title="ROI"
                      value={propertyData.roi}
                      suffix="%"
                      prefix={<HiArrowUp className="h-5 w-5" />}
                      valueStyle={{ color: propertyData.roi >= 0 ? '#3f8600' : '#cf1322' }}
                    />
                    <FlowbiteStatistic
                      title="Net Income"
                      value={propertyData.netIncome}
                      prefix={<HiCurrencyDollar className="h-5 w-5" />}
                      precision={2}
                    />
                    <FlowbiteStatistic
                      title="Occupancy"
                      value={propertyData.occupancyRate}
                      suffix="%"
                    />
                  </div>
                </Card>
              )}
            </div>
          </Tabs.Item>
          <Tabs.Item active={activeTab === 'cashflow'} title={
            <div className="flex items-center gap-2">
              <HiChartLine className="h-4 w-4" />
              <span>Cash Flow Forecast</span>
            </div>
          }>
            <div>
              {cashFlowData ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <FlowbiteStatistic
                        title="Total Projected Income"
                        value={cashFlowData.totalProjectedIncome}
                        prefix={<HiCurrencyDollar className="h-5 w-5" />}
                        precision={2}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                    <Card>
                      <FlowbiteStatistic
                        title="Total Projected Expenses"
                        value={cashFlowData.totalProjectedExpenses}
                        prefix={<HiCurrencyDollar className="h-5 w-5" />}
                        precision={2}
                        valueStyle={{ color: '#cf1322' }}
                      />
                    </Card>
                    <Card>
                      <FlowbiteStatistic
                        title="Total Net Cash Flow"
                        value={cashFlowData.totalNetCashFlow}
                        prefix={<HiCurrencyDollar className="h-5 w-5" />}
                        precision={2}
                        valueStyle={{ color: cashFlowData.totalNetCashFlow >= 0 ? '#3f8600' : '#cf1322' }}
                      />
                    </Card>
                  </div>
                  <Card>
                    <h3 className="text-lg font-semibold mb-4">12-Month Cash Flow Forecast</h3>
                    <CashFlowChart data={cashFlowData.forecast} />
                  </Card>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No cash flow data available</p>
                </div>
              )}
            </div>
          </Tabs.Item>
          <Tabs.Item active={activeTab === 'risks'} title={
            <div className="flex items-center gap-2">
              <HiExclamation className="h-4 w-4" />
              <span>Risk Analysis</span>
            </div>
          }>
            <div>
              <Card className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Tenant Delinquency Risk Analysis</h3>
                <Alert color="info" className="mb-4">
                  <div>
                    <p className="font-semibold">Risk Scoring</p>
                    <p className="text-sm">Tenants are scored 0-100 based on payment history. Higher scores indicate higher risk of payment delinquency.</p>
                  </div>
                </Alert>
                {tenantRisks.length > 0 ? (
                  <FlowbiteTable
                    columns={tenantRiskColumns}
                    dataSource={tenantRisks}
                    rowKey="tenantId"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No tenant risk data available. Risk analysis requires payment history.</p>
                  </div>
                )}
              </Card>
            </div>
          </Tabs.Item>
        </Tabs>
      )}
    </PageLayout>
  );
}
