"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { Button, Tooltip } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  SettingOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  SafetyOutlined,
  DownloadOutlined,
  BellOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  MailOutlined,
  SearchOutlined,
  LockOutlined,
} from '@ant-design/icons';
import GlobalSearch from '@/components/GlobalSearch';
import UserMenu from '@/components/UserMenu';
import ErrorBoundary from '@/components/ErrorBoundary';
import TestDatabaseBanner from '@/components/TestDatabaseBanner';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // ALL HOOKS MUST BE CALLED FIRST
  const [admin, setAdmin] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Wait for client-side mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load collapsed state from localStorage after mount (client-side only)
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved === 'true') {
        setCollapsed(true);
      }
    }
  }, [isMounted]);

  // Save collapsed state to localStorage whenever it changes (only after mount)
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(collapsed));
    }
  }, [collapsed, isMounted]);

  // Global search keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Don't fetch admin on login page
    if (pathname !== '/admin/login') {
      fetchAdmin();
    }
  }, [pathname]);

  const fetchAdmin = async () => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getCurrentUser();

      if (data.success) {
        setAdmin(data.user);
      } else {
        // Not authenticated - silently redirect to login (this is expected behavior)
        // Only redirect if we're not already on login page
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      }
    } catch (err) {
      // Only log unexpected errors (not authentication errors)
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (!errorMessage.includes('Not authenticated') && !errorMessage.includes('401')) {
        console.error('[Admin Layout] Error fetching admin:', err);
      }
      // Only redirect if we're not already on login page
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    }
  };

  const handleLogout = async () => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      await adminApi.logout();
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Admin menu items for ProLayout
  const adminMenuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> },
    { path: '/admin/users', name: 'Users', icon: <UserOutlined /> },
    { path: '/admin/rbac', name: 'RBAC Settings', icon: <LockOutlined /> },
    { path: '/admin/verifications', name: 'Verifications', icon: <SafetyCertificateOutlined /> },
    { path: '/admin/system', name: 'System Monitoring', icon: <DatabaseOutlined /> },
    { path: '/admin/audit-logs', name: 'Audit Logs', icon: <FileTextOutlined /> },
    { path: '/admin/library', name: 'Library', icon: <FileTextOutlined /> },
    { path: '/admin/settings', name: 'Platform Settings', icon: <SettingOutlined /> },
    { path: '/admin/analytics', name: 'Analytics', icon: <BarChartOutlined /> },
    { path: '/admin/support-tickets', name: 'Support Tickets', icon: <CustomerServiceOutlined /> },
    { path: '/admin/security', name: 'Security Center', icon: <SafetyOutlined /> },
    { path: '/admin/data-export', name: 'Data Export', icon: <DownloadOutlined /> },
    { path: '/admin/notifications', name: 'Notifications', icon: <BellOutlined /> },
    { path: '/admin/user-activity', name: 'User Activity', icon: <UserOutlined /> },
    { path: '/admin/content', name: 'Content Management', icon: <FileTextOutlined /> },
    { path: '/admin/api-keys', name: 'API Keys', icon: <KeyOutlined /> },
    { path: '/admin/database', name: 'Database', icon: <DatabaseOutlined /> },
  ];

  // Convert menu items to ProLayout format
  const menuDataRender = async () => {
    return adminMenuItems.map(item => ({
      path: item.path,
      name: item.name,
      icon: item.icon,
    }));
  };

  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // On server or before mount, return simple layout to avoid hydration mismatch
  if (!isMounted) {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    );
  }

  // Determine keyboard shortcut text (client-side only, after mount)
  const keyboardShortcut = isMounted && typeof window !== 'undefined' && 
    navigator?.platform?.toUpperCase().indexOf('MAC') >= 0 ? '⌘K' : 'Ctrl+K';

  return (
    <ErrorBoundary>
      <div suppressHydrationWarning>
        <ProLayout
          title="Pinaka"
          logo={
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'linear-gradient(45deg, #1890ff 30%, #52c41a 90%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '16px',
            }}>
              P
            </div>
          }
          menu={{
            request: menuDataRender,
          }}
          location={{
            pathname,
          }}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          menuItemRender={(item, dom) => (
            <a
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                if (item.path !== pathname) {
                  router.push(item.path);
                }
              }}
            >
              {dom}
            </a>
          )}
          headerContentRender={() => null}
          actionsRender={() => [
            <TestDatabaseBanner key="test-db-banner" />,
            <Tooltip 
              key="search-tooltip"
              title={
                <span>
                  Search {' '}
                  <kbd style={{ 
                    padding: '2px 4px', 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '3px',
                    fontSize: '11px',
                  }}>
                    {keyboardShortcut}
                  </kbd>
                </span>
              }
            >
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={() => setSearchOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 16px',
                  height: '40px',
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                  color: '#8c8c8c',
                  marginRight: '12px',
                  fontSize: '14px',
                  minWidth: '200px',
                }}
              >
                <span style={{ fontSize: '14px' }}>Search...</span>
              </Button>
            </Tooltip>,
            <UserMenu 
              key="user-menu"
              firstName={admin?.firstName || ''} 
              lastName={admin?.lastName || ''} 
              userRole="admin"
              collapsed={collapsed}
              onLogout={handleLogout}
              onSettings={() => router.push('/admin/settings')}
            />,
          ]}
          footerRender={() => null}
          fixSiderbar
          layout="mix"
          navTheme="light"
          contentStyle={{
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <PageContainer
            header={{
              title: false,
              breadcrumb: {},
            }}
          >
            {children}
          </PageContainer>
        </ProLayout>
        
        {/* Global Search Modal */}
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </ErrorBoundary>
  );
}
