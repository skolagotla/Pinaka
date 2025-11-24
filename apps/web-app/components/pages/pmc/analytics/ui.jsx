"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Button,
  Select,
  Label,
  TextInput,
  Alert,
  Spinner,
  Tabs,
  Badge,
} from 'flowbite-react';
import {
  HiCurrencyDollar,
  HiHome,
  HiUser,
  HiArrowUp,
  HiArrowDown,
  HiDownload,
  HiChartBar,
  HiTrendingUp,
  HiPieChart,
  HiExclamationTriangle,
} from 'react-icons/hi';
import { ProCard } from '@/components/shared/LazyProComponents';
import { PageLayout, FilterBar, LoadingWrapper, FlowbiteTable, EmptyState } from '@/components/shared';
import { useLoading } from '@/lib/hooks/useLoading';
// useUnifiedApi removed - use v2Api from @/lib/api/v2-client';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useLandlords, useProperties, useTenants } from '@/lib/hooks/useV2Data';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';

// Dynamically import charts
const CashFlowChart = dynamic(
  () => import('@/components/charts/CashFlowChart'),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center">Loading chart...</div> }
);

const PortfolioPerformanceChart = dynamic(
  () => import('@/components/charts/PortfolioPerformanceChart'),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center">Loading chart...</div> }
);

const DelinquencyRiskChart = dynamic(
  () => import('@/components/charts/DelinquencyRiskChart'),
  { ssr: false, loading: () => <div className="h-72 flex items-center justify-center">Loading chart...</div> }
);

