"use client";

import { useState, useMemo, useEffect } from 'react';
import { Tabs } from 'antd';
import { trackPageView, trackTabSwitch } from '@/lib/utils/analytics';
import {
  WalletOutlined,
  DollarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const LandlordFinancialsClient = dynamic(
  () => import('@/components/pages/landlord/financials/ui').then(mod => mod.default),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading financials...</div>,
    ssr: false,
  }
);

const PMCFinancialsClient = dynamic(
  () => import('@/components/pages/pmc/financials/ui').then(mod => mod.default),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading financials...</div>,
    ssr: false,
  }
);

const RentPaymentsClient = dynamic(
  () => import('@/components/pages/landlord/rent-payments/ui').then(mod => mod.default),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading rent payments...</div>,
    ssr: false,
  }
);

const PMCRentPaymentsClient = dynamic(
  () => import('@/components/pages/pmc/rent-payments/ui').then(mod => mod.default),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading rent payments...</div>,
    ssr: false,
  }
);

const FinancialReports = dynamic(
  () => import('@/components/shared/FinancialReports').then(mod => mod.default),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading reports...</div>,
    ssr: false,
  }
);

/**
 * Unified Financials Client Component
 * Consolidates Financials, Financial Reports, and Rent Payments into a single page
 */
export default function FinancialsClient({ user, userRole, financialData, rentPaymentsData }) {
  // Check URL for tab parameter (for redirects)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get('tab');
      if (tabFromUrl && ['rent-payments', 'reports'].includes(tabFromUrl)) {
        return tabFromUrl;
      }
    }
    return 'overview';
  });
  const storageKey = `${userRole}-financials-active-tab`;
  
  // Load tab from localStorage or URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl && ['rent-payments', 'reports'].includes(tabFromUrl)) {
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
    trackTabSwitch('financials', activeTab, key, userRole);
    setActiveTab(key);
    localStorage.setItem(storageKey, key);
  };

  // Track page view on mount
  useEffect(() => {
    trackPageView('financials', activeTab, userRole);
  }, [activeTab, userRole]);

  // Determine which tabs to show based on role
  const availableTabs = useMemo(() => {
    const tabs = [];
    
    // Overview/Financials tab - available for all roles
    tabs.push({
      key: 'overview',
      label: (
        <span>
          <WalletOutlined /> Overview
        </span>
      ),
      component: userRole === 'pmc' ? (
        <PMCFinancialsClient pmc={user} financialData={financialData || { expenses: [], rentPayments: [], totalRent: 0, totalExpenses: 0, netIncome: 0 }} />
      ) : (
        <LandlordFinancialsClient />
      ),
    });
    
    // Rent Payments tab - available for landlord and PMC
    if (userRole === 'landlord' || userRole === 'pmc') {
      tabs.push({
        key: 'rent-payments',
        label: (
          <span>
            <DollarOutlined /> Rent Payments
          </span>
        ),
        component: userRole === 'pmc' ? (
          <PMCRentPaymentsClient 
            leases={rentPaymentsData?.leases || []}
            landlordCountry={rentPaymentsData?.landlordCountry || 'CA'}
          />
        ) : (
          <RentPaymentsClient 
            leases={rentPaymentsData?.leases || []}
            landlordCountry={rentPaymentsData?.landlordCountry || 'US'}
          />
        ),
      });
    }
    
    // Financial Reports tab - only for PMC
    if (userRole === 'pmc') {
      tabs.push({
        key: 'reports',
        label: (
          <span>
            <FileTextOutlined /> Reports
          </span>
        ),
        component: <FinancialReports />,
      });
    }
    
    return tabs;
  }, [userRole, user, financialData, rentPaymentsData]);

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

