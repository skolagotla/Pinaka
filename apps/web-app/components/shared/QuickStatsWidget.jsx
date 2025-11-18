"use client";

import { Card, Statistic, Row, Col, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function QuickStatsWidget({ title, stats = [], icon }) {
  return (
    <Card
      title={
        <span>
          {icon} {title}
        </span>
      }
      style={{ height: '100%', minHeight: '300px' }}
      bodyStyle={{ padding: '16px' }}
    >
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={12} lg={stats.length > 2 ? 8 : 12} key={index}>
            <Statistic
              title={stat.label}
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              valueStyle={{
                color: stat.color || '#3f8600',
                fontSize: stat.size || '24px',
              }}
              formatter={(value) => {
                if (typeof value === 'number') {
                  return stat.format === 'currency'
                    ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: stat.currency || 'USD',
                      }).format(value)
                    : stat.format === 'percent'
                    ? `${value}%`
                    : value.toLocaleString();
                }
                return value;
              }}
            />
            {stat.trend && (
              <div style={{ marginTop: 8 }}>
                <Text
                  type={stat.trend > 0 ? 'success' : stat.trend < 0 ? 'danger' : 'secondary'}
                  style={{ fontSize: '12px' }}
                >
                  {stat.trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(stat.trend)}% vs last period
                </Text>
              </div>
            )}
            {stat.description && (
              <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 4 }}>
                {stat.description}
              </Text>
            )}
          </Col>
        ))}
      </Row>
    </Card>
  );
}

