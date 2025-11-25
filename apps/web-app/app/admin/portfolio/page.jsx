"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PortfolioClient from '@/components/pages/shared/Portfolio/ui';

export default function AdminPortfolioPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
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
            const primaryRole = roles[0]?.name || 'admin';
            
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return <PortfolioClient userRole={userRole || 'admin'} user={user} />;
}

