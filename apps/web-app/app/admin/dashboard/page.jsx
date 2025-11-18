"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Typography, Space, Button, Spin, Alert, Row, Col } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  SettingOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdmin();
  }, []);

  const fetchAdmin = async () => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getCurrentUser();

      if (data.success) {
        setAdmin(data.user);
      } else {
        // Not authenticated, redirect to login
        router.push('/admin/login');
      }
    } catch (err) {
      console.error('Error fetching admin:', err);
      setError(err?.message || 'An error occurred');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <DashboardOutlined /> Admin Dashboard
        </Title>
        <Text type="secondary">
          Welcome back, {admin.firstName} {admin.lastName}
        </Text>
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space direction="vertical" size="small">
            <Text strong>Admin Information</Text>
            <div>
              <Text type="secondary">Email: </Text>
              <Text>{admin.email}</Text>
            </div>
            <div>
              <Text type="secondary">Role: </Text>
              <Text>{admin.role}</Text>
            </div>
            <div>
              <Text type="secondary">Status: </Text>
              <Text type={admin.isActive ? 'success' : 'danger'}>
                {admin.isActive ? 'Active' : 'Inactive'}
              </Text>
            </div>
          </Space>
        </Card>

        <Card title="Quick Actions">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Link href="/admin/users">
                <Button type="primary" icon={<UserOutlined />} block size="large">
                  User Management
                </Button>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link href="/admin/system">
                <Button icon={<DatabaseOutlined />} block size="large">
                  System Monitoring
                </Button>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link href="/admin/audit-logs">
                <Button icon={<FileTextOutlined />} block size="large">
                  Audit Logs
                </Button>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link href="/admin/settings">
                <Button icon={<SettingOutlined />} block size="large">
                  Platform Settings
                </Button>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link href="/admin/analytics">
                <Button icon={<BarChartOutlined />} block size="large">
                  Analytics & Reports
                </Button>
              </Link>
            </Col>
          </Row>
        </Card>

        <Card title="System Status">
          <Text>Admin panel is ready. Use the quick actions above to manage the platform.</Text>
        </Card>
      </Space>
    </div>
  );
}

