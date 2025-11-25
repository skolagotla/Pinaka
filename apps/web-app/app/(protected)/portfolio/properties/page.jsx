"use client";

import { usePortfolioAuth } from '@/lib/hooks/usePortfolioAuth';
import PortfolioProperties from '@/components/pages/shared/Portfolio/Properties';

export default function PortfolioPropertiesPage() {
  const { user, userRole, loading } = usePortfolioAuth();

  // Layout handles loading and redirect
  if (loading || !user || !userRole) {
    return null;
  }

  return <PortfolioProperties userRole={userRole} user={user} />;
}

