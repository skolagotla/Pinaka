"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from 'flowbite-react';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import PortfolioPMCs from '@/components/pages/shared/Portfolio/PMCs';

export default function PortfolioPMCsPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();

  useEffect(() => {
    if (!authLoading && (!user || !hasRole('super_admin'))) {
      router.push('/portfolio');
    }
  }, [user, authLoading, hasRole, router]);

  // Layout handles loading
  if (authLoading) {
    return null;
  }

  if (!user || !hasRole('super_admin')) {
    return (
      <Alert color="failure">
        Access denied. This page is only available to Super Administrators.
      </Alert>
    );
  }

  return <PortfolioPMCs user={user} />;
}

