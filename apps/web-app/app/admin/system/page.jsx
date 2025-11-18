"use client";

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Tag, Spin, Alert, Button } from 'antd';
import {
  DatabaseOutlined,
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export default function AdminSystemPage() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getSystemHealth();

      if (data.success) {
        setHealth(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch system health');
      }
    } catch (err) {
      console.error('Error fetching health:', err);
      setError(err?.message || 'Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !health) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error && !health) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchHealth}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <DatabaseOutlined /> System Monitoring
        </Title>
        <Button icon={<ReloadOutlined />} onClick={fetchHealth} loading={loading}>
          Refresh
        </Button>
      </div>

      {health && (
        <>
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Database Status"
                  value={health.database.status}
                  prefix={
                    health.database.healthy ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    )
                  }
                  suffix={
                    <Tag color={health.database.healthy ? 'success' : 'error'}>
                      {health.database.responseTime}ms
                    </Tag>
                  }
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Active Sessions"
                  value={health.metrics.system.activeSessions}
                  prefix={<UserOutlined />}
                />
              </Col>
            </Row>
          </Card>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Landlords"
                  value={health.metrics.users.landlords}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Tenants"
                  value={health.metrics.users.tenants}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Users"
                  value={health.metrics.users.total}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card>
                <Statistic
                  title="Total Properties"
                  value={health.metrics.properties.total}
                  prefix={<HomeOutlined />}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title="Properties with Active Leases"
                  value={health.metrics.properties.withActiveLeases}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Recent Activity (Last 24 Hours)">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Logins"
                  value={health.activity.last24Hours.logins}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="New Users"
                  value={health.activity.last24Hours.newUsers}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="New Properties"
                  value={health.activity.last24Hours.newProperties}
                />
              </Col>
            </Row>
          </Card>

          {health.metrics.system.recentErrors > 0 && (
            <Alert
              message="System Alerts"
              description={`${health.metrics.system.recentErrors} errors in the last 24 hours`}
              type="warning"
              showIcon
              style={{ marginTop: 24 }}
            />
          )}

          <Card style={{ marginTop: 24 }}>
            <Typography.Text type="secondary">
              Last updated: {new Date(health.timestamp).toLocaleString()}
            </Typography.Text>
          </Card>
        </>
      )}
    </div>
  );
}

