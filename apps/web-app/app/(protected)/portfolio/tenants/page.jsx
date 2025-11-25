"use client";

import { usePortfolioAuth } from '@/lib/hooks/usePortfolioAuth';
import PortfolioTenants from '@/components/pages/shared/Portfolio/Tenants';

export default function PortfolioTenantsPage() {
  const { user, userRole, loading } = usePortfolioAuth();

  // Layout handles loading and redirect
  if (loading || !user || !userRole) {
    return null;
  }

  return <PortfolioTenants userRole={userRole} user={user} />;
}

