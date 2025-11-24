"use client";

import { useState, useEffect, useMemo } from 'react';
import { Tabs, Empty } from 'antd';
import { FormOutlined, BankOutlined, UserOutlined } from '@ant-design/icons';
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

  // Tab items based on role
  const tabItems = useMemo(() => {
    if (isPersonalRole) {
      // Landlord/Tenant: Personal + Legal tabs
      return [
        {
          key: 'personal',
          label: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
              <UserOutlined style={{ fontSize: '15px' }} />
              <span>Personal</span>
            </span>
          ),
          children: (
            <DynamicLibraryClient
              userRole={userRole}
              user={user}
              tenants={tenants}
              initialDocuments={initialDocuments}
              leaseDocuments={leaseDocuments}
            />
          ),
        },
        {
          key: 'legal',
          label: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
              <FormOutlined style={{ fontSize: '15px' }} />
              <span>Legal</span>
            </span>
          ),
          children: (
            <LTBDocumentsGrid 
              userRole={userRole} 
              showFilters={true} 
              showTitle={false}
            />
          ),
        },
      ];
    } else {
      // Admin/PMC/PM: Business + Legal tabs
      return [
        {
          key: 'business',
          label: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
              <BankOutlined style={{ fontSize: '15px' }} />
              <span>Business</span>
            </span>
          ),
          children: (
            <DynamicLibraryClient
              userRole={userRole}
              user={user}
              tenants={tenants}
              initialDocuments={initialDocuments}
              leaseDocuments={leaseDocuments}
            />
          ),
        },
        {
          key: 'legal',
          label: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
              <FormOutlined style={{ fontSize: '15px' }} />
              <span>Legal</span>
            </span>
          ),
          children: (
            <LTBDocumentsGrid 
              userRole={userRole} 
              showFilters={true} 
              showTitle={false}
            />
          ),
        },
      ];
    }
  }, [isPersonalRole, userRole, user, tenants, initialDocuments, leaseDocuments]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0' }}>
      {mounted ? (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }}
          tabBarStyle={{ 
            margin: '0 24px',
            paddingTop: '24px',
            paddingBottom: '0',
            marginBottom: 0, 
            flexShrink: 0,
            borderBottom: '1px solid #e8e8e8',
            backgroundColor: '#ffffff',
          }}
          tabBarGutter={48}
          className="unified-library-tabs"
        />
      ) : (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      )}
      <style jsx global>{`
        .unified-library-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
          padding: 0 !important;
        }
        
        .unified-library-tabs .ant-tabs-nav-list {
          gap: 0 !important;
        }
        
        .unified-library-tabs .ant-tabs-tab {
          padding: 16px 0 !important;
          margin: 0 24px 0 0 !important;
          font-size: 15px !important;
          color: #8c8c8c !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border-bottom: 2px solid transparent !important;
          position: relative !important;
        }
        
        .unified-library-tabs .ant-tabs-tab:first-child {
          margin-left: 0 !important;
        }
        
        .unified-library-tabs .ant-tabs-tab:hover {
          color: #1890ff !important;
        }
        
        .unified-library-tabs .ant-tabs-tab-active {
          color: #1890ff !important;
        }
        
        .unified-library-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #1890ff !important;
          font-weight: 600 !important;
        }
        
        .unified-library-tabs .ant-tabs-ink-bar {
          height: 2px !important;
          background: #1890ff !important;
          border-radius: 1px 1px 0 0 !important;
        }
        
        .unified-library-tabs .ant-tabs-content-holder {
          flex: 1;
          overflow: hidden;
        }
        
        .unified-library-tabs .ant-tabs-content {
          height: 100%;
        }
        
        .unified-library-tabs .ant-tabs-tabpane {
          height: 100%;
          overflow: auto;
        }
        
        .unified-library-tabs .ant-tabs-tab-btn {
          display: inline-flex !important;
          align-items: center !important;
          gap: 10px !important;
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
}
