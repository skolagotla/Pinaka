"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, Button, Tooltip, Spinner } from 'flowbite-react';
import { HiSearch, HiMenu, HiX } from 'react-icons/hi';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
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

/**
 * LayoutClient - Migrated to v2 FastAPI Auth
 * 
 * Uses useV2Auth hook to get current user and roles from FastAPI v2 backend.
 * No longer depends on Prisma or Next.js API routes.
 */
export default function LayoutClient({ children }) {
  const pathname = usePathname();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  
  // Check if we're on a protected route - these have their own unified layout
  const isProtectedRoute = pathname?.startsWith('/portfolio') || pathname?.startsWith('/platform');
  // Don't show banner on db-switcher page itself
  const isDbSwitcherRoute = pathname === '/db-switcher';
  // Don't show navigation on login/auth pages or onboarding
  const isAuthRoute = pathname?.startsWith('/auth') || pathname === '/login' || pathname?.startsWith('/onboarding');
  
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

  // Protected routes have their own unified layout - don't wrap with LayoutClient's layout
  if (isProtectedRoute) {
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

  // Auth routes (login, etc.) - standalone page, no layout
  if (isAuthRoute) {
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

  // Fallback layout using Flowbite (when ProLayout is disabled)
  const keyboardShortcut = isMounted && typeof window !== 'undefined' && 
    navigator?.platform?.toUpperCase().indexOf('MAC') >= 0 ? '⌘K' : 'Ctrl+K';

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-50">
        {showNav && (
          <Sidebar
            aria-label="Main sidebar"
            collapsed={sidebarCollapsed}
            className="fixed left-0 top-0 z-40 h-screen transition-transform"
          >
            <div className="flex h-full flex-col">
              {/* Logo */}
              <Link
                href="/dashboard"
                className="mb-4 flex items-center pl-2 py-4 border-b border-gray-200"
              >
                {!sidebarCollapsed ? (
                  <span className="self-center whitespace-nowrap text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Pinaka
                  </span>
                ) : (
                  <div className="w-8 h-8 rounded-md bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                    P
                  </div>
                )}
              </Link>
              
              {/* Navigation Menu - Protected routes use UnifiedSidebar in ProtectedLayoutWrapper */}
              <div className="flex-1 overflow-y-auto pb-20">
                {/* Navigation removed - use UnifiedSidebar in ProtectedLayoutWrapper for protected routes */}
              </div>
              
              {/* User Menu at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                <UserMenu 
                  firstName={firstName} 
                  lastName={lastName} 
                  userRole={userRole}
                  collapsed={sidebarCollapsed}
                />
              </div>
            </div>
          </Sidebar>
        )}
        
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${showNav ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'}`}>
          {/* Top Header Bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
            <div className="flex items-center gap-4">
              {showNav && (
                <Button
                  color="gray"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2"
                >
                  {sidebarCollapsed ? <HiMenu className="h-5 w-5" /> : <HiX className="h-5 w-5" />}
                </Button>
              )}
            </div>
            
            {showNav && (
              <div className="flex items-center gap-4">
                <Tooltip content={`Search ${keyboardShortcut}`}>
                  <Button
                    color="gray"
                    onClick={() => setSearchOpen(true)}
                    className="flex items-center gap-2 px-4"
                  >
                    <HiSearch className="h-4 w-4" />
                    <span className="text-sm text-gray-500">Search...</span>
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
          </header>
          
          {/* Global Search Modal */}
          {showNav && (
            <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
          )}
          
          {/* Page Content */}
          <main className="h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
