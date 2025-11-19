"use client";

import { useState, useMemo, useEffect } from 'react';
import { Tabs } from 'antd';
import { trackPageView, trackTabSwitch } from '@/lib/utils/analytics';
import {
  BookOutlined,
  FormOutlined,
} from '@ant-design/icons';
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const LibraryClient = dynamic(
  () => import('@/components/shared/LibraryClient'),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading documents...</div>,
    ssr: false,
  }
);

const GeneratedFormsClient = dynamic(
  () => import('@/components/pages/landlord/forms/ui').then(mod => mod.default),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading forms...</div>,
    ssr: false,
  }
);

const { TabPane } = Tabs;

/**
 * Unified Documents Client Component
 * Consolidates Library (documents) and Forms (generated legal forms) into a single page
 */
export default function DocumentsClient({ user, userRole, libraryData }) {
  const [mounted, setMounted] = useState(false);
  
  // Check URL for tab parameter (for redirects)
  const [activeTab, setActiveTab] = useState('library');
  const storageKey = `${userRole}-documents-active-tab`;
  
  // Set mounted flag and load tab from localStorage/URL
  useEffect(() => {
    setMounted(true);
    
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    
    try {
      if (tabFromUrl === 'forms' && (userRole === 'landlord' || userRole === 'pmc')) {
        setActiveTab('forms');
        localStorage.setItem(storageKey, 'forms');
      } else {
        const savedTab = localStorage.getItem(storageKey);
        if (savedTab && ['library', 'forms'].includes(savedTab)) {
          // Validate saved tab is available for this role
          if (
            (savedTab === 'forms' && (userRole === 'landlord' || userRole === 'pmc')) ||
            savedTab === 'library'
          ) {
            setActiveTab(savedTab);
          }
        }
      }
    } catch (err) {
      // localStorage may be disabled or unavailable (e.g., private browsing)
      console.warn('[DocumentsClient] localStorage access failed:', err);
    }
  }, [storageKey, userRole]);

  const handleTabChange = (key) => {
    trackTabSwitch('documents', activeTab, key, userRole);
    setActiveTab(key);
    try {
      localStorage.setItem(storageKey, key);
    } catch (err) {
      // localStorage may be disabled or unavailable (e.g., private browsing)
      console.warn('[DocumentsClient] localStorage access failed:', err);
    }
  };

  // Track page view on mount
  useEffect(() => {
    if (mounted) {
      trackPageView('documents', activeTab, userRole);
    }
  }, [activeTab, userRole, mounted]);

  // Determine which tabs to show based on role - memoized with stable order
  const availableTabs = useMemo(() => {
    if (!mounted) {
      // Return minimal tabs during SSR to prevent hydration mismatch
      return [{
        key: 'library',
        label: (
          <span>
            <BookOutlined /> Documents
          </span>
        ),
        component: null,
      }];
    }
    
    const tabs = [];
    
    // Library tab - available for all roles (always first)
    tabs.push({
      key: 'library',
      label: (
        <span>
          <BookOutlined /> Documents
        </span>
      ),
      component: (
        <LibraryClient
          userRole={userRole}
          user={user}
          tenants={libraryData?.tenants || []}
          initialDocuments={libraryData?.initialDocuments || []}
          leaseDocuments={libraryData?.leaseDocuments || []}
        />
      ),
    });
    
    
    // Forms tab - only for landlord and PMC - last position
    if (userRole === 'landlord' || userRole === 'pmc') {
      tabs.push({
        key: 'forms',
        label: (
          <span>
            <FormOutlined /> Generated Forms
          </span>
        ),
        component: <GeneratedFormsClient userRole={userRole} user={user} />,
      });
    }
    
    return tabs;
  }, [userRole, user, libraryData, mounted]);

  // Don't render tabs until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div style={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

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

