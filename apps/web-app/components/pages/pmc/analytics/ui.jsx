"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Button,
  Space,
  Typography,
  Spin,
  Empty,
  Alert,
  Tabs,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  DollarOutlined,
  HomeOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DownloadOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { ProCard } from '@/components/shared/LazyProComponents';
import { PageLayout, FilterBar, LoadingWrapper } from '@/components/shared';
import { useLoading } from '@/lib/hooks/useLoading';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';

const { Text } = Typography;

// Dynamically import charts
const CashFlowChart = dynamic(
  () => import('@/components/charts/CashFlowChart'),
  { ssr: false, loading: () => <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div> }
);

const PortfolioPerformanceChart = dynamic(
  () => import('@/components/charts/PortfolioPerformanceChart'),
  { ssr: false, loading: () => <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div> }
);

const DelinquencyRiskChart = dynamic(
  () => import('@/components/charts/DelinquencyRiskChart'),
  { ssr: false, loading: () => <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div> }
);

export default function AnalyticsDashboardClient({ user, userRole }) {
  const { fetch } = useUnifiedApi({ showUserMessage: false });
  const { loading, withLoading } = useLoading(true);
  const [dateRange, setDateRange] = useState([dayjs().subtract(12, 'month'), dayjs()]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  const [properties, setProperties] = useState([]);
  const [landlords, setLandlords] = useState([]);
  
  // Analytics data
  const [portfolioData, setPortfolioData] = useState(null);
  const [propertyData, setPropertyData] = useState(null);
  const [cashFlowData, setCashFlowData] = useState(null);
  const [tenantRisks, setTenantRisks] = useState([]);

  useEffect(() => {
    loadLandlords();
  }, []);

  useEffect(() => {
    if (selectedLandlord) {
      loadProperties();
      loadData();
    }
  }, [selectedLandlord, dateRange, selectedProperty]);

  const loadLandlords = async () => {
    try {
      const res = await fetch(
        '/api/landlords',
        {},
        { operation: 'Load landlords', showUserMessage: false }
      );
      const json = res ? await res.json() : null;
      if (json.success && json.landlords) {
        setLandlords(json.landlords || []);
        if (json.landlords.length > 0 && !selectedLandlord) {
          setSelectedLandlord(json.landlords[0].id);
        }
      }
    } catch (error) {
      // Error handled
    }
  };

  const loadProperties = async () => {
    if (!selectedLandlord) return;
    try {
      const res = await fetch(
        `/api/properties?landlordId=${selectedLandlord}`,
        {},
        { operation: 'Load properties', showUserMessage: false }
      );
      const json = res ? await res.json() : null;
      if (json.success) {
        setProperties(json.properties || []);
      }
    } catch (error) {
      // Error handled
    }
  };

  const loadData = async () => {
    if (!selectedLandlord) return;
    await withLoading(async () => {
      try {
        const [startDate, endDate] = dateRange;

      // Load portfolio performance
      const portfolioRes = await fetch(
        `/api/analytics/portfolio-performance?landlordId=${selectedLandlord}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {},
        { operation: 'Load portfolio analytics', showUserMessage: false }
      );
      const portfolioJson = portfolioRes ? await portfolioRes.json() : null;
      if (portfolioJson.success) {
        setPortfolioData(portfolioJson.data);
      }

      // Load property performance if property selected
      if (selectedProperty) {
        const propertyRes = await fetch(
          `/api/analytics/property-performance?propertyId=${selectedProperty}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
          {},
          { operation: 'Load property analytics', showUserMessage: false }
        );
        const propertyJson = propertyRes ? await propertyRes.json() : null;
        if (propertyJson.success) {
          setPropertyData(propertyJson.data);
        }
      }

      // Load cash flow forecast
      const cashFlowRes = await fetch(
        `/api/analytics/cash-flow-forecast?landlordId=${selectedLandlord}&months=12`,
        {},
        { operation: 'Load cash flow forecast', showUserMessage: false }
      );
      const cashFlowJson = cashFlowRes ? await cashFlowRes.json() : null;
      if (cashFlowJson.success) {
        setCashFlowData(cashFlowJson.data);
      }

      // Load tenant risks
      const tenantsRes = await fetch(
        `/api/tenants?landlordId=${selectedLandlord}`,
        {},
        { operation: 'Load tenants', showUserMessage: false }
      );
      const tenantsJson = tenantsRes ? await tenantsRes.json() : null;
      if (tenantsJson.success && tenantsJson.tenants) {
        // Load risk for each tenant
        const riskPromises = tenantsJson.tenants.map(async (tenant) => {
          try {
            const riskRes = await fetch(
              `/api/analytics/tenant-delinquency-risk?tenantId=${tenant.id}`,
              {},
              { operation: 'Load tenant risk', showUserMessage: false }
            );
            const riskJson = riskRes ? await riskRes.json() : null;
            if (riskJson.success) {
              return {
                tenantId: tenant.id,
                firstName: tenant.firstName,
                lastName: tenant.lastName,
                ...riskJson.data,
              };
            }
          } catch (error) {
            // Skip if error
          }
          return null;
        });
        const risks = (await Promise.all(riskPromises)).filter(r => r !== null);
        setTenantRisks(risks);
      }
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
      if (selectedLandlord) {
        params.append('landlordId', selectedLandlord);
      }

      const response = await fetch(`/api/analytics/export?${params.toString()}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${type}-${new Date().toISOString().split('T')[0]}.${format}`;
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
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Risk Score',
      dataIndex: 'riskScore',
      key: 'riskScore',
      render: (score) => {
        let color = 'green';
        if (score >= 70) color = 'red';
        else if (score >= 40) color = 'orange';
        return <Tag color={color}>{score}/100</Tag>;
      },
      sorter: (a, b) => a.riskScore - b.riskScore,
    },
    {
      title: 'Risk Level',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (level) => {
        const colors = { high: 'red', medium: 'orange', low: 'green' };
        return <Tag color={colors[level]}>{level.toUpperCase()}</Tag>;
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
      key: 'landlord',
      label: 'Landlord',
      type: 'select',
      options: landlords.map(l => ({
        label: `${l.firstName} ${l.lastName}`,
        value: l.id,
      })),
    },
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
        label: p.propertyName || p.addressLine1,
        value: p.id,
      })),
      disabled: !selectedLandlord,
    },
  ];

  const activeFilters = {
    landlord: selectedLandlord || null,
    dateRange: dateRange || null,
    property: selectedProperty || null,
  };

  return (
    <PageLayout
      headerTitle={<><BarChartOutlined /> Analytics Dashboard</>}
      headerDescription="Advanced insights and performance metrics"
      headerActions={[
        <Button
          key="export-json"
          icon={<DownloadOutlined />}
          onClick={() => handleExport('json', 'portfolio')}
          disabled={!selectedLandlord}
        >
          Export JSON
        </Button>,
        <Button
          key="export-csv"
          icon={<DownloadOutlined />}
          onClick={() => handleExport('csv', 'portfolio')}
          disabled={!selectedLandlord}
        >
          Export CSV
        </Button>,
      ]}
      contentStyle={{ padding: 0, display: 'flex', flexDirection: 'column' }}
    >
      <FilterBar
        filters={filterConfig}
        activeFilters={activeFilters}
        onFilterChange={(newFilters) => {
          if (newFilters.landlord !== undefined) {
            setSelectedLandlord(newFilters.landlord || null);
            if (!newFilters.landlord) {
              setSelectedProperty(null);
            }
          }
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
          setSelectedLandlord(null);
          setSelectedProperty(null);
          setDateRange([dayjs().subtract(12, 'month'), dayjs()]);
        }}
        showSearch={false}
      />

      {!selectedLandlord ? (
        <Alert
          message="Select a Landlord"
          description="Please select a landlord to view analytics data."
          type="info"
          showIcon
        />
      ) : loading ? (
        <LoadingWrapper loading={loading} />
      ) : (
        <Tabs
          defaultActiveKey="overview"
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <BarChartOutlined /> Overview
                </span>
              ),
              children: (
                <div>
                  {/* Portfolio Metrics */}
                  {portfolioData && (
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                      <Col xs={24} sm={12} md={6}>
                        <ProCard>
                          <Statistic
                            title="Total Properties"
                            value={portfolioData.totalProperties}
                            prefix={<HomeOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                          />
                        </ProCard>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <ProCard>
                          <Statistic
                            title="Total Rent"
                            value={portfolioData.totalRent}
                            prefix={<DollarOutlined />}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                          />
                        </ProCard>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <ProCard>
                          <Statistic
                            title="Total Expenses"
                            value={portfolioData.totalExpenses}
                            prefix={<DollarOutlined />}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                          />
                        </ProCard>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <ProCard>
                          <Statistic
                            title="Net Income"
                            value={portfolioData.netIncome}
                            prefix={<DollarOutlined />}
                            precision={2}
                            valueStyle={{ color: portfolioData.netIncome >= 0 ? '#3f8600' : '#cf1322' }}
                          />
                        </ProCard>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <ProCard>
                          <Statistic
                            title="Occupancy Rate"
                            value={portfolioData.occupancyRate}
                            suffix="%"
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                          />
                        </ProCard>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <ProCard>
                          <Statistic
                            title="Occupied Units"
                            value={portfolioData.occupiedUnits}
                            suffix={`/ ${portfolioData.totalUnits}`}
                            prefix={<HomeOutlined />}
                          />
                        </ProCard>
                      </Col>
                    </Row>
                  )}

                  {/* Property Performance Chart */}
                  {portfolioData && (
                    <Card title="Portfolio Performance" style={{ marginBottom: 24 }}>
                      <PortfolioPerformanceChart data={portfolioData} />
                    </Card>
                  )}

                  {/* Property-specific metrics */}
                  {propertyData && (
                    <Card title={`Property: ${propertyData.propertyName}`} style={{ marginBottom: 24 }}>
                      <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                          <Statistic
                            title="ROI"
                            value={propertyData.roi}
                            suffix="%"
                            prefix={<ArrowUpOutlined />}
                            valueStyle={{ color: propertyData.roi >= 0 ? '#3f8600' : '#cf1322' }}
                          />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Statistic
                            title="Net Income"
                            value={propertyData.netIncome}
                            prefix={<DollarOutlined />}
                            precision={2}
                          />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Statistic
                            title="Occupancy"
                            value={propertyData.occupancyRate}
                            suffix="%"
                          />
                        </Col>
                      </Row>
                    </Card>
                  )}
                </div>
              ),
            },
            {
              key: 'cashflow',
              label: (
                <span>
                  <LineChartOutlined /> Cash Flow Forecast
                </span>
              ),
              children: (
                <div>
                  {cashFlowData ? (
                    <>
                      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={8}>
                          <ProCard>
                            <Statistic
                              title="Total Projected Income"
                              value={cashFlowData.totalProjectedIncome}
                              prefix={<DollarOutlined />}
                              precision={2}
                              valueStyle={{ color: '#3f8600' }}
                            />
                          </ProCard>
                        </Col>
                        <Col xs={24} sm={8}>
                          <ProCard>
                            <Statistic
                              title="Total Projected Expenses"
                              value={cashFlowData.totalProjectedExpenses}
                              prefix={<DollarOutlined />}
                              precision={2}
                              valueStyle={{ color: '#cf1322' }}
                            />
                          </ProCard>
                        </Col>
                        <Col xs={24} sm={8}>
                          <ProCard>
                            <Statistic
                              title="Total Net Cash Flow"
                              value={cashFlowData.totalNetCashFlow}
                              prefix={<DollarOutlined />}
                              precision={2}
                              valueStyle={{ color: cashFlowData.totalNetCashFlow >= 0 ? '#3f8600' : '#cf1322' }}
                            />
                          </ProCard>
                        </Col>
                      </Row>
                      <Card title="12-Month Cash Flow Forecast">
                        <CashFlowChart data={cashFlowData.forecast} />
                      </Card>
                    </>
                  ) : (
                    <Empty description="No cash flow data available" />
                  )}
                </div>
              ),
            },
            {
              key: 'risks',
              label: (
                <span>
                  <WarningOutlined /> Risk Analysis
                </span>
              ),
              children: (
                <div>
                  <Card title="Tenant Delinquency Risk Analysis" style={{ marginBottom: 24 }}>
                    <Alert
                      message="Risk Scoring"
                      description="Tenants are scored 0-100 based on payment history. Higher scores indicate higher risk of payment delinquency."
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                    {tenantRisks.length > 0 ? (
                      <>
                        <DelinquencyRiskChart data={tenantRisks} />
                        <div style={{ marginTop: 24 }}>
                          <Table
                            columns={tenantRiskColumns}
                            dataSource={tenantRisks}
                            rowKey="tenantId"
                            pagination={{ pageSize: 10 }}
                          />
                        </div>
                      </>
                    ) : (
                      <Empty description="No tenant risk data available. Risk analysis requires payment history." />
                    )}
                  </Card>
                </div>
              ),
            },
          ]}
        />
      )}
    </PageLayout>
  );
}

