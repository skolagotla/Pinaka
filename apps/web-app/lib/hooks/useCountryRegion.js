/**
 * Custom hook for managing country-specific address fields
 * Handles country/region selection, labels, and postal code formatting
 * 
 * Features:
 * - Country dropdown (CA/US) with CA as default
 * - Province/State selection with smart defaults (CA→ON, US→NJ)
 * - Dynamic labels (Province vs State, Postal Code vs ZIP Code)
 * - Postal code formatting (CA: XXX XXX, US: XXXXX)
 * - Integration with useReferenceData for database-driven data
 * 
 * @example
 * const { country, setCountry, region, setRegion, ... } = useCountryRegion();
 */

"use client";
import { useState, useEffect, useCallback } from 'react';
import { useReferenceData } from './useReferenceData';

const DEFAULT_COUNTRY = 'CA';
const DEFAULT_REGIONS = {
  CA: 'ON', // Ontario
  US: 'NJ', // New Jersey
};

export function useCountryRegion(initialCountry = DEFAULT_COUNTRY, initialRegion = null) {
  const refData = useReferenceData();
  
  const [country, setCountryState] = useState(initialCountry);
  const [region, setRegion] = useState(initialRegion || DEFAULT_REGIONS[initialCountry]);

  /**
   * Set country and auto-update region to default
   */
  const setCountry = useCallback((newCountry) => {
    setCountryState(newCountry);
    // Auto-set default region for the new country
    setRegion(DEFAULT_REGIONS[newCountry] || '');
  }, []);

  /**
   * Format postal/zip code based on country
   */
  const formatPostalCode = useCallback((value, countryCode = country) => {
    if (!value) return '';
    
    // Remove all non-alphanumeric characters
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (countryCode === 'CA') {
      // Canadian format: A1A 1A1
      if (cleaned.length <= 3) {
        return cleaned;
      }
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`;
    } else {
      // US format: 12345 or 12345-6789
      if (cleaned.length <= 5) {
        return cleaned;
      }
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}`;
    }
  }, [country]);

  /**
   * Validate postal/zip code format
   */
  const validatePostalCode = useCallback((value, countryCode = country) => {
    if (!value) return true; // Allow empty
    
    const cleaned = value.replace(/[^A-Z0-9]/gi, '');
    
    if (countryCode === 'CA') {
      // Canadian postal code: A1A1A1 (letter-number-letter-number-letter-number)
      return /^[A-Z]\d[A-Z]\d[A-Z]\d$/i.test(cleaned);
    } else {
      // US zip code: 12345 or 12345-6789
      return /^\d{5}(\d{4})?$/.test(cleaned);
    }
  }, [country]);

  /**
   * Get available regions for current country
   */
  const getRegions = useCallback(() => {
    return refData.getRegionsByCountry(country);
  }, [country, refData]);

  /**
   * Get label for region field (Province or State)
   */
  const getRegionLabel = useCallback(() => {
    return refData.getRegionLabel(country);
  }, [country, refData]);

  /**
   * Get label for postal code field
   */
  const getPostalLabel = useCallback(() => {
    return refData.getPostalLabel(country);
  }, [country, refData]);

  /**
   * Get placeholder for postal code field
   */
  const getPostalPlaceholder = useCallback(() => {
    return refData.getPostalPlaceholder(country);
  }, [country, refData]);

  /**
   * Get postal code pattern for validation
   */
  const getPostalPattern = useCallback(() => {
    return country === 'CA' 
      ? '[A-Za-z]\\d[A-Za-z] \\d[A-Za-z]\\d'
      : '\\d{5}(-\\d{4})?';
  }, [country]);

  /**
   * Reset to defaults
   */
  const resetToDefaults = useCallback(() => {
    setCountryState(DEFAULT_COUNTRY);
    setRegion(DEFAULT_REGIONS[DEFAULT_COUNTRY]);
  }, []);

  return {
    // State
    country,
    region,
    
    // Setters
    setCountry,
    setRegion,
    
    // Data getters
    getRegions,
    getRegionLabel,
    getPostalLabel,
    getPostalPlaceholder,
    getPostalPattern,
    
    // Utilities
    formatPostalCode,
    validatePostalCode,
    resetToDefaults,
    
    // Reference data (pass-through for all fields)
    countries: refData.getCountries(),
    getCountries: refData.getCountries,
    getRegionsByCountry: refData.getRegionsByCountry,
    getPropertyTypes: refData.getPropertyTypes,
    getUnitStatuses: refData.getUnitStatuses,
    getMaintenanceCategories: refData.getMaintenanceCategories,
    getMaintenancePriorities: refData.getMaintenancePriorities,
    getMaintenanceStatuses: refData.getMaintenanceStatuses,
    getLeaseStatuses: refData.getLeaseStatuses,
    getPaymentStatuses: refData.getPaymentStatuses,
    loading: refData.loading,
    error: refData.error,
    
    // Constants
    DEFAULT_COUNTRY,
    DEFAULT_REGIONS,
  };
}

/**
 * Postal Code Input Component Helper
 * Returns props to be spread on an Input component for postal code formatting
 * 
 * @example
 * <Input {...getPostalCodeProps(countryRegion)} />
 */
export function getPostalCodeProps(countryRegion) {
  return {
    placeholder: countryRegion.getPostalPlaceholder(),
    maxLength: countryRegion.country === 'CA' ? 7 : 10, // "A1A 1A1" or "12345-6789"
    onChange: (e) => {
      const formatted = countryRegion.formatPostalCode(e.target.value);
      e.target.value = formatted;
    },
    onBlur: (e) => {
      const isValid = countryRegion.validatePostalCode(e.target.value);
      if (!isValid && e.target.value) {
        console.warn(`Invalid ${countryRegion.getPostalLabel()}: ${e.target.value}`);
      }
    },
  };
}

