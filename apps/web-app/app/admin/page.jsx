"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';

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
        const { apiClient } = await import('@/lib/utils/api-client');
        
        // Check auth by making the API call directly to check status code
        // This avoids throwing errors for expected 401 responses
        const response = await apiClient('/api/admin/auth/me', {
          method: 'GET',
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
        // The interceptors now suppress 401 errors for auth endpoints
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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <Spin size="large" />
    </div>
  );
}

