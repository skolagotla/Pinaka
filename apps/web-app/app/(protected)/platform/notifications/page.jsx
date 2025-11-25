/**
 * Platform Notifications Page - Super Admin Only
 * Redirects to /portfolio (unified Portfolio interface)
 */
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { Spinner } from 'flowbite-react';

export default function PlatformNotificationsPage() {
  const router = useRouter();
  const { user, loading, hasRole } = useV2Auth();

  useEffect(() => {
    if (!loading) {
      if (!user || !hasRole('super_admin')) {
        router.replace('/login');
      } else {
        router.replace('/portfolio');
      }
    }
  }, [user, loading, hasRole, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return null;
}

