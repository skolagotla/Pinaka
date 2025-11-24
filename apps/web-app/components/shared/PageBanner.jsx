/**
 * PageBanner Component
 * 
 * Reusable 3-section banner component used across all landlord and tenant pages
 * 
 * Layout:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  [Title]        [Stats: Key-Value Pairs]      [🔍 ↻ ➕ ▼]       │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * - Left: Title
 * - Middle: Stats (key-value pairs)
 * - Right: Actions (Search, Refresh, Add, Dropdown) - consistent order
 * 
 * Usage:
 * <PageBanner
 *   title="Vault"
 *   stats={
 *     { label: 'Tenants', value: 3, color: '#1890ff' },
 *     { label: 'Documents', value: 9, color: '#52c41a' }
 *   }
 *   actions={
 *     { icon: <PlusOutlined />, tooltip: 'Add', onClick: handleAdd, type: 'primary' }
 *   }
 *   dropdown={<Select ... />}
 *   showStats={true}
 *   searchValue={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   onSearchClear={clearSearch}
 * />
 */

import React, { memo } from 'react';
import { Card, Typography, Space, Button, Tooltip } from 'antd';
import SearchBar from './SearchBar';
import { IconButton, ActionButton } from './buttons';

const { Title, Text } = Typography;

function PageBanner({ 
  title, 
  subtitle = null,
  stats = [], 
  actions = [], 
  dropdown = null,
  showStats = true,
  style = {},
  searchValue = '',
  onSearchChange = null,
  onSearchClear = null,
  searchPlaceholder = "Search..."
}) {
  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 8,
        background: '#ffffff',
        border: '1px solid #e8e8e8',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        ...style
      }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'auto auto 1fr auto auto',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* SECTION 1: Title (Left) */}
        <div>
          <Title level={2} style={{ margin: 0, color: '#1f1f1f' }}>{title}</Title>
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
        
        {/* SECTION 2: Stats (Middle) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 24,
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {showStats && stats.length > 0 && stats.map((stat, index) => (
            <Text key={index} style={{ fontSize: 16, color: '#595959', whiteSpace: 'nowrap' }}>
              {stat.label}: <Text strong style={{ fontSize: 18, color: stat.color }}>{stat.value}</Text>
            </Text>
          ))}
        </div>
        
        {/* DIVIDER 2 */}
        <div style={{ 
          width: '1px', 
          height: '40px', 
          background: '#e8e8e8',
          alignSelf: 'center'
        }} />
        
        {/* SECTION 3: Actions (Right) - Consistent Order: Search, Dropdown, Refresh, Add */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 'fit-content' }}>
          {/* Search First - Uses SearchBar component */}
          {onSearchChange && (
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              onClear={onSearchClear}
              placeholder={searchPlaceholder}
              width={350}
            />
          )}
          
          {/* Dropdown Second */}
          {dropdown}
          
          {/* Other Action Buttons (Refresh, Add, etc.) */}
          <Space size={8}>
            {actions.map((action, index) => {
              // If action has a standard action type, use ActionButton
              if (action.action && ['add', 'edit', 'delete', 'save', 'cancel'].includes(action.action)) {
                return (
                  <ActionButton
                    key={index}
                    action={action.action}
                    onClick={action.onClick}
                    tooltip={action.tooltip}
                    loading={action.loading}
                    disabled={action.disabled}
                  />
                );
              }
              
              // If action has a label, use regular Button with icon and text
              if (action.label) {
                const button = (
                  <Button
                    key={index}
                    icon={action.icon}
                    onClick={action.onClick}
                    type={action.type || 'default'}
                    loading={action.loading}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </Button>
                );
                return action.tooltip ? (
                  <Tooltip key={index} title={action.tooltip}button}</Tooltip>
                ) : button;
              }
              
              // Otherwise use IconButton for icon-only actions
              return (
                <IconButton
                  key={index}
                  icon={action.icon}
                  onClick={action.onClick}
                  tooltip={action.tooltip}
                  type={action.type || 'default'}
                  loading={action.loading}
                  disabled={action.disabled}
                />
              );
            })}
          </Space>
        </div>
      </div>
    </Card>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(PageBanner);
