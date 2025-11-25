"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sidebar,
  Drawer,
  DrawerItems,
  Spinner,
} from 'flowbite-react';
import Link from 'next/link';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import UnifiedSidebar from './UnifiedSidebar';
import UnifiedNavbar from './UnifiedNavbar';
import { TourProvider } from '@/components/tour/TourProvider';
import GuidedTour from '@/components/tour/GuidedTour';
import FirstTimeModal from '@/components/tour/FirstTimeModal';
import SkipToContent from '@/components/a11y/SkipToContent';
import FocusTrap from '@/components/a11y/FocusTrap';

export default function ProtectedLayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useV2Auth();

  const [isMounted, setIsMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize mounted state and mobile detection
  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      const isMobileNow = window.innerWidth < 768;
      setIsMobile(isMobileNow);
      if (!isMobileNow) {
        setIsSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved === 'true') {
        setSidebarCollapsed(true);
      }
    }
  }, [isMounted]);

  // Save sidebar collapsed state to localStorage
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
    }
  }, [sidebarCollapsed, isMounted]);

  // Redirect to login or onboarding if not authenticated or onboarding incomplete
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    
    if (!authLoading && user) {
      // Check onboarding status
      const onboardingCompleted = user.user?.onboarding_completed ?? false;
      
      if (!onboardingCompleted) {
        // Only redirect if not already on an onboarding route
        if (!pathname?.startsWith('/onboarding')) {
          router.push('/onboarding/start');
        }
        return;
      }
    }
  }, [user, authLoading, router, pathname]);

  // Show loading spinner while checking auth or mounting
  if (!isMounted || authLoading) {
    return (
      <ErrorBoundary>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="xl" />
        </div>
      </ErrorBoundary>
    );
  }

  // Redirect if not authenticated (handled in useEffect, but show loading)
  if (!user) {
    return (
      <ErrorBoundary>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="xl" />
        </div>
      </ErrorBoundary>
    );
  }

  const handleSidebarToggle = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <ErrorBoundary>
      <TourProvider>
        <SkipToContent />
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning role="application">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar
            aria-label="Main navigation"
            role="navigation"
            collapsed={sidebarCollapsed}
            className="fixed left-0 top-0 z-40 h-screen transition-transform border-r border-gray-200 dark:border-gray-700"
          >
            <div className="flex h-full flex-col">
              {/* Logo */}
              <Link
                href="/portfolio"
                className="mb-4 flex items-center pl-4 py-4 border-b border-gray-200 dark:border-gray-700"
                data-tour-id="sidebar-navigation"
              >
                {sidebarCollapsed ? (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    P
                  </div>
                ) : (
                  <>
                    <img
                      src="/favicon.ico"
                      alt="Pinaka Logo"
                      className="mr-3 h-8"
                    />
                    <span className="self-center whitespace-nowrap text-xl font-bold text-gray-900 dark:text-white">
                      Pinaka
                    </span>
                  </>
                )}
              </Link>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto">
                <UnifiedSidebar collapsed={sidebarCollapsed} />
              </div>
            </div>
          </Sidebar>
        )}

        {/* Mobile Sidebar Drawer */}
        {isMobile && (
          <Drawer
            backdrop
            open={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            className="top-0 z-40"
            aria-label="Mobile navigation menu"
          >
            <FocusTrap active={isSidebarOpen} onEscape={() => setIsSidebarOpen(false)}>
            <DrawerItems className="h-full">
              <div className="flex h-full flex-col">
                {/* Logo */}
                <Link
                  href="/portfolio"
                  className="mb-4 flex items-center pl-4 py-4 border-b border-gray-200 dark:border-gray-700"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <img
                    src="/favicon.ico"
                    alt="Pinaka Logo"
                    className="mr-3 h-8"
                  />
                  <span className="self-center whitespace-nowrap text-xl font-bold text-gray-900 dark:text-white">
                    Pinaka
                  </span>
                </Link>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto">
                  <UnifiedSidebar collapsed={false} />
                </div>
              </div>
            </DrawerItems>
            </FocusTrap>
          </Drawer>
        )}

        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ${
            isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          {/* Top Navbar */}
          <UnifiedNavbar
            onSidebarToggle={handleSidebarToggle}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Page Content */}
          <main 
            id="main-content"
            className="mt-16 min-h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6"
            role="main"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
        </div>
        <GuidedTour />
        <FirstTimeModal />
      </TourProvider>
    </ErrorBoundary>
  );
}

