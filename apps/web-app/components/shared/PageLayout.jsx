"use client";

import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space } from 'antd';

const { Title } = Typography;

/**
 * PageLayout Component
 * 
 * A reusable template for consistent page layouts across the application.
 * Provides:
 * - Flexbox layout that fills available height
 * - Compact header section
 * - Optional statistics cards
 * - Full-height content area
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.header - Header content (title, actions, etc.)
 * @param {Array} props.stats - Array of statistics to display: [{ title, value, prefix, valueStyle }]
 * @param {React.ReactNode} props.children - Main content (usually a table or list)
 * @param {string} props.headerTitle - Optional title text (if not using custom header)
 * @param {React.ReactNode} props.headerActions - Optional actions to show in header
 * @param {Object} props.style - Additional styles for main container
 * @param {number} props.statsCols - Number of columns for stats (default: 4, responsive: xs=12, sm=12, md=6)
 */
export default function PageLayout({
  header,
  stats,
  children,
  headerTitle,
  headerActions,
  style = {},
  statsCols = 4,
}) {
  // Determine column spans based on number of stats
  const getColSpan = () => {
    if (statsCols === 2) return { xs: 12, sm: 12, md: 12 };
    if (statsCols === 3) return { xs: 12, sm: 12, md: 8 };
    if (statsCols === 4) return { xs: 12, sm: 12, md: 6 };
    if (statsCols === 6) return { xs: 12, sm: 12, md: 4 };
    return { xs: 12, sm: 12, md: 6 }; // default
  };

  const colSpan = getColSpan();

  return (
    <div 
      style={{ 
        padding: '12px 16px', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        ...style 
      }}
    >
      {/* Header Section */}
      {header || (
        <Card 
          size="small" 
          style={{ marginBottom: 12 }}
          bodyStyle={{ padding: '8px 12px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            {headerTitle && (
              <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '18px' }}>
                {headerTitle}
              </Title>
            )}
            {headerActions && (
              <Space>
                {headerActions}
              </Space>
            )}
          </div>
        </Card>
      )}

      {/* Statistics Cards (Optional) */}
      {stats && stats.length > 0 && (
        <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
          {stats.map((stat, index) => (
            <Col key={index} {...colSpan}>
              <Card size="small" bodyStyle={{ padding: '12px' }}>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  valueStyle={{ 
                    fontSize: '20px', 
                    fontWeight: 600,
                    ...stat.valueStyle 
                  }}
                  prefix={stat.prefix && React.cloneElement(stat.prefix, { style: { fontSize: '16px' } })}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Main Content Area - Full Height */}
      <Card 
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
      >
        {children}
      </Card>
    </div>
  );
}

/**
 * EmptyState Component
 * 
 * A consistent empty state wrapper for use within PageLayout
 */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center' }}>
        {icon && <div style={{ marginBottom: 16, fontSize: 64, color: '#bfbfbf' }}>{icon}</div>}
        {title && <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 600, color: '#595959' }}>{title}</div>}
        {description && <div style={{ marginBottom: 16, color: '#8c8c8c' }}>{description}</div>}
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

/**
 * TableWrapper Component
 * 
 * Wraps a table with proper overflow handling for use within PageLayout
 */
export function TableWrapper({ children }) {
  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      {children}
    </div>
  );
}

