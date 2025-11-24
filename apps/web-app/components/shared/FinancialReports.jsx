"use client";

import { useState, useEffect } from 'react';
import { Card, Button, Select, Label, Badge, Spinner, Alert, Dropdown } from 'flowbite-react';
import { HiCurrencyDollar, HiDownload, HiRefresh, HiDocument, HiTable } from 'react-icons/hi';
import dayjs from 'dayjs';
import { exportToCSV, exportFinancialReportToPDF } from '@/lib/utils/export-utils';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useLandlords, useProperties } from '@/lib/hooks/useV2Data';
import FlowbiteTable from './FlowbiteTable';
import PageLayout from './PageLayout';
import { notify } from '@/lib/utils/notification-helper';
import { formatAmount } from '@/lib/currency-utils';
import { formatDateDisplay } from '@/lib/utils/safe-date-formatter';

/**
 * Financial Reports Component for PMCs - Migrated to Flowbite
 * Generate and view financial reports by landlord/property
 */
export default function FinancialReports() {
  const { user } = useV2Auth();
  const organizationId = user?.organization_id;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    landlordId: 'all',
    propertyId: 'all',
    dateRange: [dayjs().startOf('month'), dayjs().endOf('month')],
  });
  
  // v2 API hooks
  const { data: landlordsData } = useLandlords(organizationId);
  const { data: propertiesData } = useProperties(organizationId);
  
  const landlords = landlordsData || [];
  const properties = propertiesData || [];

  useEffect(() => {
    fetchReport();
  }, [filters]);
  
  // Landlords and properties are loaded via v2 hooks above

  const fetchReport = async () => {
    try {
      setLoading(true);
      // Use v2Api analytics endpoints
      const { v2Api } = await import('@/lib/api/v2-client');
      
      // Build query params
      const queryParams = {};
      if (filters.landlordId !== 'all') {
        queryParams.landlord_id = filters.landlordId;
      }
      if (filters.propertyId !== 'all') {
        queryParams.property_id = filters.propertyId;
      }
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        queryParams.start_date = filters.dateRange[0].format('YYYY-MM-DD');
        queryParams.end_date = filters.dateRange[1].format('YYYY-MM-DD');
      }
      
      // TODO: Implement v2 endpoint for portfolio performance analytics
      const response = await v2Api.getPortfolioPerformance?.(queryParams) || { data: null };
      const reportData = response.data || response;
      setReport(reportData);
    } catch (error) {
      console.error('[Financial Reports] Error:', error);
      notify.error(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'pdf') => {
    if (!report) {
      notify.warning('Please generate a report first');
      return;
    }

    try {
      if (format === 'pdf') {
        await exportFinancialReportToPDF(report, 'financial-report');
        notify.success('PDF exported successfully');
      } else if (format === 'csv') {
        // Export summary data
        const exportData = [];
        
        // Add summary row
        if (report.summary) {
          exportData.push({
            type: 'Summary',
            totalRevenue: report.summary.totalRevenue || 0,
            totalExpenses: report.summary.totalExpenses || 0,
            netIncome: report.summary.netIncome || 0,
            propertyCount: report.summary.propertyCount || 0,
          });
        }
        
        // Add by landlord data
        if (report.byLandlord && report.byLandlord.length > 0) {
          report.byLandlord.forEach(landlord => {
            exportData.push({
              type: 'Landlord',
              landlord: landlord.name || 'Unknown',
              totalRevenue: landlord.totalRevenue || 0,
              totalExpenses: landlord.totalExpenses || 0,
              netIncome: landlord.netIncome || 0,
              propertyCount: landlord.propertyCount || 0,
            });
          });
        }
        
        // Add by property data
        if (report.byProperty && report.byProperty.length > 0) {
          report.byProperty.forEach(property => {
            exportData.push({
              type: 'Property',
              property: property.name || 'Unknown',
              totalRevenue: property.totalRevenue || 0,
              totalExpenses: property.totalExpenses || 0,
              netIncome: property.netIncome || 0,
            });
          });
        }
        
        await exportToCSV(exportData, 'financial-report');
        notify.success('CSV exported successfully');
      }
    } catch (error) {
      console.error('[Financial Reports] Export error:', error);
      notify.error('Failed to export report');
    }
  };

  const statsData = report ? [
    {
      title: 'Total Revenue',
      value: formatAmount(report.summary?.totalRevenue || 0),
      prefix: <HiCurrencyDollar className="h-5 w-5" />,
      valueStyle: { color: '#10b981' },
    },
    {
      title: 'Total Expenses',
      value: formatAmount(report.summary?.totalExpenses || 0),
      prefix: <HiCurrencyDollar className="h-5 w-5" />,
      valueStyle: { color: '#ef4444' },
    },
    {
      title: 'Net Income',
      value: formatAmount(report.summary?.netIncome || 0),
      prefix: <HiCurrencyDollar className="h-5 w-5" />,
      valueStyle: { color: report.summary?.netIncome >= 0 ? '#10b981' : '#ef4444' },
    },
    {
      title: 'Properties',
      value: report.summary?.propertyCount || 0,
      prefix: <HiTable className="h-5 w-5" />,
    },
  ] : [];

  const tableColumns = [
    {
      title: 'Landlord',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span className="font-semibold">{name || 'N/A'}</span>,
    },
    {
      title: 'Revenue',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (amount) => (
        <span className="text-green-600 font-semibold">{formatAmount(amount || 0)}</span>
      ),
    },
    {
      title: 'Expenses',
      dataIndex: 'totalExpenses',
      key: 'totalExpenses',
      render: (amount) => (
        <span className="text-red-600 font-semibold">{formatAmount(amount || 0)}</span>
      ),
    },
    {
      title: 'Net Income',
      dataIndex: 'netIncome',
      key: 'netIncome',
      render: (amount) => {
        const isPositive = (amount || 0) >= 0;
        return (
          <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatAmount(amount || 0)}
          </span>
        );
      },
    },
    {
      title: 'Properties',
      dataIndex: 'propertyCount',
      key: 'propertyCount',
      render: (count) => <Badge color="info">{count || 0}</Badge>,
    },
  ];

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiDollar className="h-5 w-5" />
          <span>Financial Reports</span>
        </div>
      }
      headerActions={[
        <Button
          key="refresh"
          color="gray"
          onClick={fetchReport}
          disabled={loading}
        >
          <HiRefresh className="h-4 w-4 mr-2" />
          Refresh
        </Button>,
        <Dropdown
          key="export"
          label={
            <Button color="blue">
              <HiDownload className="h-4 w-4 mr-2" />
              Export
            </Button>
          }
          dismissOnClick={false}
        >
          <Dropdown.Item onClick={() => handleExport('pdf')}>
            <HiDocument className="h-4 w-4 mr-2" />
            Export as PDF
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleExport('csv')}>
            <HiTable className="h-4 w-4 mr-2" />
            Export as CSV
          </Dropdown.Item>
        </Dropdown>,
      ]}
      stats={statsData}
      statsCols={4}
    >
      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="landlord-filter">Landlord</Label>
            <Select
              id="landlord-filter"
              value={filters.landlordId}
              onChange={(e) => setFilters({ ...filters, landlordId: e.target.value })}
            >
              <option value="all">All Landlords</option>
              {landlords.map(landlord => (
                <option key={landlord.id} value={landlord.id}>
                  {landlord.firstName} {landlord.lastName}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="property-filter">Property</Label>
            <Select
              id="property-filter"
              value={filters.propertyId}
              onChange={(e) => setFilters({ ...filters, propertyId: e.target.value })}
            >
              <option value="all">All Properties</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.propertyName || property.addressLine1}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="date-range">Date Range</Label>
            <div className="flex gap-2">
              <input
                id="date-range"
                type="date"
                value={filters.dateRange[0]?.format('YYYY-MM-DD') || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  dateRange: [dayjs(e.target.value), filters.dateRange[1]]
                })}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="date"
                value={filters.dateRange[1]?.format('YYYY-MM-DD') || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  dateRange: [filters.dateRange[0], dayjs(e.target.value)]
                })}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Report Content */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <Spinner size="xl" />
            <p className="mt-4 text-gray-500">Generating report...</p>
          </div>
        </Card>
      ) : !report ? (
        <Card>
          <Alert color="info">
            <div>
              <div className="font-semibold">No report generated</div>
              <div className="text-sm">Select filters and click Refresh to generate a report</div>
            </div>
          </Alert>
        </Card>
      ) : (
        <>
          {/* Summary Card */}
          {report.summary && (
            <Card className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-xl font-semibold text-green-600">
                    {formatAmount(report.summary.totalRevenue || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="text-xl font-semibold text-red-600">
                    {formatAmount(report.summary.totalExpenses || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Net Income</p>
                  <p className={`text-xl font-semibold ${report.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(report.summary.netIncome || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Properties</p>
                  <p className="text-xl font-semibold">{report.summary.propertyCount || 0}</p>
                </div>
              </div>
            </Card>
          )}

          {/* By Landlord Table */}
          {report.byLandlord && report.byLandlord.length > 0 && (
            <Card className="mb-6">
              <h3 className="text-lg font-semibold mb-4">By Landlord</h3>
              <FlowbiteTable
                dataSource={report.byLandlord}
                columns={tableColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          )}

          {/* By Property Table */}
          {report.byProperty && report.byProperty.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold mb-4">By Property</h3>
              <FlowbiteTable
                dataSource={report.byProperty}
                columns={[
                  {
                    title: 'Property',
                    dataIndex: 'name',
                    key: 'name',
                    render: (name) => <span className="font-semibold">{name || 'N/A'}</span>,
                  },
                  {
                    title: 'Revenue',
                    dataIndex: 'totalRevenue',
                    key: 'totalRevenue',
                    render: (amount) => (
                      <span className="text-green-600 font-semibold">{formatAmount(amount || 0)}</span>
                    ),
                  },
                  {
                    title: 'Expenses',
                    dataIndex: 'totalExpenses',
                    key: 'totalExpenses',
                    render: (amount) => (
                      <span className="text-red-600 font-semibold">{formatAmount(amount || 0)}</span>
                    ),
                  },
                  {
                    title: 'Net Income',
                    dataIndex: 'netIncome',
                    key: 'netIncome',
                    render: (amount) => {
                      const isPositive = (amount || 0) >= 0;
                      return (
                        <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {formatAmount(amount || 0)}
                        </span>
                      );
                    },
                  },
                ]}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          )}
        </>
      )}
    </PageLayout>
  );
}