export default function AnalyticsDashboardClient({ user, userRole }) {
  // useUnifiedApi removed({ showUserMessage: false });
  const { user: v2User } = useV2Auth();
  const organizationId = v2User?.organization_id;
  const { loading, withLoading } = useLoading(true);
  const [dateRangeStart, setDateRangeStart] = useState(dayjs().subtract(12, 'month').format('YYYY-MM-DD'));
  const [dateRangeEnd, setDateRangeEnd] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  
  // v2 API hooks
  const { data: landlordsData } = useLandlords(organizationId);
  const { data: propertiesData } = useProperties(organizationId);
  const { data: tenantsData } = useTenants(organizationId);
  
  const landlords = landlordsData || [];
  const properties = propertiesData?.filter(p => !selectedLandlord || p.landlord_id === selectedLandlord) || [];
  const tenants = tenantsData || [];
  
  // Analytics data
  const [portfolioData, setPortfolioData] = useState(null);
  const [propertyData, setPropertyData] = useState(null);
  const [cashFlowData, setCashFlowData] = useState(null);
  const [tenantRisks, setTenantRisks] = useState([]);

  useEffect(() => {
    if (selectedLandlord) {
      loadData();
    }
  }, [selectedLandlord, dateRangeStart, dateRangeEnd, selectedProperty]);

  const loadData = async () => {
    if (!selectedLandlord) return;
    await withLoading(async () => {
      try {
        const startDate = dayjs(dateRangeStart);
        const endDate = dayjs(dateRangeEnd);

      // Load portfolio performance
      const { v2Api } = await import('@/lib/api/v2-client');
      const portfolioResponse = await v2Api.specialized.portfolioperformance({
        landlordId: selectedLandlord,
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
      const cashFlowResponse = await v2Api.specialized.cashflowforecast({
        landlordId: selectedLandlord,
        months: 12,
      });
      if (cashFlowResponse.success) {
        setCashFlowData(cashFlowResponse.data);
      }

      // Tenants are loaded via v2 hooks above
      const filteredTenants = tenants.filter(t => t.landlord_id === selectedLandlord);
      
      // Load risk for each tenant
      const riskPromises = filteredTenants.map(async (tenant) => {
        try {
          const riskResponse = await v2Api.specialized.tenantdelinquencyrisk({ tenantId: tenant.id });
          if (riskResponse.success) {
            return {
              tenantId: tenant.id,
              firstName: tenant.firstName,
              lastName: tenant.lastName,
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
      const startDate = dayjs(dateRangeStart);
      const endDate = dayjs(dateRangeEnd);
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

      const { v2Api } = await import('@/lib/api/v2-client');
      const query = {
        type,
        format,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...(selectedProperty && { propertyId: selectedProperty }),
        ...(selectedLandlord && { landlordId: selectedLandlord }),
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
      header: 'Tenant',
      accessorKey: 'tenant',
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    {
      header: 'Risk Score',
      accessorKey: 'riskScore',
      cell: ({ row }) => {
        const score = row.original.riskScore;
        let color = 'success';
        if (score >= 70) color = 'failure';
        else if (score >= 40) color = 'warning';
        return <Badge color={color}score}/100</Badge>;
      },
    },
    {
      header: 'Risk Level',
      accessorKey: 'riskLevel',
      cell: ({ row }) => {
        const level = row.original.riskLevel;
        const colors = { high: 'failure', medium: 'warning', low: 'success' };
        return <Badge color={colors[level}level.toUpperCase()}</Badge>;
      },
    },
    {
      header: 'Late Payments',
      accessorKey: 'latePayments',
    },
    {
      header: 'Missed Payments',
      accessorKey: 'missedPayments',
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
    dateRange: dateRangeStart && dateRangeEnd ? [dayjs(dateRangeStart), dayjs(dateRangeEnd)] : null,
    property: selectedProperty || null,
  };

  return (
    <PageLayout
      headerTitle={<><HiChartBar className="inline mr-2" /> Analytics Dashboard</>}
      headerDescription="Advanced insights and performance metrics"
      headerActions={
        <Button
          key="export-json"
          color="light"
          onClick={() => handleExport('json', 'portfolio')}
          disabled={!selectedLandlord}
        >
          <HiDownload className="mr-2 h-4 w-4" />
          Export JSON
        </Button>,
        <Button
          key="export-csv"
          color="light"
          onClick={() => handleExport('csv', 'portfolio')}
          disabled={!selectedLandlord}
        >
          <HiDownload className="mr-2 h-4 w-4" />
          Export CSV
        </Button>,
      }
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
            if (Array.isArray(newFilters.dateRange) && newFilters.dateRange.length === 2) {
              setDateRangeStart(newFilters.dateRange[0].format('YYYY-MM-DD'));
              setDateRangeEnd(newFilters.dateRange[1].format('YYYY-MM-DD'));
            }
          } else if (newFilters.dateRange === null) {
            setDateRangeStart(dayjs().subtract(12, 'month').format('YYYY-MM-DD'));
            setDateRangeEnd(dayjs().format('YYYY-MM-DD'));
          }
          if (newFilters.property !== undefined) {
            setSelectedProperty(newFilters.property || null);
          }
        }}
        onReset={() => {
          setSelectedLandlord(null);
          setSelectedProperty(null);
          setDateRangeStart(dayjs().subtract(12, 'month').format('YYYY-MM-DD'));
          setDateRangeEnd(dayjs().format('YYYY-MM-DD'));
        }}
        showSearch={false}
      />

      {!selectedLandlord ? (
        <Alert color="info">
          <div>
            <div className="font-semibold mb-2">Select a Landlord</div>
            <div>Please select a landlord to view analytics data.</div>
          </div>
        </Alert>
      ) : loading ? (
        <LoadingWrapper loading={loading} />
      ) : (
        <Tabs aria-label="Analytics tabs">
          <Tabs.Item active title={<><HiChartBar className="mr-2 h-4 w-4" /> Overview</>}>
            <div className="space-y-6">
              {/* Portfolio Metrics */}
              {portfolioData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                  <Card>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Total Properties</div>
                      <div className="text-2xl font-semibold text-blue-600">{portfolioData.totalProperties}</div>
                      <HiHome className="h-5 w-5 text-blue-600 mx-auto mt-2" />
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Total Rent</div>
                      <div className="text-2xl font-semibold text-green-600">
                        ${portfolioData.totalRent.toFixed(2)}
                      </div>
                      <HiCurrencyDollar className="h-5 w-5 text-green-600 mx-auto mt-2" />
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Total Expenses</div>
                      <div className="text-2xl font-semibold text-red-600">
                        ${portfolioData.totalExpenses.toFixed(2)}
                      </div>
                      <HiCurrencyDollar className="h-5 w-5 text-red-600 mx-auto mt-2" />
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Net Income</div>
                      <div className={`text-2xl font-semibold ${portfolioData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${portfolioData.netIncome.toFixed(2)}
                      </div>
                      <HiCurrencyDollar className={`h-5 w-5 mx-auto mt-2 ${portfolioData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Occupancy Rate</div>
                      <div className="text-2xl font-semibold text-blue-600">{portfolioData.occupancyRate}%</div>
                      <HiUser className="h-5 w-5 text-blue-600 mx-auto mt-2" />
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Occupied Units</div>
                      <div className="text-2xl font-semibold">
                        {portfolioData.occupiedUnits} / {portfolioData.totalUnits}
                      </div>
                      <HiHome className="h-5 w-5 mx-auto mt-2" />
                    </div>
                  </Card>
                </div>
              )}

              {/* Property Performance Chart */}
              {portfolioData && (
                <Card>
                  <h5 className="text-lg font-semibold mb-4">Portfolio Performance</h5>
                  <PortfolioPerformanceChart data={portfolioData} />
                </Card>
              )}

              {/* Property-specific metrics */}
              {propertyData && (
                <Card>
                  <h5 className="text-lg font-semibold mb-4">Property: {propertyData.propertyName}</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">ROI</div>
                      <div className={`text-2xl font-semibold ${propertyData.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {propertyData.roi}%
                      </div>
                      {propertyData.roi >= 0 ? (
                        <HiArrowUp className="h-5 w-5 text-green-600 mx-auto mt-2" />
                      ) : (
                        <HiArrowDown className="h-5 w-5 text-red-600 mx-auto mt-2" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Net Income</div>
                      <div className="text-2xl font-semibold">
                        ${propertyData.netIncome.toFixed(2)}
                      </div>
                      <HiCurrencyDollar className="h-5 w-5 mx-auto mt-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Occupancy</div>
                      <div className="text-2xl font-semibold">{propertyData.occupancyRate}%</div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </Tabs.Item>
          <Tabs.Item title={<><HiTrendingUp className="mr-2 h-4 w-4" /> Cash Flow Forecast</>}>
            <div className="space-y-6">
              {cashFlowData ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Total Projected Income</div>
                        <div className="text-2xl font-semibold text-green-600">
                          ${cashFlowData.totalProjectedIncome.toFixed(2)}
                        </div>
                        <HiCurrencyDollar className="h-5 w-5 text-green-600 mx-auto mt-2" />
                      </div>
                    </Card>
                    <Card>
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Total Projected Expenses</div>
                        <div className="text-2xl font-semibold text-red-600">
                          ${cashFlowData.totalProjectedExpenses.toFixed(2)}
                        </div>
                        <HiCurrencyDollar className="h-5 w-5 text-red-600 mx-auto mt-2" />
                      </div>
                    </Card>
                    <Card>
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Total Net Cash Flow</div>
                        <div className={`text-2xl font-semibold ${cashFlowData.totalNetCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${cashFlowData.totalNetCashFlow.toFixed(2)}
                        </div>
                        <HiCurrencyDollar className={`h-5 w-5 mx-auto mt-2 ${cashFlowData.totalNetCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                    </Card>
                  </div>
                  <Card>
                    <h5 className="text-lg font-semibold mb-4">12-Month Cash Flow Forecast</h5>
                    <CashFlowChart data={cashFlowData.forecast} />
                  </Card>
                </>
              ) : (
                <EmptyState
                  icon={<HiTrendingUp className="h-12 w-12 text-gray-400" />}
                  title="No cash flow data available"
                  description="Cash flow data will appear here once available"
                />
              )}
            </div>
          </Tabs.Item>
          <Tabs.Item title={<><HiExclamationTriangle className="mr-2 h-4 w-4" /> Risk Analysis</>}>
            <div className="space-y-6">
              <Card>
                <h5 className="text-lg font-semibold mb-4">Tenant Delinquency Risk Analysis</h5>
                <Alert color="info" className="mb-4">
                  <div>
                    <div className="font-semibold mb-2">Risk Scoring</div>
                    <div>Tenants are scored 0-100 based on payment history. Higher scores indicate higher risk of payment delinquency.</div>
                  </div>
                </Alert>
                {tenantRisks.length > 0 ? (
                  <>
                    <DelinquencyRiskChart data={tenantRisks} />
                    <div className="mt-6">
                      <FlowbiteTable
                        columns={tenantRiskColumns}
                        data={tenantRisks}
                        keyField="tenantId"
                        pagination={{ pageSize: 10 }}
                      />
                    </div>
                  </>
                ) : (
                  <EmptyState
                    icon={<HiExclamationTriangle className="h-12 w-12 text-gray-400" />}
                    title="No tenant risk data available"
                    description="Risk analysis requires payment history."
                  />
                )}
              </Card>
            </div>
          </Tabs.Item>
        </Tabs>
      )}
    </PageLayout>
  );
}
