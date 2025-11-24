"use client";

import { useState, useEffect } from 'react';
import { Tabs } from 'flowbite-react';
import { Button } from 'flowbite-react';
import { useRouter } from 'next/navigation';
import { trackPageView, trackTabSwitch } from '@/lib/utils/analytics';
import {
  HiWrench,
  HiDocumentSearch,
  HiViewGrid,
} from 'react-icons/hi';
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
  const router = useRouter();
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
        <span className="flex items-center gap-2">
          <HiWrench className="h-4 w-4" /> Maintenance
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
        <span className="flex items-center gap-2">
          <HiDocumentSearch className="h-4 w-4" /> Inspections
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
    <div className="p-3 h-full flex flex-col">
      {/* Header with Kanban view button */}
      {activeTab === 'maintenance' && (
        <div className="mb-3 flex justify-end">
          <Button
            color="blue"
            size="sm"
            onClick={() => router.push('/operations/kanban')}
            className="flex items-center gap-2"
          >
            <HiViewGrid className="h-4 w-4" />
            Kanban View
          </Button>
        </div>
      )}
      
      <Tabs activeTab={activeTab} onActiveTabChange={handleTabChange} className="flex-1 flex flex-col overflow-hidden">
        {availableTabs.map(tab => (
          <Tabs.Item key={tab.key} title={tab.label}>
            <div className="flex-1 overflow-auto pt-3">
              {tab.component}
            </div>
          </Tabs.Item>
        ))}
      </Tabs>
    </div>
  );
}

