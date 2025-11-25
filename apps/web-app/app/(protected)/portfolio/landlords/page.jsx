"use client";

import { usePortfolioAuth } from '@/lib/hooks/usePortfolioAuth';
import PortfolioLandlords from '@/components/pages/shared/Portfolio/Landlords';

export default function PortfolioLandlordsPage() {
  const { user, userRole, loading } = usePortfolioAuth();

  // Layout handles loading and redirect
  if (loading || !user || !userRole) {
    return null;
  }

  return <PortfolioLandlords userRole={userRole} user={user} />;
}

