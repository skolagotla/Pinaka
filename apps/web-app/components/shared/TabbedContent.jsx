"use client";

/**
 * TabbedContent Component
 * 
 * Standardized tabbed content component with consistent patterns.
 * 
 * Features:
 * - Tab badges for counts
 * - Lazy loading support
 * - Consistent styling
 * - Active tab persistence
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Tab configurations
 * @param {string} props.activeKey - Active tab key
 * @param {function} props.onChange - Tab change handler: (key) => void
 * @param {string} props.size - Tab size: 'small' | 'default' | 'large' (default: 'default')
 * @param {string} props.type - Tab type: 'line' | 'card' | 'editable-card' (default: 'line')
 * @param {boolean} props.lazy - Lazy load tab content (default: false)
 * @param {boolean} props.destroyInactiveTabPane - Destroy inactive tabs (default: false)
 * @param {object} props.style - Custom styles
 * 
 * Tab configuration:
 * {
 *   key: string,              // Unique tab key
 *   label: string,            // Tab label
 *   children: ReactNode,      // Tab content
 *   badge?: number,           // Badge count
 *   disabled?: boolean,       // Disable tab
 *   icon?: ReactNode,         // Tab icon
 * }
 * 
 * @example
 * <TabbedContent
 *   tabs={[
 *     { key: 'all', label: 'All', children: <Table />, badge: 25 },
 *     { key: 'pending', label: 'Pending', children: <Table />, badge: 5 }
 *   ]}
 *   activeKey={activeTab}
 *   onChange={setActiveTab}
 * />
 */

import React, { useState, useEffect } from 'react';
import { Tabs, Badge } from 'antd';

export default function TabbedContent({
  tabs = [],
  activeKey,
  onChange,
  size = 'default',
  type = 'line',
  lazy = false,
  destroyInactiveTabPane = false,
  style,
  ...props
}) {
  const [internalActiveKey, setInternalActiveKey] = useState(activeKey || tabs[0]?.key);

  useEffect(() => {
    if (activeKey !== undefined) {
      setInternalActiveKey(activeKey);
    }
  }, [activeKey]);

  const handleChange = (key) => {
    setInternalActiveKey(key);
    onChange?.(key);
  };

  const tabItems = tabs.map(tab => ({
    key: tab.key,
    label: (
      <span>
        {tab.icon && <span style={{ marginRight: 4 }}>{tab.icon}</span>}
        {tab.label}
        {tab.badge !== undefined && (
          <Badge count={tab.badge} style={{ marginLeft: 8 }} />
        )}
      </span>
    ),
    children: tab.children,
    disabled: tab.disabled,
    forceRender: !lazy, // Force render if not lazy
  }));

  return (
    <Tabs
      activeKey={internalActiveKey}
      onChange={handleChange}
      items={tabItems}
      size={size}
      type={type}
      destroyInactiveTabPane={destroyInactiveTabPane}
      style={style}
      {...props}
    />
  );
}

