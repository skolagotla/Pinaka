"use client";

import { usePortfolioAuth } from '@/lib/hooks/usePortfolioAuth';
import PortfolioDashboard from '@/components/pages/shared/Portfolio/Dashboard';

export default function PortfolioPage() {
  const { user, userRole, loading } = usePortfolioAuth();

  // Layout handles loading and redirect
  if (loading || !user || !userRole) {
    return null;
  }

  return <PortfolioDashboard userRole={userRole} user={user} />;
}
