'use client';

import { Typography, Card, Row, Col } from 'antd';
import { ShopOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function VendorDashboard() {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <ShopOutlined /> Vendor Dashboard
      </Title>
      <Text type="secondary">
        Welcome to your vendor dashboard. This page is under development.
      </Text>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card>
            <Title level={4}>Vendor Features</Title>
            <Text>
              Vendor-specific features will be available here soon.
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

