"use client";

import { useState, useEffect } from 'react';
import { Tabs } from 'flowbite-react';
import { trackPageView, trackTabSwitch } from '@/lib/utils/analytics';
import {
  HiUserGroup,
  HiUsers,
} from 'react-icons/hi';
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

  return (
    <div className="p-3 h-full flex flex-col">
      <Tabs aria-label="Partners tabs" style="underline" className="flex-1 flex flex-col overflow-hidden">
        <Tabs.Item active={activeTab === 'vendors'} title="Vendors" icon={HiUserGroup} onClick={() => handleTabChange('vendors')}>
          <div className="flex-1 overflow-auto pt-3">
            {userRole === 'pmc' ? (
              <PMCVendorsClient vendorsData={vendorsData} />
            ) : (
              <VendorsClient vendorsData={vendorsData} />
            )}
          </div>
        </Tabs.Item>
        <Tabs.Item active={activeTab === 'contractors'} title="Contractors" icon={HiUsers} onClick={() => handleTabChange('contractors')}>
          <div className="flex-1 overflow-auto pt-3">
            <ContractorsClient userRole={userRole} contractorsData={contractorsData} />
          </div>
        </Tabs.Item>
      </Tabs>
    </div>
  );
}

