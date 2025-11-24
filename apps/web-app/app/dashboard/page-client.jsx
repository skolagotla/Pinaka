"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from 'flowbite-react';
import dynamic from 'next/dynamic';

// Lazy load dashboard clients
const LandlordDashboardClient = dynamic(() => import('@/components/pages/landlord/dashboard/ui').then(mod => mod.default));
const PMCDashboardClient = dynamic(() => import('@/components/pages/pmc/dashboard/ui').then(mod => mod.default));
const TenantDashboardClient = dynamic(() => import('@/components/pages/tenant/dashboard/ui').then(mod => mod.default));

export default function DashboardPage() {
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
            
            setUser({
              ...currentUser.user,
              roles: currentUser.roles,
            });
            setUserRole(primaryRole);
            setLoading(false);
            return;
          }
        } catch (v2Error) {
          // Token invalid, try admin API
        }
      }
      
      // Fallback to admin API
      try {
        const adminUser = await adminApi.getCurrentUser();
        if (adminUser && adminUser.user) {
          setUser(adminUser.user);
          setUserRole(adminUser.user.role === 'SUPER_ADMIN' || adminUser.user.role === 'super_admin' ? 'super_admin' : 'admin');
          setLoading(false);
          return;
        }
      } catch (adminError) {
        // Both failed
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

  if (!user || !userRole) {
    return null; // Will redirect
  }

  // Route to appropriate dashboard based on role
  if (userRole === 'landlord') {
    return <LandlordDashboardClient user={user} />;
  } else if (userRole === 'pmc_admin' || userRole === 'pm') {
    return <PMCDashboardClient user={user} />;
  } else if (userRole === 'tenant') {
    return <TenantDashboardClient user={user} />;
  } else {
    // Default to portfolio
    router.push('/portfolio');
    return null;
  }
}

