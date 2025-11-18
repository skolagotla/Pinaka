"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Select,
  Button,
  Table,
  Tag,
  Spin,
  Space,
} from 'antd';
import {
  BarChartOutlined,
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  ToolOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const recentActivityColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: 'Admin',
      key: 'admin',
      render: (_, record) => {
        if (record?.admin) {
          return `${record.admin.firstName} ${record.admin.lastName}`;
        }
        return record?.googleEmail || 'System';
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => action ? <Tag color="blue">{action}</Tag> : '-',
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource) => resource || '-',
    },
    {
      title: 'Status',
      dataIndex: 'success',
      key: 'success',
      render: (success) => (
        <Tag color={success ? 'success' : 'error'}>
          {success ? 'Success' : 'Failed'}
        </Tag>
      ),
    },
  ];

  if (loading && !analytics) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <BarChartOutlined /> Analytics & Reporting
        </Title>
        <Space>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 150 }}
          >
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
            <Option value="90d">Last 90 Days</Option>
            <Option value="1y">Last Year</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchAnalytics} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>

      {analytics && analytics.overview ? (
        <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Landlords"
                  value={analytics.overview?.users?.landlords || 0}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Tenants"
                  value={analytics.overview?.users?.tenants || 0}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Properties"
                  value={analytics.overview?.properties?.total || 0}
                  prefix={<HomeOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Leases"
                  value={analytics.overview?.leases?.active || 0}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Maintenance Requests"
                  value={analytics.overview?.maintenance?.total || 0}
                  prefix={<ToolOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Open Maintenance"
                  value={analytics.overview?.maintenance?.open || 0}
                  prefix={<ToolOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Documents"
                  value={analytics.overview?.documents?.total || 0}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {analytics.activity && (
            <>
              <Card title="Top Actions" style={{ marginBottom: 24 }}>
                <Table
                  dataSource={analytics.activity.topActions || []}
                  columns={[
                    { title: 'Action', dataIndex: 'action', key: 'action' },
                    { title: 'Count', dataIndex: 'count', key: 'count' },
                  ]}
                  pagination={false}
                  rowKey="action"
                />
              </Card>

              <Card title="Recent Activity">
                <Table
                  columns={recentActivityColumns}
                  dataSource={analytics.activity.recent || []}
                  pagination={false}
                  rowKey="id"
                />
              </Card>
            </>
          )}
        </>
      ) : error ? (
        <Card>
          <Typography.Text type="danger">{error}</Typography.Text>
          <br />
          <Button onClick={fetchAnalytics} style={{ marginTop: 16 }}>
            Retry
          </Button>
        </Card>
      ) : (
        <Card>
          <Typography.Text type="secondary">No analytics data available. Please refresh to load data.</Typography.Text>
        </Card>
      )}
    </div>
  );
}

