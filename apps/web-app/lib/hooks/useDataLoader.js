/**
 * useDataLoader Hook
 * 
 * Generic hook for loading data from multiple API endpoints
 * Handles loading states, errors, and parallel fetching
 * 
 * Usage:
 * ```jsx
 * const { data, loading, error, refetch } = useDataLoader({
 *   endpoints: {
 *     dashboard: '/api/v1/analytics/dashboard',
 *     expenses: '/api/v1/expenses',
 *     properties: '/api/properties'
 *   },
 *   onSuccess: (data) => console.log('Loaded:', data),
 *   onError: (error) => console.error('Error:', error)
 * });
 * 
 * // Access data: data.dashboard, data.expenses, data.properties
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUnifiedApi } from './useUnifiedApi';
import { safeJsonParse } from '../utils/safe-json-parser';

export function useDataLoader({ 
  endpoints = {},
  onSuccess = null,
  onError = null,
  autoLoad = true,
  showUserMessages = false,
  cache = true, // Enable caching by default for better performance
  cacheTTL = 30000, // 30 seconds default cache
} = {}) {
  const { fetch } = useUnifiedApi({ showUserMessage: showUserMessages, cache, cacheTTL });
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  /**
   * Load data from all endpoints
   */
  const loadData = useCallback(async () => {
    if (!endpoints || Object.keys(endpoints).length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all endpoints in parallel
      const endpointKeys = Object.keys(endpoints);
      
      const responses = await Promise.all(
        endpointKeys.map(async (key) => {
          const url = endpoints[key];
          
          try {
            // Build fetch options - cache should be a string for fetch API, not a boolean
            const fetchOptions = {};
            
            // Only add cache option if it's a valid string value
            // If cache is true/false, we use it for our internal caching, not fetch's cache option
            // For fetch API, we use 'no-store' to prevent browser caching when we want fresh data
            if (cache === false) {
              fetchOptions.cache = 'no-store';
            } else if (typeof cache === 'string') {
              fetchOptions.cache = cache;
            }
            // If cache is true, we don't set fetch's cache option (use default)
            // Our internal caching is handled separately
            
            const response = await fetch(
              url, 
              fetchOptions
            );
            
            // Handle null response (aborted requests return null)
            if (!response) {
              return null;
            }
            
            if (!response.ok) {
              throw new Error(`Failed to load ${key}`);
            }
            return response;
          } catch (err) {
            // Don't log abort errors - they're expected during cleanup
            if (err.name === 'AbortError' || err.message?.includes('aborted')) {
              return null;
            }
            console.error(`[useDataLoader] Error loading ${key} from ${url}:`, err);
            return null;
          }
        })
      );

      // Process responses
      const loadedData = {};
      
      for (let i = 0; i < endpointKeys.length; i++) {
        const key = endpointKeys[i];
        const response = responses[i];

        // Handle null responses (from catch block)
        if (!response) {
          loadedData[key] = null;
          continue;
        }

        // Check if response is a valid Response object
        if (response && typeof response === 'object' && 'ok' in response && response.ok) {
          try {
            // Use safe JSON parsing to handle HTML responses
            const responseData = await safeJsonParse(response);
            
            if (responseData) {
              // Handle different response structures
              loadedData[key] = responseData[key] || responseData.data || responseData;
            } else {
              // Safe parsing returned null (likely HTML or invalid JSON)
              console.warn(`[useDataLoader] Could not parse ${key} response - received HTML or invalid JSON`);
              loadedData[key] = null;
            }
          } catch (jsonError) {
            console.error(`[useDataLoader] Error parsing ${key} JSON:`, jsonError);
            loadedData[key] = null;
          }
        } else {
          // Response is not ok or not a valid Response object
          loadedData[key] = null;
        }
      }
      
      setData(loadedData);

      if (onSuccess) {
        onSuccess(loadedData);
      }
    } catch (err) {
      console.error('[useDataLoader] Fatal error in loadData:', err);
      const errorMessage = err?.message || 'Failed to load data';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoints, fetch, onSuccess, onError, showUserMessages, cache, cacheTTL]);

  /**
   * Refetch data
   */
  const refetch = useCallback(() => {
    loadData();
  }, [loadData]);

  /**
   * Update specific endpoint data manually
   */
  const updateData = useCallback((key, value) => {
    setData(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  /**
   * Reset all data
   */
  const reset = useCallback(() => {
    setData({});
    setError(null);
    setLoading(false);
  }, []);

  // Auto-load on mount if enabled (client-side only)
  // Use a ref to track if we've already loaded to prevent infinite loops
  const hasLoadedRef = useRef(false);
  
  useEffect(() => {
    if (autoLoad && typeof window !== 'undefined' && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]); // Only depend on autoLoad, not loadData

  return {
    data,
    loading,
    error,
    loadData,
    refetch,
    updateData,
    reset
  };
}

