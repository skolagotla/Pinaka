"use client";

/**
 * StatCard Component
 * 
 * Standardized statistics card component for dashboards and summary pages.
 * 
 * Features:
 * - Icon support
 * - Value formatting
 * - Trend indicators (optional)
 * - Click handlers for drill-down
 * - Responsive design
 * 
 * @param {Object} props
 * @param {string} props.title - Stat title
 * @param {number|string} props.value - Stat value
 * @param {React.ReactNode} props.prefix - Prefix (icon or text)
 * @param {React.ReactNode} props.suffix - Suffix (text or unit)
 * @param {object} props.valueStyle - Custom value styles
 * @param {string} props.color - Value color
 * @param {boolean} props.clickable - Make card clickable (default: false)
 * @param {function} props.onClick - Click handler
 * @param {object} props.trend - Trend data: { value: number, isPositive: boolean, label: string }
 * @param {boolean} props.compact - Compact mode (default: false)
 * 
 * @example
 * <StatCard
 *   title="Total Properties"
 *   value={25}
 *   prefix={<HomeOutlined />}
 *   color="#1890ff"
 *   trend={{ value: 12, isPositive: true, label: 'vs last month' }}
 *   onClick={() => router.push('/properties')}
 * />
 */

import React from 'react';
import { Card, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function StatCard({
  title,
  value,
  prefix,
  suffix,
  valueStyle = {},
  color,
  clickable = false,
  onClick,
  trend,
  compact = false,
  ...props
}) {
  const finalValueStyle = {
    fontSize: compact ? '18px' : '20px',
    fontWeight: 600,
    ...(color && { color }),
    ...valueStyle,
  };

  const cardStyle = {
    cursor: clickable ? 'pointer' : 'default',
    transition: clickable ? 'all 0.3s' : 'none',
    ...(clickable && {
      ':hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
    }),
  };

  return (
    <Card
      size={compact ? 'small' : 'default'}
      bodyStyle={{ padding: compact ? '12px' : '16px' }}
      style={cardStyle}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      <Statistic
        title={title}
        value={value}
        prefix={prefix && React.cloneElement(prefix, { style: { fontSize: compact ? '14px' : '16px' } })}
        suffix={suffix}
        valueStyle={finalValueStyle}
      />
      {trend && (
        <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
          <span style={{ color: trend.isPositive ? '#52c41a' : '#ff4d4f', marginRight: 4 }}>
            {trend.isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(trend.value)}%
          </span>
          <Text type="secondary">{trend.label}</Text>
        </div>
      )}
    </Card>
  );
}

