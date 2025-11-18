"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button, Tooltip, Spin } from 'antd';

// Lazy load ProLayout to reduce initial bundle size (~150KB savings)
// ProLayout is only needed when navigation is shown, so lazy loading is safe
const ProLayout = dynamic(
  () => import('@ant-design/pro-layout').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    )
  }
);

const PageContainer = dynamic(
  () => import('@ant-design/pro-layout').then(mod => mod.PageContainer),
  { ssr: false }
);
import { 
  SearchOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  DashboardOutlined,
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
  ToolOutlined,
  FormOutlined,
  WalletOutlined,
  CalendarOutlined,
  MessageOutlined,
  ContactsOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CalculatorOutlined,
  FileSearchOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  UserOutlined,
  DatabaseOutlined,
  SettingOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  SafetyOutlined,
  DownloadOutlined,
  BellOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import UserMenu from './UserMenu';
import GlobalSearch from './GlobalSearch';
import PropertySelector from './PropertySelector';
import ErrorBoundary from './ErrorBoundary';
import NotificationCenter from './shared/NotificationCenter';
import TestDatabaseBanner from './TestDatabaseBanner';

// Lazy load logger to avoid server-side execution
let logger;
if (typeof window !== 'undefined') {
  logger = require('@/lib/logger');
} else {
  logger = {
    navigation: () => {},
    error: () => {},
    info: () => {},
  };
}

export default function ProLayoutWrapper({ firstName, lastName, userRole, showNav, children }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load collapsed state from localStorage after mount
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === 'true') {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    logger.navigation('Page loaded', {
      path: pathname,
      userRole,
      hasUser: !!(firstName && lastName)
    });
  }, [pathname, userRole, firstName, lastName]);

  // Save collapsed state to localStorage
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(collapsed));
    }
  }, [collapsed, isMounted]);

  // Global search keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation menu items based on user role
  const landlordMenuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> },
    { path: '/properties', name: 'Properties', icon: <HomeOutlined /> },
    { path: '/tenants', name: 'Tenants', icon: <TeamOutlined /> },
    { path: '/leases', name: 'Leases', icon: <FileTextOutlined /> },
    { path: '/financials', name: 'Financials', icon: <WalletOutlined /> },
    { path: '/documents', name: 'Documents', icon: <BookOutlined /> },
    { path: '/operations', name: 'Operations', icon: <ToolOutlined /> },
    { path: '/calendar', name: 'Calendar', icon: <CalendarOutlined /> },
    { path: '/messages', name: 'Messages', icon: <MessageOutlined /> },
    { path: '/partners', name: 'Partners', icon: <ContactsOutlined /> },
    { path: '/verifications', name: 'Verifications', icon: <SafetyCertificateOutlined /> },
  ];

  const tenantMenuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> },
    { path: '/payments', name: 'Payments', icon: <DollarOutlined /> },
    { path: '/operations', name: 'Operations', icon: <ToolOutlined /> },
    { path: '/documents', name: 'Documents', icon: <BookOutlined /> },
    { path: '/messages', name: 'Messages', icon: <MessageOutlined /> },
    { path: '/checklist', name: 'Checklist', icon: <CheckCircleOutlined /> },
    { path: '/estimator', name: 'Estimator', icon: <CalculatorOutlined /> },
    { path: '/verifications', name: 'Verifications', icon: <SafetyCertificateOutlined /> },
  ];

  const pmcMenuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> },
    { path: '/properties', name: 'Properties', icon: <HomeOutlined /> },
    { path: '/landlords', name: 'Landlords', icon: <TeamOutlined /> },
    { path: '/tenants', name: 'Tenants', icon: <TeamOutlined /> },
    { path: '/leases', name: 'Leases', icon: <FileTextOutlined /> },
    { path: '/invitations', name: 'Invitations', icon: <MailOutlined /> },
    { path: '/financials', name: 'Financials', icon: <WalletOutlined /> },
    { path: '/documents', name: 'Documents', icon: <BookOutlined /> },
    { path: '/operations', name: 'Operations', icon: <ToolOutlined /> },
    { path: '/calendar', name: 'Calendar', icon: <CalendarOutlined /> },
    { path: '/messages', name: 'Messages', icon: <MessageOutlined /> },
    { path: '/partners', name: 'Partners', icon: <ContactsOutlined /> },
    { path: '/rbac', name: 'RBAC Settings', icon: <LockOutlined /> },
    { path: '/verifications', name: 'Verifications', icon: <SafetyCertificateOutlined /> },
  ];

  // Admin menu items - use admin routes (must match app/admin/layout.jsx)
  const adminMenuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> },
    { path: '/admin/users', name: 'Users', icon: <UserOutlined /> },
    { path: '/admin/rbac', name: 'RBAC Settings', icon: <LockOutlined /> },
    { path: '/verifications', name: 'Verifications', icon: <SafetyCertificateOutlined /> },
    { path: '/admin/system', name: 'System Monitoring', icon: <DatabaseOutlined /> },
    { path: '/admin/audit-logs', name: 'Audit Logs', icon: <FileTextOutlined /> },
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

  // Determine menu items based on role
  let menuItems;
  if (userRole === 'admin') {
    menuItems = adminMenuItems;
  } else if (userRole === 'tenant') {
    menuItems = tenantMenuItems;
  } else if (userRole === 'pmc') {
    menuItems = pmcMenuItems;
  } else {
    menuItems = landlordMenuItems;
  }

  // Convert menu items to ProLayout format
  // ProLayout expects async function, but we'll make it return a promise
  const menuDataRender = async () => {
    return menuItems.map(item => ({
      path: item.path,
      name: item.name,
      icon: item.icon,
    }));
  };

  if (!showNav) {
    // If no navigation needed, just render children
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  // Wait for client-side mount to avoid hydration mismatch
  if (!isMounted) {
    // Return simple layout during SSR
    return <ErrorBoundary>{children}</ErrorBoundary>;
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
                window.location.href = item.path;
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
            <NotificationCenter key="notifications" />,
          <UserMenu 
            key="user-menu"
            firstName={firstName} 
            lastName={lastName} 
            userRole={userRole}
            collapsed={collapsed}
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
          contentStyle={{
            padding: 0,
          }}
        >
          {children}
        </PageContainer>
      </ProLayout>
      
        {/* Global Search Modal */}
        {showNav && (
          <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        )}
      </div>
    </ErrorBoundary>
  );
}

