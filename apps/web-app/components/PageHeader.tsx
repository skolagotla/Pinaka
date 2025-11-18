"use client";
import React from 'react';
import { Typography, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import SearchBar from './shared/SearchBar';
import { ActionButton, IconButton } from './shared/buttons';

const { Title, Text } = Typography;

interface Stat {
  label: string;
  value: number | string;
  color?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  stats?: Stat[];
  onAdd?: () => void;
  addButtonText?: string;
  addTooltip?: string;
  onRefresh?: () => void;
  onSearch?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchClear?: () => void;
  searchPlaceholder?: string;
  extra?: React.ReactNode;
}

export default function PageHeader({ 
  title, 
  subtitle,
  stats,
  onAdd, 
  addButtonText = "Add",
  addTooltip,
  onRefresh,
  onSearch,
  searchValue = '',
  onSearchChange,
  onSearchClear,
  searchPlaceholder = "Search...",
  extra = null 
}: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 24, background: '#fff', padding: '20px 24px', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'auto 1px 1fr 1px auto',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* SECTION 1: Title */}
        <div style={{ minWidth: 200 }}>
          <Title level={2} style={{ margin: 0, fontSize: 24 }}>{title}</Title>
          {subtitle && (
            <Text type="secondary" style={{ fontSize: 14 }}>{subtitle}</Text>
          )}
        </div>

        {/* DIVIDER 1 */}
        <div style={{ 
          width: '1px', 
          height: '40px', 
          background: '#e8e8e8',
          alignSelf: 'center'
        }} />

        {/* SECTION 2: Stats */}
        {stats && stats.length > 0 ? (
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center' }}>
            {stats.map((stat, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{stat.label}</Text>
                <Text strong style={{ fontSize: 20, color: stat.color || '#1890ff' }}>{stat.value}</Text>
              </div>
            ))}
          </div>
        ) : (
          <div />
        )}

        {/* DIVIDER 2 */}
        <div style={{ 
          width: '1px', 
          height: '40px', 
          background: '#e8e8e8',
          alignSelf: 'center'
        }} />

        {/* SECTION 3: Actions */}
        <Space size={8}>
          {/* Search First */}
          {onSearchChange && (
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              onClear={onSearchClear || (() => {})}
              placeholder={searchPlaceholder}
              width={350}
              autoFocus={true}
            />
          )}

          {/* Refresh */}
          {onRefresh && (
            <IconButton
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              tooltip="Refresh"
              showText={false}
              text=""
            />
          )}

          {/* Add */}
          {onAdd && (
            <ActionButton
              action="add"
              onClick={onAdd}
              tooltip={addTooltip || addButtonText}
              text=""
              htmlType="button"
              buttonType="primary"
            />
          )}

          {/* Extra Actions */}
          {extra}
        </Space>
      </div>
    </div>
  );
}
