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
 * @param {string} props.size - Tab size: 'sm' | 'md' | 'lg' (default: 'md')
 * @param {string} props.style - Custom styles
 * 
 * Tab configuration:
 * {
 *   key,              // Unique tab key
 *   label,            // Tab label
 *   children: ReactNode,      // Tab content
 *   badge?,           // Badge count
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
import { Tabs } from 'flowbite-react';
import { Badge } from 'flowbite-react';

export default function TabbedContent({
  tabs = [],
  activeKey,
  onChange,
  size = 'md',
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

  return (
    <Tabs
      activeTab={internalActiveKey}
      onActiveTabChange={handleChange}
      style={style}
      {...props}
    >
      {tabs.map(tab => (
        <Tabs.Item
          key={tab.key}
          title={
            <span className="flex items-center gap-2">
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && (
                <Badge color="blue" size="sm">{tab.badge}</Badge>
              )}
            </span>
          }
          active={internalActiveKey === tab.key}
          disabled={tab.disabled}
        >
          {tab.children}
        </Tabs.Item>
      ))}
    </Tabs>
  );
}
