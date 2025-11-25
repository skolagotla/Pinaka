"use client";

import { usePortfolioAuth } from '@/lib/hooks/usePortfolioAuth';
import PortfolioVendors from '@/components/pages/shared/Portfolio/Vendors';

export default function PortfolioVendorsPage() {
  const { user, userRole, loading } = usePortfolioAuth();

  // Layout handles loading and redirect
  if (loading || !user || !userRole) {
    return null;
  }

  return <PortfolioVendors userRole={userRole} user={user} />;
}

