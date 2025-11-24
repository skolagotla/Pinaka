"use client";

import { useState, useEffect, useMemo } from 'react';
import { Tabs } from 'flowbite-react';
import { HiDocumentText, HiCurrencyDollar, HiUser } from 'react-icons/hi';
import LTBDocumentsGrid from '@/components/shared/LTBDocumentsGrid';
import LibraryClient from '@/components/shared/LibraryClient';
import dynamic from 'next/dynamic';

// Dynamically import LibraryClient to avoid SSR issues
const DynamicLibraryClient = dynamic(
  () => import('@/components/shared/LibraryClient').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>,
  }
);

/**
 * Unified Library Component
 * 
 * Shows Personal + Legal tabs for Landlord/Tenant
 * Shows Business + Legal tabs for Admin/PMC/PM
 * 
 * @param {Object} props
 * @param {string} props.userRole - User role: 'admin', 'pmc', 'pm', 'landlord', 'tenant'
 * @param {Object} props.user - User object (admin, pmc, landlord, or tenant)
 * @param {Array} props.tenants - Array of tenants (for landlord/pmc, optional)
 * @param {Array} props.initialDocuments - Initial documents (for tenant, optional)
 * @param {Array} props.leaseDocuments - Lease documents (for tenant, optional)
 */
export default function UnifiedLibraryComponent({
  userRole: propUserRole,
  user: propUser,
  tenants = [],
  initialDocuments = [],
  leaseDocuments = [],
}) {
  const [userRole, setUserRole] = useState(propUserRole || 'admin');
  const [user, setUser] = useState(propUser);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // Default to first tab

  // Determine if user is landlord/tenant (Personal tab) or business role (Business tab)
  const isPersonalRole = useMemo(() => {
    return userRole === 'landlord' || userRole === 'tenant';
  }, [userRole]);

  // Load user role if not provided
  useEffect(() => {
    const loadUser = async () => {
      // If userRole is provided, use it
      if (propUserRole) {
        setUserRole(propUserRole);
        setMounted(true);
        return;
      }
      
      // If user and role are both provided, use them
      if (propUser && propUserRole) {
        setUser(propUser);
        setUserRole(propUserRole);
        setMounted(true);
        return;
      }

      // Otherwise, try to load from API (works for all roles: admin, pmc, landlord, tenant)
      try {
        // Use FastAPI v2 auth
        const { v2Api } = await import('@/lib/api/v2-client');
        const { adminApi } = await import('@/lib/api/admin-api');
        
        // Try v2 API first
        const token = v2Api.getToken();
        if (token) {
          try {
            const currentUser = await v2Api.getCurrentUser();
            if (currentUser && currentUser.user) {
              const roles = currentUser.roles || [];
              const primaryRole = roles[0]?.name || 'admin';
              
              setUser({
                ...currentUser.user,
                roles: currentUser.roles,
              });
              setUserRole(primaryRole);
              setMounted(true);
              return;
            }
          } catch (v2Error) {
            // Token invalid, try admin API
          }
        }
        
        // Fallback: Try admin API (for admin users only)
        try {
          const data = await adminApi.getCurrentUser();
          
          if (data && data.user) {
            setUser(data.user);
            const baseRole = data.user.role || 'admin';
            setUserRole(baseRole);
          }
        } catch (adminApiError) {
          console.warn('[UnifiedLibraryComponent] Admin API not available (expected for non-admin users):', adminApiError);
          // If admin API fails but we're on admin page, assume admin
          if (!propUserRole) {
            setUserRole('admin');
          }
        }
      } catch (error) {
        console.error('[UnifiedLibraryComponent] Error loading user:', error);
        // On error, if no role was provided, assume admin (for admin pages)
        if (!propUserRole) {
          setUserRole('admin');
        }
      } finally {
        setMounted(true);
      }
    };
    
    loadUser();
  }, [propUser, propUserRole]);

  // Set default active tab based on role
  useEffect(() => {
    if (mounted) {
      if (isPersonalRole) {
        setActiveTab('personal');
      } else {
        setActiveTab('business');
      }
    }
  }, [mounted, isPersonalRole]);

  return (
    <div className="h-full flex flex-col p-0">
      {mounted ? (
        <Tabs aria-label="Library tabs" style="underline" className="flex-1 flex flex-col h-full">
          {isPersonalRole ? (
            <>
              <Tabs.Item active={activeTab === 'personal'} title="Personal" icon={HiUser} onClick={() => setActiveTab('personal')}>
                <div className="h-full overflow-auto">
                  <DynamicLibraryClient
                    userRole={userRole}
                    user={user}
                    tenants={tenants}
                    initialDocuments={initialDocuments}
                    leaseDocuments={leaseDocuments}
                  />
                </div>
              </Tabs.Item>
              <Tabs.Item active={activeTab === 'legal'} title="Legal" icon={HiDocumentText} onClick={() => setActiveTab('legal')}>
                <div className="h-full overflow-auto">
                  <LTBDocumentsGrid 
                    userRole={userRole} 
                    showFilters={true} 
                    showTitle={false}
                  />
                </div>
              </Tabs.Item>
            </>
          ) : (
            <>
              <Tabs.Item active={activeTab === 'business'} title="Business" icon={HiCurrencyDollar} onClick={() => setActiveTab('business')}>
                <div className="h-full overflow-auto">
                  <DynamicLibraryClient
                    userRole={userRole}
                    user={user}
                    tenants={tenants}
                    initialDocuments={initialDocuments}
                    leaseDocuments={leaseDocuments}
                  />
                </div>
              </Tabs.Item>
              <Tabs.Item active={activeTab === 'legal'} title="Legal" icon={HiDocumentText} onClick={() => setActiveTab('legal')}>
                <div className="h-full overflow-auto">
                  <LTBDocumentsGrid 
                    userRole={userRole} 
                    showFilters={true} 
                    showTitle={false}
                  />
                </div>
              </Tabs.Item>
            </>
          )}
        </Tabs>
      ) : (
        <div className="p-5 text-center">Loading...</div>
      )}
    </div>
  );
}
