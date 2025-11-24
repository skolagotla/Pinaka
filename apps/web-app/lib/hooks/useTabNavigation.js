/**
 * useTabNavigation Hook
 * 
 * Centralized tab state management with helper functions
 * Reduces repetitive tab navigation code
 * 
 * Usage:
 * ```jsx
 * const { activeTab, setActiveTab, isActive, TabContent } = useTabNavigation({
 *   defaultTab: 'overview',
 *   tabs: ['overview', 'income', 'charts']
 * });
 * 
 * <Tabs activeKey={activeTab} onChange={setActiveTab}>
 *   <TabPane key="overview" tab="Overview">...</TabPane>
 * </Tabs>
 * ```
 */

import { useState, useCallback, useMemo } from 'react';

export function useTabNavigation({ 
  defaultTab = 'overview',
  tabs = [],
  onTabChange = null
} = {}) {
  const [activeTab, setActiveTabState] = useState(defaultTab);

  /**
   * Set active tab with optional callback
   */
  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  }, [onTabChange]);

  /**
   * Check if a tab is active
   */
  const isActive = useCallback((tab) => {
    return activeTab === tab;
  }, [activeTab]);

  /**
   * Get next tab
   */
  const nextTab = useCallback(() => {
    if (tabs.length === 0) return;
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    setActiveTab(tabs[nextIndex]);
  }, [activeTab, tabs, setActiveTab]);

  /**
   * Get previous tab
   */
  const prevTab = useCallback(() => {
    if (tabs.length === 0) return;
    const currentIndex = tabs.indexOf(activeTab);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    setActiveTab(tabs[prevIndex]);
  }, [activeTab, tabs, setActiveTab]);

  /**
   * Reset to default tab
   */
  const resetTab = useCallback(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, setActiveTab]);

  /**
   * Tab items for Ant Design Tabs component
   */
  const tabItems = useMemo(() => {
    return tabs.map(tab => ({
      key: tab,
      label: tab.charAt(0).toUpperCase() + tab.slice(1)
    }));
  }, [tabs]);

  return {
    activeTab,
    setActiveTab,
    isActive,
    nextTab,
    prevTab,
    resetTab,
    tabItems
  };
}

