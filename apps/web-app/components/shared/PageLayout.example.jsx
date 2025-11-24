/**
 * PageLayout Usage Examples
 * 
 * This file demonstrates how to use the PageLayout component
 * for consistent page layouts across the application.
 */

import React from 'react';
import { Button, Table, Empty, Input } from 'antd';
import { PlusOutlined, ReloadOutlined, HomeOutlined, TeamOutlined } from '@ant-design/icons';
import PageLayout, { EmptyState, TableWrapper } from './PageLayout';

// ============================================
// Example 1: Simple page with header and table
// ============================================
export function SimplePageExample({ data, loading }) {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
  ];

  return (
    <PageLayout
      headerTitle={<><HomeOutlined /> Properties</>}
      headerActions={
        <Button key="refresh" icon={<ReloadOutlined />} size="small">Refresh</Button>,
        <Button key="add" type="primary" icon={<PlusOutlined />} size="small">Add Property</Button>,
      }
    >
      {data.length === 0 ? (
        <EmptyState
          icon={<HomeOutlined />}
          title="No properties yet"
          description="Click 'Add Property' to add your first property"
        />
      ) : (
        <TableWrapper>
          <Table
            dataSource={data}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20, showSizeChanger: true }}
            size="middle"
          />
        </TableWrapper>
      )}
    </PageLayout>
  );
}

// ============================================
// Example 2: Page with statistics cards
// ============================================
export function PageWithStatsExample({ properties, units, leases, landlords }) {
  const stats = [
    {
      title: 'Properties',
      value: properties.length,
      prefix: <HomeOutlined />,
      valueStyle: { color: '#1890ff' },
    },
    {
      title: 'Total Units',
      value: units.length,
      prefix: <HomeOutlined />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Active Leases',
      value: leases.length,
      prefix: <TeamOutlined />,
      valueStyle: { color: '#722ed1' },
    },
    {
      title: 'Landlords',
      value: landlords.length,
      prefix: <TeamOutlined />,
      valueStyle: { color: '#faad14' },
    },
  ];

  return (
    <PageLayout
      headerTitle={<><HomeOutlined /> Managed Properties</>}
      stats={stats}
      statsCols={4}
    >
      <TableWrapper>
        <Table
          dataSource={properties}
          columns={[}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          size="middle"
        />
      </TableWrapper>
    </PageLayout>
  );
}

// ============================================
// Example 3: Custom header
// ============================================
export function CustomHeaderExample() {
  const customHeader = (
    <Card 
      size="small" 
      style={{ marginBottom: 12 }}
      bodyStyle={{ padding: '8px 12px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Custom Header</Title>
          <div style={{ fontSize: '12px', color: '#999' }}>With subtitle</div>
        </div>
        <Input.Search placeholder="Search..." style={{ width: 300 }} size="small" />
      </div>
    </Card>
  );

  return (
    <PageLayout header={customHeader}>
      <TableWrapper>
        <Table dataSource={[} columns={[} />
      </TableWrapper>
    </PageLayout>
  );
}

// ============================================
// Example 4: Tabs-based page (for unified pages)
// ============================================
export function TabsPageExample() {
  return (
    <div style={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        items={
          {
            key: 'tab1',
            label: 'Tab 1',
            children: (
              <div style={{ flex: 1, overflow: 'auto', paddingTop: 12 }}>
                <PageLayout
                  headerTitle="Tab Content"
                  stats={[}
                >
                  <TableWrapper>
                    <Table dataSource={[} columns={[} />
                  </TableWrapper>
                </PageLayout>
              </div>
            ),
          },
        }
      />
    </div>
  );
}

