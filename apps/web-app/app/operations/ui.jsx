"use client";

import { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import { trackPageView, trackTabSwitch } from '@/lib/utils/analytics';
import {
  ToolOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const MaintenanceClient = dynamic(
  () => import('@/components/shared/MaintenanceClient'),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading maintenance...</div>,
    ssr: false,
  }
);

const LandlordInspectionsClient = dynamic(
  () => import('@/components/pages/landlord/inspections/ui').then(mod => mod.default),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading inspections...</div>,
    ssr: false,
  }
);

const PMCInspectionsClient = dynamic(
  () => import('@/components/pages/pmc/inspections/ui').then(mod => mod.default),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading inspections...</div>,
    ssr: false,
  }
);

/**
 * Unified Operations Client Component
 * Consolidates Maintenance and Inspections into a single page
 */
export default function OperationsClient({ user, userRole, maintenanceData, inspectionsData }) {
  // Check URL for tab parameter (for redirects)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get('tab');
      if (tabFromUrl && ['maintenance', 'inspections'].includes(tabFromUrl)) {
        return tabFromUrl;
      }
    }
    return 'maintenance';
  });
  const storageKey = `${userRole}-operations-active-tab`;
  
  // Load tab from localStorage or URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl && ['maintenance', 'inspections'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
      localStorage.setItem(storageKey, tabFromUrl);
    } else {
      const savedTab = localStorage.getItem(storageKey);
      if (savedTab) {
        setActiveTab(savedTab);
      }
    }
  }, [storageKey]);

  const handleTabChange = (key) => {
    trackTabSwitch('operations', activeTab, key, userRole);
    setActiveTab(key);
    localStorage.setItem(storageKey, key);
  };

  // Track page view on mount
  useEffect(() => {
    trackPageView('operations', activeTab, userRole);
  }, [activeTab, userRole]);

  // Determine which tabs to show based on role
  const availableTabs = [
    {
      key: 'maintenance',
      label: (
        <span>
          <ToolOutlined /> Maintenance
        </span>
      ),
      component: (
        <MaintenanceClient
          userRole={userRole}
          user={user}
          initialRequests={maintenanceData?.requests || []}
          userEmail={user.email}
          userName={userRole === 'tenant' 
            ? `${user.firstName} ${user.lastName}`
            : userRole === 'pmc'
            ? user.companyName
            : `${user.firstName} ${user.lastName}`
          }
        />
      ),
    },
    {
      key: 'inspections',
      label: (
        <span>
          <FileSearchOutlined /> Inspections
        </span>
      ),
      component: userRole === 'pmc' ? (
        <PMCInspectionsClient initialChecklists={inspectionsData?.checklists || []} />
      ) : (
        <LandlordInspectionsClient initialChecklists={inspectionsData?.checklists || []} />
      ),
    },
  ];

  return (
    <div style={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        items={availableTabs.map(tab => ({
          key: tab.key,
          label: tab.label,
          children: (
            <div style={{ flex: 1, overflow: 'auto', paddingTop: 12 }}>
              {tab.component}
            </div>
          ),
        }))}
      />
    </div>
  );
}

