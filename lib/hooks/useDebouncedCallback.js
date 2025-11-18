/**
 * useDebouncedCallback Hook
 * 
 * Creates a debounced version of a callback function
 * Useful for search handlers, resize handlers, etc.
 * 
 * @param {Function} callback - The callback function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @param {Array} deps - Dependencies array (like useEffect)
 * @returns {Function} Debounced callback
 * 
 * @example
 * const handleSearch = useDebouncedCallback((value) => {
 *   fetchResults(value);
 * }, 500);
 * 
 * <Input onChange={(e) => handleSearch(e.target.value)} />
 */

import { useCallback, useRef, useEffect } from 'react';

export function useDebouncedCallback(callback, delay = 300, deps = []) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay, ...deps]
  );

  return debouncedCallback;
}

