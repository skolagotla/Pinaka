/**
 * Shared Dashboard Stat Card Component
 * Displays a statistic card with icon, title, value, and optional suffix
 */

import { Card, Statistic } from 'antd';

export default function DashboardStatCard({ 
  title, 
  value, 
  suffix, 
  prefix,
  icon,
  color = '#1890ff',
  loading = false,
  onClick,
  style = {}
}) {
  const cardStyle = {
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s',
    ...style
  };

  if (onClick) {
    cardStyle[':hover'] = {
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transform: 'translateY(-2px)'
    };
  }

  return (
    <Card 
      style={cardStyle}
      onClick={onClick}
      loading={loading}
    >
      <Statistic
        title={title}
        value={value}
        suffix={suffix}
        prefix={prefix}
        valueStyle={{ color }}
      />
      {icon && (
        <div style={{ 
          position: 'absolute', 
          right: 16, 
          top: 16,
          fontSize: 24,
          color: color,
          opacity: 0.3
        }}>
          {icon}
        </div>
      )}
    </Card>
  );
}

