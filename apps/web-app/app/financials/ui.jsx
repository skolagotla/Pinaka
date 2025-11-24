"use client";

import { useState, useMemo, useEffect } from 'react';
import { Tabs } from 'flowbite-react';
import { trackPageView, trackTabSwitch } from '@/lib/utils/analytics';
import {
  HiWallet,
  HiCurrencyDollar,
  HiDocumentText,
} from 'react-icons/hi';
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

  return (
    <div className="p-3 h-full flex flex-col">
      <Tabs aria-label="Financials tabs" style="underline" className="flex-1 flex flex-col overflow-hidden">
        <Tabs.Item active={activeTab === 'overview'} title="Overview" icon={HiWallet} onClick={() => handleTabChange('overview')}>
          <div className="flex-1 overflow-auto pt-3">
            {userRole === 'pmc' ? (
              <PMCFinancialsClient pmc={user} financialData={financialData || { expenses: [], rentPayments: [], totalRent: 0, totalExpenses: 0, netIncome: 0 }} />
            ) : (
              <LandlordFinancialsClient />
            )}
          </div>
        </Tabs.Item>
        {(userRole === 'landlord' || userRole === 'pmc') && (
          <Tabs.Item active={activeTab === 'rent-payments'} title="Rent Payments" icon={HiCurrencyDollar} onClick={() => handleTabChange('rent-payments')}>
            <div className="flex-1 overflow-auto pt-3">
              {userRole === 'pmc' ? (
                <PMCRentPaymentsClient 
                  leases={rentPaymentsData?.leases || []}
                  landlordCountry={rentPaymentsData?.landlordCountry || 'CA'}
                />
              ) : (
                <RentPaymentsClient 
                  leases={rentPaymentsData?.leases || []}
                  landlordCountry={rentPaymentsData?.landlordCountry || 'US'}
                />
              )}
            </div>
          </Tabs.Item>
        )}
        {userRole === 'pmc' && (
          <Tabs.Item active={activeTab === 'reports'} title="Reports" icon={HiDocumentText} onClick={() => handleTabChange('reports')}>
            <div className="flex-1 overflow-auto pt-3">
              <FinancialReports />
            </div>
          </Tabs.Item>
        )}
      </Tabs>
    </div>
  );
}

