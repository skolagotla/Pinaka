"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Spinner } from 'flowbite-react';
import dynamic from 'next/dynamic';

// Lazy load landlord detail clients
const PMCLandlordDetailClient = dynamic(() => import('@/components/pages/pmc/landlords/[id]/ui').then(mod => mod.default));

export default function LandlordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const landlordId = params?.id as string;
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
            
            // Only PMC admins and super admins can access landlord details
            if (primaryRole !== 'pmc_admin' && primaryRole !== 'pm' && primaryRole !== 'super_admin') {
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

  if (!user || !userRole || !landlordId) {
    return null; // Will redirect
  }

  return <PMCLandlordDetailClient landlordId={landlordId} user={user} />;
}
