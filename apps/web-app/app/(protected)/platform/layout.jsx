/**
 * Platform Layout
 * 
 * Note: This layout is intentionally minimal because the parent ProtectedLayoutWrapper
 * already provides the UnifiedSidebar and UnifiedNavbar. This layout just passes
 * through the children and adds super_admin role checking.
 * 
 * The UnifiedSidebar will automatically show platform menu items when the user
 * has super_admin role, providing a consistent experience across portfolio and platform sections.
 */
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from 'flowbite-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import TestDatabaseBanner from '@/components/TestDatabaseBanner';
import { useV2Auth } from '@/lib/hooks/useV2Auth';

export default function PlatformLayout({ children }) {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();

  // Redirect if not super_admin
  useEffect(() => {
    if (!authLoading && (!user || !hasRole('super_admin'))) {
      router.push('/auth/login');
    }
  }, [user, authLoading, hasRole, router]);

  if (authLoading) {
    return (
      <ErrorBoundary>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="xl" />
        </div>
      </ErrorBoundary>
    );
  }

  if (!user || !hasRole('super_admin')) {
    // Redirect is handled in useEffect, but show loading while redirecting
    return (
      <ErrorBoundary>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="xl" />
        </div>
      </ErrorBoundary>
    );
  }

  // Just pass through children - parent ProtectedLayoutWrapper handles all navigation
  // The UnifiedSidebar will show platform items for super_admin users
  return (
    <ErrorBoundary>
      <TestDatabaseBanner />
      {children}
    </ErrorBoundary>
  );
}

