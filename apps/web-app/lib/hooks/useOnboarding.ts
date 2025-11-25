/**
 * React hook for onboarding state management
 */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { v2Api } from '@/lib/api/v2-client';

export interface OnboardingStatus {
  onboarding_completed: boolean;
  onboarding_step: number;
  onboarding_data: Record<string, any>;
}

export function useOnboarding() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await v2Api.getOnboardingStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch onboarding status');
      // If endpoint doesn't exist yet, assume onboarding not completed
      setStatus({
        onboarding_completed: false,
        onboarding_step: 0,
        onboarding_data: {},
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const updateStatus = useCallback(async (data: {
    step?: number;
    completed?: boolean;
    data?: Record<string, any>;
  }) => {
    try {
      setError(null);
      const updated = await v2Api.updateOnboardingStatus(data);
      setStatus(updated);
      return updated;
    } catch (err: any) {
      setError(err.detail || 'Failed to update onboarding status');
      throw err;
    }
  }, []);

  const complete = useCallback(async () => {
    try {
      setError(null);
      await v2Api.completeOnboarding();
      setStatus({
        onboarding_completed: true,
        onboarding_step: 999,
        onboarding_data: status?.onboarding_data || {},
      });
    } catch (err: any) {
      setError(err.detail || 'Failed to complete onboarding');
      throw err;
    }
  }, [status]);

  return {
    status,
    loading,
    error,
    updateStatus,
    complete,
    refetch: fetchStatus,
  };
}

