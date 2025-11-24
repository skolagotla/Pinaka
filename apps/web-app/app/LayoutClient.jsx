"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Layout, Typography, Button, Tooltip } from 'antd';
import { SearchOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import UserMenu from '@/components/UserMenu';
import Navigation from '@/components/Navigation';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalSearch from '@/components/GlobalSearch';
import ProLayoutWrapper from '@/components/ProLayoutWrapper';
import { registerServiceWorker } from '@/lib/utils/service-worker-register';
import { useV2Auth } from '@/lib/hooks/useV2Auth';

// Lazy load logger to avoid server-side execution
let logger;
if (typeof window !== 'undefined') {
  logger = require('@/lib/logger');
} else {
  // Server-side mock
  logger = {
    navigation: () => {},
    error: () => {},
    info: () => {},
  };
}

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

/**
 * LayoutClient - Migrated to v2 FastAPI Auth
 * 
 * Uses useV2Auth hook to get current user and roles from FastAPI v2 backend.
 * No longer depends on Prisma or Next.js API routes.
 */
export default function LayoutClient({ children }) {
  const pathname = usePathname();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  
  // Check if we're on an admin route - admin has its own layout
  const isAdminRoute = pathname?.startsWith('/admin');
  // Don't show banner on db-switcher page itself
  const isDbSwitcherRoute = pathname === '/db-switcher';
  
  // ALL HOOKS MUST BE CALLED FIRST (before any conditional returns)
  const [isMounted, setIsMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Extract user info from v2 auth
  const firstName = user?.user?.full_name?.split(' ')[0] || '';
  const lastName = user?.user?.full_name?.split(' ').slice(1).join(' ') || '';
  
  // Determine user role from v2 roles
  let userRole = null;
  if (user) {
    if (hasRole('super_admin')) {
      userRole = 'super_admin';
    } else if (hasRole('pmc_admin')) {
      userRole = 'pmc_admin';
    } else if (hasRole('pm')) {
      userRole = 'pm';
    } else if (hasRole('landlord')) {
      userRole = 'landlord';
    } else if (hasRole('tenant')) {
      userRole = 'tenant';
    } else if (hasRole('vendor')) {
      userRole = 'vendor';
    } else if (hasRole('contractor')) {
      userRole = 'contractor';
    }
  }
  
  const showNav = !!user && !authLoading;
  
  // Wait for client-side mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    // Register service worker for offline support and caching
    registerServiceWorker();
  }, []);

  // Load collapsed state from localStorage after mount (client-side only)
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved === 'true') {
        setSidebarCollapsed(true);
      }
    }
  }, [isMounted]);

  useEffect(() => {
    // Log page navigation
    logger.navigation('Page loaded', {
      path: pathname,
      userRole,
      hasUser: !!user
    });
  }, [pathname, userRole, user]);

  // Save collapsed state to localStorage whenever it changes (only after mount)
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
    }
  }, [sidebarCollapsed, isMounted]);

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
  }, [setSearchOpen]);
  
  // Use ProLayout for better UI/UX
  const useProLayout = process.env.NEXT_PUBLIC_USE_PRO_LAYOUT === 'true' || true; // Enable by default

  // On server or before mount, don't use ProLayout to avoid hydration mismatch
  if (!isMounted) {
    // Return simple layout during SSR
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    );
  }

  // Admin routes have their own layout - don't wrap with LayoutClient's layout
  if (isAdminRoute) {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    );
  }

  // Database switcher route - standalone page, no layout
  if (isDbSwitcherRoute) {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    );
  }

  if (useProLayout && showNav) {
    return (
      <ErrorBoundary>
        <ProLayoutWrapper
          firstName={firstName}
          lastName={lastName}
          userRole={userRole}
          showNav={showNav}
        >
          {children}
        </ProLayoutWrapper>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Layout style={{ minHeight: '100vh' }}>
        {showNav && (
          <Sider
            width={240}
            collapsedWidth={80}
            collapsible
            collapsed={sidebarCollapsed}
            onCollapse={(collapsed) => setSidebarCollapsed(collapsed)}
            trigger={null}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              backgroundColor: '#ffffff',
              borderRight: '1px solid #f0f0f0',
              boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Logo at top of sidebar */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'center',
              minHeight: '64px',
            }}>
              {!sidebarCollapsed ? (
                <Title
                  level={3}
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #1890ff 30%, #52c41a 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Pinaka
                </Title>
              ) : (
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
              )}
            </div>
            
            {/* Navigation Menu */}
            <div style={{ 
              padding: '16px 0',
              flex: 1,
              overflow: 'auto',
              paddingBottom: '80px', // Space for user menu at bottom
            }}>
              <Navigation show={showNav} userRole={userRole} collapsed={sidebarCollapsed} />
            </div>
            
            {/* User Menu at bottom of sidebar */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px',
              borderTop: '1px solid #f0f0f0',
              backgroundColor: '#ffffff',
            }}>
              <UserMenu 
                firstName={firstName} 
                lastName={lastName} 
                userRole={userRole}
                collapsed={sidebarCollapsed}
              />
            </div>
          </Sider>
        )}
        
        <Layout style={{ marginLeft: showNav ? (sidebarCollapsed ? 80 : 240) : 0 }}>
          {/* Top Header Bar (for search and other actions) */}
          <Header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 999,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #f0f0f0',
              padding: '0 24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              height: 64,
            }}
          >
            {showNav && (
              <Button
                type="text"
                icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                style={{
                  fontSize: '16px',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            )}
            <div style={{ flex: 1 }} /> {/* Spacer to push items to the right */}
            {showNav && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Tooltip title={
                  <span>
                    Search {' '}
                    <kbd style={{ 
                      padding: '2px 4px', 
                      background: 'rgba(255,255,255,0.2)', 
                      borderRadius: '3px',
                      fontSize: '11px',
                    }}>
                      {navigator?.platform?.toUpperCase().indexOf('MAC') >= 0 ? '⌘K' : 'Ctrl+K'}
                    </kbd>
                  </span>
                }>
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
                      fontSize: '14px',
                      minWidth: '200px',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>Search...</span>
                  </Button>
                </Tooltip>
                <UserMenu 
                  firstName={firstName} 
                  lastName={lastName} 
                  userRole={userRole}
                  collapsed={sidebarCollapsed}
                />
              </div>
            )}
          </Header>
          
          {/* Global Search Modal */}
          {showNav && (
            <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
          )}
          
          <Content
            style={{
              padding: '24px',
              backgroundColor: '#f0f2f5',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </ErrorBoundary>
  );
}
