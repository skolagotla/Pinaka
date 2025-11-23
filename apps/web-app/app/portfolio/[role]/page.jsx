/**
 * Role-Based Portfolio Dashboard
 * 
 * Displays different portfolio views based on user role:
 * - super_admin: Global view
 * - pmc_admin: PMC portfolio KPIs
 * - landlord: Properties, occupancy, rent, work orders
 * - pm: Upcoming move-ins/outs, assigned properties, work order queue
 * - tenant: Current lease, past leases, work order history, rent ledger
 * - vendor: Assigned jobs, past jobs, billing summary
 */

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Spinner, Alert } from 'flowbite-react';
import PortfolioClient from '@/components/pages/shared/Portfolio/ui';
import { usePortfolio } from '@/lib/hooks/useDataQueries';

export default function RoleBasedPortfolioPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      // Try admin session first
      const adminResponse = await fetch('/api/admin/auth/me', {
        credentials: 'include',
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        if (adminData.success && adminData.user) {
          setUser(adminData.user);
          setUserRole(adminData.user.role || 'super_admin');
          setLoading(false);
          return;
        }
      }

      // Try regular user session
      const response = await fetch('/api/user/current', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          const role = data.user.role || 
                      (data.user.userType === 'admin' ? 'super_admin' : 
                       data.user.userType === 'pmc' ? 'pmc_admin' :
                       data.user.userType === 'tenant' ? 'tenant' : 
                       data.user.userType === 'landlord' ? 'landlord' : 'landlord');
          setUserRole(role);
        } else {
          router.push('/login');
        }
      } else {
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
    return null;
  }

  // Use the existing PortfolioClient component which already handles role-based views
  return <PortfolioClient userRole={userRole} user={user} />;
}

