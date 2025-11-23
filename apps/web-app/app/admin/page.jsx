"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from 'flowbite-react';

/**
 * Admin Root Page
 * 
 * This page handles the /admin route:
 * - If authenticated: redirects to /admin/dashboard
 * - If not authenticated: redirects to /admin/login
 */
export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Use fetch directly instead of apiClient to avoid import issues
        const response = await fetch('/api/admin/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        // Check if response is ok (200-299)
        if (response && response.ok) {
          try {
            const data = await response.json();
            if (data.success && data.user) {
              // User is authenticated, redirect to dashboard
              router.replace('/admin/dashboard');
              return;
            }
          } catch (parseError) {
            // Failed to parse response, treat as unauthenticated
          }
        }
        
        // Not authenticated (401 or other error), redirect to login
        // This is expected behavior when not logged in - no error logging needed
        router.replace('/admin/login');
      } catch (err) {
        // Only log unexpected errors (not 401 Unauthorized)
        const errorMessage = err?.message || String(err || '');
        if (!errorMessage.includes('Not authenticated') && !errorMessage.includes('401')) {
          console.error('[Admin Root] Unexpected error checking authentication:', err);
        }
        // Redirect to login for any error
        router.replace('/admin/login');
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Show loading spinner while checking auth
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner size="xl" />
    </div>
  );
}

