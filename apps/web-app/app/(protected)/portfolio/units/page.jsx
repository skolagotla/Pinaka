"use client";

import { usePortfolioAuth } from '@/lib/hooks/usePortfolioAuth';
import PortfolioUnits from '@/components/pages/shared/Portfolio/Units';

export default function PortfolioUnitsPage() {
  const { user, userRole, loading } = usePortfolioAuth();

  // Layout handles loading and redirect
  if (loading || !user || !userRole) {
    return null;
  }

  return <PortfolioUnits userRole={userRole} user={user} />;
}

