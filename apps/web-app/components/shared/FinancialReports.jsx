"use client";

import { useState, useEffect } from 'react';
import { Card, Table, DatePicker, Select, Button, Space, Statistic, Row, Col, Tag, message, Dropdown } from 'antd';
import { DollarOutlined, DownloadOutlined, ReloadOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import { ProCard } from '../shared/LazyProComponents';
import dayjs from 'dayjs';
import { exportToCSV, exportFinancialReportToPDF } from '@/lib/utils/export-utils';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Financial Reports Component for PMCs
 * Generate and view financial reports by landlord/property
 */
export default function FinancialReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    landlordId: 'all',
    propertyId: 'all',
    dateRange: [dayjs().startOf('month'), dayjs().endOf('month')],
  });
  const [landlords, setLandlords] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchReport();
    fetchLandlords();
  }, [filters]);

  const fetchLandlords = async () => {
    try {
      // Use direct fetch for legacy endpoint (no v1 equivalent yet)
      const response = await fetch('/api/landlords', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch landlords');
      }
      const data = await response.json();
      if (data.success || data.landlords) {
        setLandlords(data.landlords || data.data || []);
      }
    } catch (error) {
      console.error('[Financial Reports] Error fetching landlords:', error);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      // Use v1Api analytics endpoints
      const { v1Api } = await import('@/lib/api/v1-client');
      
      // Build query params
      const queryParams = {};
      if (filters.landlordId !== 'all') {
        queryParams.landlordId = filters.landlordId;
      }
      if (filters.propertyId !== 'all') {
        queryParams.propertyId = filters.propertyId;
      }
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        queryParams.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        queryParams.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }
      
      // Fetch report data using v1Api analytics
      const response = await v1Api.analytics.getPortfolioPerformance(queryParams);
      const reportData = response.data || response;
      setReport(reportData);
    } catch (error) {
      console.error('[Financial Reports] Error:', error);
      message.error(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'pdf') => {
    if (!report) {
      message.warning('Please generate a report first');
      return;
    }

    try {
      if (format === 'pdf') {
        await exportFinancialReportToPDF(report, 'financial-report');
        message.success('PDF exported successfully');
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
          report.byLandlord.forEach(item => {
            exportData.push({
              type: 'Landlord',
              landlord: `${item.landlord?.firstName || ''} ${item.landlord?.lastName || ''}`.trim(),
              revenue: item.revenue || 0,
              expenses: item.expenses || 0,
              netIncome: item.netIncome || 0,
              propertyCount: item.propertyCount || 0,
            });
          });
        }
        
        // Add by property data
        if (report.byProperty && report.byProperty.length > 0) {
          report.byProperty.forEach(item => {
            exportData.push({
              type: 'Property',
              property: item.property?.propertyName || item.property?.addressLine1 || '',
              landlord: `${item.landlord?.firstName || ''} ${item.landlord?.lastName || ''}`.trim(),
              revenue: item.revenue || 0,
              expenses: item.expenses || 0,
              netIncome: item.netIncome || 0,
              unitCount: item.unitCount || 0,
            });
          });
        }
        
        const csvColumns = [
          { title: 'Type', dataIndex: 'type' },
          { title: 'Landlord/Property', dataIndex: 'landlord' },
          { title: 'Property', dataIndex: 'property' },
          { title: 'Revenue', dataIndex: 'revenue' },
          { title: 'Expenses', dataIndex: 'expenses' },
          { title: 'Net Income', dataIndex: 'netIncome' },
          { title: 'Properties/Units', dataIndex: 'propertyCount' },
        ];
        
        exportToCSV(exportData, csvColumns, 'financial-report');
        message.success('CSV exported successfully');
      }
    } catch (error) {
      console.error('[Financial Reports] Export error:', error);
      message.error(error.message || 'Failed to export report');
    }
  };

  const exportMenuItems = [
    {
      key: 'pdf',
      label: 'Export as PDF',
      icon: <FilePdfOutlined />,
      onClick: () => handleExport('pdf'),
    },
    {
      key: 'csv',
      label: 'Export as CSV (Excel)',
      icon: <FileExcelOutlined />,
      onClick: () => handleExport('csv'),
    },
  ];

  const summaryColumns = [
    {
      title: 'Landlord',
      key: 'landlord',
      render: (_, record) => (
        <span>
          {record.landlord.firstName} {record.landlord.lastName}
        </span>
      ),
    },
    {
      title: 'Properties',
      dataIndex: 'propertyCount',
      key: 'propertyCount',
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (amount) => <Tag color="green">${amount.toLocaleString()}</Tag>,
    },
    {
      title: 'Expenses',
      dataIndex: 'expenses',
      key: 'expenses',
      render: (amount) => <Tag color="red">${amount.toLocaleString()}</Tag>,
    },
    {
      title: 'Net Income',
      dataIndex: 'netIncome',
      key: 'netIncome',
      render: (amount) => (
        <Tag color={amount >= 0 ? 'green' : 'red'}>
          ${amount.toLocaleString()}
        </Tag>
      ),
    },
  ];

  const propertyColumns = [
    {
      title: 'Property',
      key: 'property',
      render: (_, record) => (
        <span>
          {record.property.propertyName || record.property.addressLine1}
        </span>
      ),
    },
    {
      title: 'Landlord',
      key: 'landlord',
      render: (_, record) => (
        <span>
          {record.landlord.firstName} {record.landlord.lastName}
        </span>
      ),
    },
    {
      title: 'Units',
      dataIndex: 'unitCount',
      key: 'unitCount',
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (amount) => <Tag color="green">${amount.toLocaleString()}</Tag>,
    },
    {
      title: 'Expenses',
      dataIndex: 'expenses',
      key: 'expenses',
      render: (amount) => <Tag color="red">${amount.toLocaleString()}</Tag>,
    },
    {
      title: 'Net Income',
      dataIndex: 'netIncome',
      key: 'netIncome',
      render: (amount) => (
        <Tag color={amount >= 0 ? 'green' : 'red'}>
          ${amount.toLocaleString()}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <ProCard
        title={
          <Space>
            <DollarOutlined />
            <span>Financial Reports</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchReport} loading={loading}>
              Refresh
            </Button>
            <Dropdown menu={{ items: exportMenuItems }} trigger={['click']}>
              <Button type="primary" icon={<DownloadOutlined />}>
                Export
              </Button>
            </Dropdown>
          </Space>
        }
      >
        {/* Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Space wrap>
            <Select
              value={filters.landlordId}
              onChange={(value) => setFilters({ ...filters, landlordId: value })}
              style={{ width: 200 }}
            >
              <Option value="all">All Landlords</Option>
              {landlords.map(landlord => (
                <Option key={landlord.id} value={landlord.id}>
                  {landlord.firstName} {landlord.lastName}
                </Option>
              ))}
            </Select>

            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
          </Space>
        </Card>

        {/* Summary Statistics */}
        {report?.summary && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={report.summary.totalRevenue}
                  prefix="$"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Expenses"
                  value={report.summary.totalExpenses}
                  prefix="$"
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Net Income"
                  value={report.summary.netIncome}
                  prefix="$"
                  valueStyle={{ 
                    color: report.summary.netIncome >= 0 ? '#3f8600' : '#cf1322' 
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Properties"
                  value={report.summary.propertyCount}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* By Landlord */}
        {report?.byLandlord && report.byLandlord.length > 0 && (
          <Card title="By Landlord" style={{ marginBottom: 24 }}>
            <Table
              columns={summaryColumns}
              dataSource={report.byLandlord}
              rowKey={(record) => record.landlord.id}
              pagination={false}
            />
          </Card>
        )}

        {/* By Property */}
        {report?.byProperty && report.byProperty.length > 0 && (
          <Card title="By Property">
            <Table
              columns={propertyColumns}
              dataSource={report.byProperty}
              rowKey={(record) => record.property.id}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        )}
      </ProCard>
    </div>
  );
}

