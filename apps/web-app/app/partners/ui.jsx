"use client";

import { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import { trackPageView, trackTabSwitch } from '@/lib/utils/analytics';
import {
  ContactsOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const VendorsClient = dynamic(
  () => import('@/components/pages/landlord/vendors/ui').then(mod => mod.default),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading vendors...</div>,
    ssr: false,
  }
);

const PMCVendorsClient = dynamic(
  () => import('@/components/pages/pmc/vendors/ui').then(mod => mod.default),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading vendors...</div>,
    ssr: false,
  }
);

const ContractorsClient = dynamic(
  () => import('./contractors-ui').then(mod => mod.default),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading contractors...</div>,
    ssr: false,
  }
);

/**
 * Unified Partners Client Component
 * Consolidates Vendors and Contractors into a single page
 * Note: Contractors functionality will be added in a future update
 */
export default function PartnersClient({ user, userRole, vendorsData, contractorsData }) {
  // Check URL for tab parameter (for redirects)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get('tab');
      if (tabFromUrl && ['vendors', 'contractors'].includes(tabFromUrl)) {
        return tabFromUrl;
      }
    }
    return 'vendors';
  });
  const storageKey = `${userRole}-partners-active-tab`;
  
  // Load tab from localStorage or URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl && ['vendors', 'contractors'].includes(tabFromUrl)) {
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
    trackTabSwitch('partners', activeTab, key, userRole);
    setActiveTab(key);
    localStorage.setItem(storageKey, key);
  };

  // Track page view on mount
  useEffect(() => {
    trackPageView('partners', activeTab, userRole);
  }, [activeTab, userRole]);

  // Determine which tabs to show based on role
  const availableTabs = [
    {
      key: 'vendors',
      label: (
        <span>
          <ContactsOutlined /> Vendors
        </span>
      ),
      component: userRole === 'pmc' ? (
        <PMCVendorsClient vendorsData={vendorsData} />
      ) : (
        <VendorsClient vendorsData={vendorsData} />
      ),
    },
    {
      key: 'contractors',
      label: (
        <span>
          <TeamOutlined /> Contractors
        </span>
      ),
      component: <ContractorsClient userRole={userRole} contractorsData={contractorsData} />,
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

