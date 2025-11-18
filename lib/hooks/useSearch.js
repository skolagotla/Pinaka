/**
 * useSearch - Optimized reusable search hook for client-side filtering
 * 
 * Features:
 * - Multi-field search with nested field support
 * - Debounced search input (default 300ms)
 * - Case-insensitive matching
 * - Fuzzy search support
 * - Result caching for performance
 * - Memory-efficient for large datasets
 * 
 * @example
 * const { searchTerm, setSearchTerm, clearSearch, filteredData } = useSearch(
 *   data,
 *   ['name', 'email', 'property.address'],
 *   { debounceMs: 300 }
 * );
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { debounce } from 'lodash';

/**
 * Search through an array of objects
 * @param {Array} data - Array of objects to search
 * @param {string} searchTerm - Search query
 * @param {Array<string>} searchFields - Fields to search in each object
 * @param {Object} options - Additional options
 * @returns {Array} Filtered results
 */
function searchData(data, searchTerm, searchFields, options = {}) {
  // Safety check: Ensure data is an array
  if (!Array.isArray(data)) {
    console.warn('[useSearch] data is not an array, returning empty array');
    return [];
  }

  if (!searchTerm || !searchTerm.trim()) {
    return data;
  }

  const {
    caseSensitive = false,
    fuzzy = false,
    exactMatch = false,
  } = options;

  const term = caseSensitive ? searchTerm.trim() : searchTerm.trim().toLowerCase();

  return data.filter((item) => {
    return searchFields.some((field) => {
      // Support nested fields with dot notation (e.g., "property.name")
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      
      if (value === null || value === undefined) return false;

      const stringValue = caseSensitive ? String(value) : String(value).toLowerCase();

      if (exactMatch) {
        return stringValue === term;
      }

      if (fuzzy) {
        // Simple fuzzy search: check if all characters in search term exist in order
        let searchIndex = 0;
        for (let i = 0; i < stringValue.length && searchIndex < term.length; i++) {
          if (stringValue[i] === term[searchIndex]) {
            searchIndex++;
          }
        }
        return searchIndex === term.length;
      }

      // Default: substring match
      return stringValue.includes(term);
    });
  });
}

/**
 * Optimized Hook for managing search state and filtering
 * 
 * Performance optimizations:
 * - Memoized search function with stable dependencies
 * - Debounced input to reduce excessive filtering
 * - Result caching to prevent redundant calculations
 * - Cleanup on unmount to prevent memory leaks
 * 
 * @param {Array} data - Array of objects to search
 * @param {Array<string>} searchFields - Fields to search in each object
 * @param {Object} options - Additional options
 * @param {number} options.debounceMs - Debounce delay in milliseconds (default: 300)
 * @param {boolean} options.caseSensitive - Enable case-sensitive search (default: false)
 * @param {boolean} options.fuzzy - Enable fuzzy search (default: false)
 * @param {boolean} options.exactMatch - Enable exact match only (default: false)
 * @returns {Object} Search state and methods
 */
export function useSearch(data = [], searchFields = [], options = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Use refs for mutable values to avoid recreating functions
  const searchFieldsRef = useRef(searchFields);
  const optionsRef = useRef(options);
  const cacheRef = useRef(new Map());

  // Update refs when values change
  useEffect(() => {
    searchFieldsRef.current = searchFields;
  }, [searchFields]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const {
    debounceMs = 300,
    ...searchOptions
  } = options;

  // Debounced update of search term with cleanup
  const debouncedSetSearch = useMemo(
    () => debounce((value) => setDebouncedSearchTerm(value), debounceMs),
    [debounceMs]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
      cacheRef.current.clear();
    };
  }, [debouncedSetSearch]);

  // Handle search input change
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

  // Clear search and cache
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    cacheRef.current.clear();
  }, []);

  // Filter data based on search term with caching
  const filteredData = useMemo(() => {
    // Return full data if no search term
    if (!debouncedSearchTerm || !debouncedSearchTerm.trim()) {
      return data;
    }

    // Generate cache key
    const cacheKey = `${debouncedSearchTerm}-${data.length}-${JSON.stringify(searchFieldsRef.current)}`;
    
    // Check cache
    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey);
    }

    // Perform search
    const results = searchData(data, debouncedSearchTerm, searchFieldsRef.current, searchOptions);
    
    // Store in cache (limit cache size to prevent memory issues)
    if (cacheRef.current.size > 50) {
      // Clear oldest entry
      const firstKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(firstKey);
    }
    cacheRef.current.set(cacheKey, results);
    
    return results;
  }, [data, debouncedSearchTerm, searchOptions]);

  return {
    searchTerm,
    setSearchTerm: handleSearchChange,
    clearSearch,
    filteredData,
    isSearching: searchTerm !== '',
    resultCount: filteredData.length,
    hasResults: filteredData.length > 0,
    isEmpty: filteredData.length === 0 && searchTerm !== '',
  };
}

/**
 * Hook for advanced filtering with multiple filters
 * @param {Array} data - Array of objects to filter
 * @param {Object} filters - Filter configuration
 */
export function useAdvancedFilter(data = [], filters = {}) {
  const [activeFilters, setActiveFilters] = useState({});

  const applyFilters = useCallback((item) => {
    return Object.entries(activeFilters).every(([key, filterValue]) => {
      if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
        return true; // Skip empty filters
      }

      const itemValue = key.split('.').reduce((obj, k) => obj?.[k], item);

      // Array filter (e.g., status in ['Active', 'Pending'])
      if (Array.isArray(filterValue)) {
        return filterValue.includes(itemValue);
      }

      // Date range filter
      if (filterValue.start && filterValue.end) {
        const itemDate = new Date(itemValue);
        return itemDate >= new Date(filterValue.start) && itemDate <= new Date(filterValue.end);
      }

      // Simple equality
      return itemValue === filterValue;
    });
  }, [activeFilters]);

  const filteredData = useMemo(() => {
    if (Object.keys(activeFilters).length === 0) {
      return data;
    }
    return data.filter(applyFilters);
  }, [data, applyFilters, activeFilters]);

  const setFilter = useCallback((key, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilter = useCallback((key) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  return {
    filteredData,
    activeFilters,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters: Object.keys(activeFilters).length > 0,
  };
}

/**
 * Combined search and filter hook
 * @param {Array} data - Array of objects
 * @param {Array<string>} searchFields - Fields to search
 * @param {Object} options - Options
 */
export function useSearchAndFilter(data = [], searchFields = [], options = {}) {
  const search = useSearch(data, searchFields, options);
  const filter = useAdvancedFilter(search.filteredData);

  return {
    ...search,
    ...filter,
    filteredData: filter.filteredData,
  };
}

export default useSearch;

