/**
 * Custom hook to fetch and cache reference data from database
 * Replaces hardcoded constants with dynamic database values
 */

"use client";
import { useState, useEffect } from 'react';

let cachedData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useReferenceData() {
  const [data, setData] = useState(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReferenceData() {
      // Check if cache is still valid
      if (cachedData && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/reference-data');
        
        if (!response.ok) {
          throw new Error('Failed to fetch reference data');
        }

        const result = await response.json();
        
        // Cache the data
        cachedData = result;
        cacheTimestamp = Date.now();
        
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching reference data:', err);
        setError(err.message);
        
        // Fallback to empty arrays if fetch fails
        if (!cachedData) {
          cachedData = {
            countries: [],
            regions: [],
            propertyTypes: [],
            unitStatuses: [],
            maintenanceCategories: [],
            maintenancePriorities: [],
            maintenanceStatuses: [],
            leaseStatuses: [],
            paymentStatuses: [],
          };
          setData(cachedData);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchReferenceData();
  }, []);

  // Helper functions for common operations
  const getCountries = () => {
    return (data?.countries || []).filter(c => c && c.code != null);
  };
  
  const getRegionsByCountry = (countryCode) => {
    if (!data?.regions) return [];
    return data.regions
      .filter(r => r && r.countryCode === countryCode && r.code != null)
      .map(r => ({ code: r.code, name: r.name }));
  };

  const getRegionLabel = (countryCode) => {
    return countryCode === 'CA' ? 'Province' : 'State';
  };

  const getPostalLabel = (countryCode) => {
    return countryCode === 'CA' ? 'Postal Code' : 'ZIP Code';
  };

  const getPostalPlaceholder = (countryCode) => {
    return countryCode === 'CA' ? 'A1A 1A1' : '12345';
  };

  const getPropertyTypes = () => {
    return (data?.propertyTypes || [])
      .filter(t => t && t.name != null)
      .map(t => t.name);
  };
  
  const getUnitStatuses = () => {
    return (data?.unitStatuses || []).filter(s => s != null);
  };
  
  const getMaintenanceCategories = () => {
    return (data?.maintenanceCategories || [])
      .filter(c => c && c.name != null)
      .map(c => c.name);
  };
  
  const getMaintenancePriorities = () => {
    return (data?.maintenancePriorities || []).filter(p => p != null);
  };
  
  const getMaintenanceStatuses = () => {
    return (data?.maintenanceStatuses || []).filter(s => s != null);
  };
  
  const getLeaseStatuses = () => {
    return (data?.leaseStatuses || []).filter(s => s != null);
  };
  
  const getPaymentStatuses = () => {
    return (data?.paymentStatuses || []).filter(s => s != null);
  };

  return {
    data,
    loading,
    error,
    // Helper functions
    getCountries,
    getRegionsByCountry,
    getRegionLabel,
    getPostalLabel,
    getPostalPlaceholder,
    getPropertyTypes,
    getUnitStatuses,
    getMaintenanceCategories,
    getMaintenancePriorities,
    getMaintenanceStatuses,
    getLeaseStatuses,
    getPaymentStatuses,
  };
}

// Function to clear cache (useful for admin updates)
export function clearReferenceDataCache() {
  cachedData = null;
  cacheTimestamp = null;
}

