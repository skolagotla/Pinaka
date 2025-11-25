/**
 * ProLayoutWrapper - Migrated to v2 FastAPI
 * 
 * Professional layout wrapper using v2 FastAPI auth.
 * Gets user info from useV2Auth hook instead of props.
 */
"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, Button, Tooltip, Spinner } from 'flowbite-react';
import Link from 'next/link';
import {
  HiSearch,
  HiMenu,
  HiX,
} from 'react-icons/hi';
import UserMenu from './UserMenu';
import GlobalSearch from './GlobalSearch';
import PropertySelector from './PropertySelector';
import ErrorBoundary from './ErrorBoundary';
import NotificationCenter from './shared/NotificationCenter';
import TestDatabaseBanner from './TestDatabaseBanner';
import UnifiedSidebar from './layout/UnifiedSidebar';
import QuickActionsFAB from './shared/QuickActionsFAB';
import { useV2Auth } from '@/lib/hooks/useV2Auth';

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

export default function ProLayoutWrapper({ children }) {
  const pathname = usePathname();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    logger.navigation('Page loaded', {
      path: pathname,
      userRole,
      hasUser: !!user
    });
  }, [pathname, userRole, user]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
    }
  }, [sidebarCollapsed, isMounted]);

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

  if (!showNav) {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  if (!isMounted || authLoading) {
    return (
      <ErrorBoundary>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="xl" />
        </div>
      </ErrorBoundary>
    );
  }

  const keyboardShortcut = isMounted && typeof window !== 'undefined' && 
    navigator?.platform?.toUpperCase().indexOf('MAC') >= 0 ? '⌘K' : 'Ctrl+K';

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-50" suppressHydrationWarning>
        {/* Sidebar */}
        <Sidebar
          aria-label="Main sidebar"
          collapsed={sidebarCollapsed}
          className="fixed left-0 top-0 z-40 h-screen transition-transform"
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="mb-4 flex items-center pl-2"
            >
              <img
                src="/favicon.ico"
                alt="Pinaka Logo"
                className="mr-3 h-6 sm:h-8"
              />
              {!sidebarCollapsed && (
                <span className="self-center whitespace-nowrap text-xl font-bold text-gray-800 dark:text-white">
                  Pinaka
                </span>
              )}
            </Link>

            {/* Navigation - Using UnifiedSidebar */}
            <UnifiedSidebar collapsed={sidebarCollapsed} />
          </div>
        </Sidebar>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          {/* Header */}
          <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                color="gray"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2"
              >
                {sidebarCollapsed ? <HiMenu className="h-5 w-5" /> : <HiX className="h-5 w-5" />}
              </Button>
              
              <PropertySelector />
              
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
            </div>

            <div className="flex items-center gap-4">
              <TestDatabaseBanner />
              <NotificationCenter />
              <UserMenu 
                firstName={firstName} 
                lastName={lastName} 
                userRole={userRole}
                collapsed={sidebarCollapsed}
              />
            </div>
          </div>

          {/* Page Content */}
          <main className="h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>

        {/* Global Search Modal */}
        {showNav && (
          <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        )}

        {/* Quick Actions FAB */}
        {showNav && (
          <QuickActionsFAB userRole={userRole} />
        )}
      </div>
    </ErrorBoundary>
  );
}
