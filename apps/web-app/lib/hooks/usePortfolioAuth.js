/**
 * Helper hook for portfolio pages to get user and role from layout auth
 * This avoids duplicating authentication logic that's already in the layout
 */
"use client";

import { useMemo } from 'react';
import { useV2Auth } from './useV2Auth';

export function usePortfolioAuth() {
  const { user, loading: authLoading } = useV2Auth();

  const userRole = useMemo(() => {
    if (!user || !user.roles || user.roles.length === 0) {
      return null;
    }
    return user.roles[0]?.name || null;
  }, [user]);

  return {
    user: user?.user || null,
    userRole,
    loading: authLoading,
    fullUser: user, // Includes roles
  };
}

