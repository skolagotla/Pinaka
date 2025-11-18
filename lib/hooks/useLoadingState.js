/**
 * useLoadingState Hook
 * 
 * Centralized loading state management for async operations
 * Reduces repetitive loading state code
 * 
 * Usage:
 * ```jsx
 * const { loading, withLoading } = useLoadingState();
 * 
 * const handleSave = withLoading(async () => {
 *   await saveData();
 * });
 * 
 * <Button loading={loading}>Save</Button>
 * ```
 */

import { useState, useCallback } from 'react';

export function useLoadingState(initialState = false) {
  const [loading, setLoading] = useState(initialState);

  /**
   * Wrap an async function with loading state
   */
  const withLoading = useCallback(async (asyncFn) => {
    try {
      setLoading(true);
      const result = await asyncFn();
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Set loading state directly
   */
  const setLoadingState = useCallback((value) => {
    setLoading(value);
  }, []);

  return {
    loading,
    setLoading: setLoadingState,
    withLoading
  };
}

