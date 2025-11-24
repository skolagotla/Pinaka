"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from 'flowbite-react';
import dynamic from 'next/dynamic';

// Lazy load payments client (tenant-only)
const TenantPaymentsClient = dynamic(() => import('@/components/pages/tenant/payments/ui').then(mod => mod.default));

export default function PaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      // Use FastAPI v2 auth
      const { v2Api } = await import('@/lib/api/v2-client');
      const { adminApi } = await import('@/lib/api/admin-api');
      
      // Try v2 API first
      const token = v2Api.getToken();
      if (token) {
        try {
          const currentUser = await v2Api.getCurrentUser();
          if (currentUser && currentUser.user) {
            const roles = currentUser.roles || [];
            const primaryRole = roles[0]?.name || 'tenant';
            
            // Only tenants can access payments page
            if (primaryRole !== 'tenant') {
              router.push('/portfolio');
              return;
            }
            
            setUser({
              ...currentUser.user,
              roles: currentUser.roles,
            });
            setUserRole(primaryRole);
            setLoading(false);
            return;
          }
        } catch (v2Error) {
          // Token invalid
        }
      }
      
      // Fallback to admin API
      try {
        const adminUser = await adminApi.getCurrentUser();
        if (adminUser && adminUser.user) {
          // Admin users shouldn't access tenant payments page
          router.push('/admin/dashboard');
          return;
        }
      } catch (adminError) {
        // Not authenticated
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!user || userRole !== 'tenant') {
    return null; // Will redirect
  }

  return <TenantPaymentsClient tenant={user} initialPayments={[]} />;
}
