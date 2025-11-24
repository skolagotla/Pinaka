/**
 * Performance Utilities
 * 
 * Provides utilities for optimizing React components and data processing
 */

/**
 * Memoize expensive filter/map operations
 * @param {Array} data - Data to process
 * @param {Function} processor - Function to process data
 * @param {Array} deps - Dependencies for memoization
 * @returns {Array} Processed data
 */
export function useMemoizedProcessing(data, processor, deps) {
  const { useMemo } = require('react');
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return processor(data);
  }, [data, ...deps]);
}

/**
 * Batch process array operations to prevent blocking
 * @param {Array} items - Items to process
 * @param {Function} processor - Function to process each item
 * @param {number} batchSize - Number of items to process per batch
 * @returns {Promise<Array>} Processed items
 */
export async function batchProcess(items, processor, batchSize = 100) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Optimize array operations by combining filter and map
 * @param {Array} data - Data to process
 * @param {Function} predicate - Filter predicate
 * @param {Function} mapper - Map function
 * @returns {Array} Processed data
 */
export function filterMap(data, predicate, mapper) {
  if (!data || !Array.isArray(data)) return [];
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (predicate(data[i])) {
      result.push(mapper(data[i]));
    }
  }
  return result;
}

/**
 * Create a memoized selector for large datasets
 * @param {Array} data - Data to select from
 * @param {Function} selector - Selection function
 * @returns {Function} Memoized selector
 */
export function createMemoizedSelector(data, selector) {
  const cache = new Map();
  return (key) => {
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = selector(data, key);
    cache.set(key, result);
    return result;
  };
}

