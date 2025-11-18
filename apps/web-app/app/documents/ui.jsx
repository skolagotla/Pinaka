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
  // Check URL for tab parameter (for redirects)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get('tab');
      if (tabFromUrl === 'forms' && (userRole === 'landlord' || userRole === 'pmc')) {
        return 'forms';
      }
    }
    return 'library';
  });
  const storageKey = `${userRole}-documents-active-tab`;
  
  // Load tab from localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl === 'forms' && (userRole === 'landlord' || userRole === 'pmc')) {
      setActiveTab('forms');
      localStorage.setItem(storageKey, 'forms');
    } else {
      const savedTab = localStorage.getItem(storageKey);
      if (savedTab) {
        setActiveTab(savedTab);
      }
    }
  }, [storageKey, userRole]);

  const handleTabChange = (key) => {
    trackTabSwitch('documents', activeTab, key, userRole);
    setActiveTab(key);
    localStorage.setItem(storageKey, key);
  };

  // Track page view on mount
  useEffect(() => {
    trackPageView('documents', activeTab, userRole);
  }, [activeTab, userRole]);

  // Determine which tabs to show based on role
  const availableTabs = useMemo(() => {
    const tabs = [];
    
    // Library tab - available for all roles
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
    
    // Forms tab - only for landlord and PMC
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
  }, [userRole, user, libraryData]);

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

