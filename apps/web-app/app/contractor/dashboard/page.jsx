'use client';

import { Typography, Card, Row, Col } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function ContractorDashboard() {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <ToolOutlined /> Contractor Dashboard
      </Title>
      <Text type="secondary">
        Welcome to your contractor dashboard. This page is under development.
      </Text>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card>
            <Title level={4}>Contractor Features</Title>
            <Text>
              Contractor-specific features will be available here soon.
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

