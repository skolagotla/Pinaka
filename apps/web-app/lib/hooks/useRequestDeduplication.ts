/**
 * Request Deduplication Hook
 * 
 * Prevents duplicate API requests from being made simultaneously.
 * Useful for preventing React Strict Mode double-fetching and user double-clicks.
 */

import { useRef, useCallback } from 'react';

type PendingRequest = {
  promise: Promise<any>;
  timestamp: number;
};

const pendingRequests = new Map<string, PendingRequest>();

// Clean up old requests (older than 30 seconds)
const CLEANUP_INTERVAL = 30000;
setInterval(() => {
  const now = Date.now();
  pendingRequests.forEach((request, key) => {
    if (now - request.timestamp > CLEANUP_INTERVAL) {
      pendingRequests.delete(key);
    }
  });
}, CLEANUP_INTERVAL);

/**
 * Hook to deduplicate requests
 */
export function useRequestDeduplication() {
  const requestRef = useRef<Map<string, Promise<any>>>(new Map());

  const dedupeRequest = useCallback(async <T>(
    key: string,
    requestFn: () => Promise<T>,
    options: { ttl?: number } = {}
  ): Promise<T> => {
    const { ttl = 5000 } = options; // Default 5 second deduplication window
    
    // Check if request is already pending
    const existing = pendingRequests.get(key);
    if (existing && Date.now() - existing.timestamp < ttl) {
      return existing.promise;
    }

    // Create new request
    const promise = requestFn().finally(() => {
      // Remove from pending after a delay (to handle rapid re-requests)
      setTimeout(() => {
        pendingRequests.delete(key);
      }, ttl);
    });

    pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }, []);

  return { dedupeRequest };
}

