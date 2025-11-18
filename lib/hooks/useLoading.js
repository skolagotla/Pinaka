/**
 * useLoading Hook
 * 
 * Centralized loading state management
 * Reduces repetitive loading state code across components
 * 
 * Usage:
 * ```jsx
 * const { loading, withLoading, startLoading, stopLoading } = useLoading();
 * 
 * // Option 1: Manual control
 * const handleSubmit = async () => {
 *   startLoading();
 *   try {
 *     await submitData();
 *   } finally {
 *     stopLoading();
 *   }
 * };
 * 
 * // Option 2: Automatic withLoading wrapper
 * const handleSubmit = withLoading(async () => {
 *   await submitData();
 * });
 * ```
 */

import { useState, useCallback } from 'react';

export function useLoading(initialState = false) {
  const [loading, setLoading] = useState(initialState);
  
  /**
   * Start loading
   */
  const startLoading = useCallback(() => {
    setLoading(true);
  }, []);
  
  /**
   * Stop loading
   */
  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);
  
  /**
   * Execute async function with automatic loading state
   * Automatically sets loading to true before execution and false after
   */
  const withLoading = useCallback(async (asyncFn) => {
    if (typeof asyncFn !== 'function') {
      console.warn('[useLoading] withLoading expects a function');
      return;
    }
    
    setLoading(true);
    try {
      return await asyncFn();
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Toggle loading state
   */
  const toggleLoading = useCallback(() => {
    setLoading(prev => !prev);
  }, []);
  
  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    withLoading,
    toggleLoading,
  };
}

