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
        // Use adminApi instead of fetch
        const { adminApi } = await import('@/lib/api/admin-api');
        const user = await adminApi.getCurrentUser();
        if (user && user.success && user.user) {
          // Redirect to platform dashboard for super_admin, regular dashboard for others
          if (user.user.role === 'SUPER_ADMIN' || user.user.role === 'super_admin') {
            router.push('/platform');
          } else {
            router.push('/dashboard');
          }
          return;
        }
        
        // Not authenticated, redirect to login
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

