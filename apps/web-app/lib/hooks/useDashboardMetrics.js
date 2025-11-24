/**
 * useDashboardMetrics Hook
 * Centralized dashboard metrics and chart data management
 * 
 * Features:
 * - Fetch dashboard statistics
 * - Format chart data
 * - Loading states
 * - Error handling
 * - Refresh functionality
 * 
 * Usage:
 * const { stats, chartData, loading, error, refreshMetrics } = useDashboardMetrics({
 *   userRole: 'landlord',
 *   apiEndpoint: '/api/v1/analytics/dashboard',
 * });
 */

import { useState, useEffect, useCallback } from 'react';
import { notify } from '@/lib/utils/notification-helper';

export function useDashboardMetrics({ userRole, apiEndpoint, autoRefresh = false, refreshInterval = 30000 }) {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch metrics from API
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiEndpoint);
      
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || data);
        setChartData(data.chartData || null);
      } else {
        throw new Error('Failed to fetch dashboard metrics');
      }
    } catch (err) {
      console.error('[useDashboardMetrics] Error:', err);
      setError(err.message);
      notify.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint]);

  // Refresh metrics
  const refreshMetrics = useCallback(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchMetrics();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchMetrics]);

  // Format currency helper
  const formatCurrency = useCallback((amount) => {
    if (!amount && amount !== 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Format percentage helper
  const formatPercent = useCallback((value) => {
    if (!value && value !== 0) return '0%';
    return `${Math.round(value)}%`;
  }, []);

  // Calculate trend helper
  const calculateTrend = useCallback((current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }, []);

  return {
    stats,
    chartData,
    loading,
    error,
    refreshMetrics,
    formatCurrency,
    formatPercent,
    calculateTrend,
  };
}

export default useDashboardMetrics;
