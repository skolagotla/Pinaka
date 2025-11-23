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
      // Try to get user from session
      const response = await fetch('/api/user/current', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          // Determine role from user data
          const role = data.user.role || 
                      (data.user.userType === 'admin' ? 'admin' : 
                       data.user.userType === 'pmc' ? 'pmc' :
                       data.user.userType === 'tenant' ? 'tenant' : 'landlord');
          setUserRole(role);
        } else {
          router.push('/admin/login');
        }
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/admin/login');
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

