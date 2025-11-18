/**
 * Dashboard Widgets Hook
 * Manages widget visibility, order, and customization
 */

import { useState, useEffect } from 'react';

const WIDGET_STORAGE_KEY = 'dashboard-widgets';

const DEFAULT_WIDGETS = [
  { id: 'quick-stats', visible: true, order: 0 },
  { id: 'activity-log', visible: true, order: 1 },
  { id: 'recent-payments', visible: true, order: 2 },
  { id: 'pending-maintenance', visible: true, order: 3 },
  { id: 'upcoming-leases', visible: true, order: 4 },
];

export function useDashboardWidgets(userRole = 'landlord') {
  const storageKey = `${WIDGET_STORAGE_KEY}-${userRole}`;

  const [widgets, setWidgets] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved widgets:', e);
        }
      }
    }
    return DEFAULT_WIDGETS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(widgets));
    }
  }, [widgets, storageKey]);

  const toggleWidget = (widgetId) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w))
    );
  };

  const reorderWidgets = (newOrder) => {
    setWidgets((prev) => {
      const widgetMap = new Map(prev.map((w) => [w.id, w]));
      return newOrder.map((id, index) => ({
        ...widgetMap.get(id),
        order: index,
      }));
    });
  };

  const resetWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  const getVisibleWidgets = () => {
    return widgets.filter((w) => w.visible).sort((a, b) => a.order - b.order);
  };

  return {
    widgets,
    visibleWidgets: getVisibleWidgets(),
    toggleWidget,
    reorderWidgets,
    resetWidgets,
  };
}

export default useDashboardWidgets;

