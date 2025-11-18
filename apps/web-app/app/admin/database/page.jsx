"use client";

import { useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Space,
  Statistic,
  Row,
  Col,
  Alert,
  Button,
} from 'antd';
import {
  DatabaseOutlined,
  TableOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function AdminDatabasePage() {
  const [stats, setStats] = useState({
    landlords: 0,
    tenants: 0,
    properties: 0,
    leases: 0,
    documents: 0,
    maintenanceRequests: 0,
  });

  // This is a read-only view. In production, you'd want to add actual database query capabilities
  // For now, we'll show table statistics

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <DatabaseOutlined /> Database Management
      </Title>

      <Alert
        message="Read-Only View"
        description="This is a read-only view of database statistics. Direct database queries are disabled for security."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Landlords"
              value={stats.landlords}
              prefix={<TableOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tenants"
              value={stats.tenants}
              prefix={<TableOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Properties"
              value={stats.properties}
              prefix={<TableOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Leases"
              value={stats.leases}
              prefix={<TableOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Database Tables">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>Core Tables:</Text>
            <ul>
              <li>Admin</li>
              <li>Landlord</li>
              <li>Tenant</li>
              <li>Property</li>
              <li>Unit</li>
              <li>Lease</li>
              <li>Document</li>
              <li>MaintenanceRequest</li>
            </ul>
          </div>
          <div>
            <Text strong>Support Tables:</Text>
            <ul>
              <li>SupportTicket</li>
              <li>SystemAnnouncement</li>
              <li>ContentItem</li>
              <li>ApiKey</li>
              <li>UserActivity</li>
              <li>FailedLoginAttempt</li>
            </ul>
          </div>
        </Space>
      </Card>

      <Card title="Database Operations" style={{ marginTop: 24 }}>
        <Text type="secondary">
          For security reasons, direct database write operations are not available through the admin panel.
          Use the data export feature to backup data, or contact your database administrator for write operations.
        </Text>
      </Card>
    </div>
  );
}
