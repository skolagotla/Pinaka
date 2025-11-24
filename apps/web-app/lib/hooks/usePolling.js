/**
 * usePolling Hook
 * 
 * Manages polling for data updates at regular intervals
 * Useful for real-time features like messaging, notifications, etc.
 * 
 * Usage:
 * ```jsx
 * const { startPolling, stopPolling, isPolling } = usePolling({
 *   callback: async () => {
 *     await loadMessages();
 *   },
 *   interval: 5000, // 5 seconds
 *   enabled: selectedConversation !== null
 * });
 * 
 * useEffect(() => {
 *   if (enabled) {
 *     startPolling();
 *   } else {
 *     stopPolling();
 *   }
 *   return () => stopPolling();
 * }, [enabled]);
 * ```
 */

import { useEffect, useRef, useCallback } from 'react';

export function usePolling({
  callback,
  interval = 5000,
  enabled = true,
  immediate = false
} = {}) {
  const intervalRef = useRef(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      return; // Already polling
    }

    // Execute immediately if requested
    if (immediate && callbackRef.current) {
      callbackRef.current();
    }

    // Set up interval
    intervalRef.current = setInterval(() => {
      if (callbackRef.current) {
        callbackRef.current();
      }
    }, interval);
  }, [interval, immediate]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Toggle polling
   */
  const togglePolling = useCallback(() => {
    if (intervalRef.current) {
      stopPolling();
    } else {
      startPolling();
    }
  }, [startPolling, stopPolling]);

  // Auto-start/stop based on enabled flag
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  return {
    startPolling,
    stopPolling,
    togglePolling,
    isPolling: intervalRef.current !== null
  };
}

