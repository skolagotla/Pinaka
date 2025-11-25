"use client";

import { usePortfolioAuth } from '@/lib/hooks/usePortfolioAuth';
import PortfolioLeases from '@/components/pages/shared/Portfolio/Leases';

export default function PortfolioLeasesPage() {
  const { user, userRole, loading } = usePortfolioAuth();

  // Layout handles loading and redirect
  if (loading || !user || !userRole) {
    return null;
  }

  return <PortfolioLeases userRole={userRole} user={user} />;
}

