/**
 * useRegionalInput Hook
 * 
 * Unified hook for handling regional input formatting and validation
 * Supports phone numbers, postal codes, and country-specific formatting
 * 
 * This hook extracts common logic from PhoneNumberInput and PostalCodeInput
 * to reduce code duplication and improve maintainability.
 */

import { useMemo } from 'react';
import {
  formatPhoneNumber,
  formatPostalCode,
  formatZipCode,
  isValidPhoneNumber,
  isValidPostalCode,
  isValidZipCode,
} from '../utils/formatters';
import { getPostalCodeLabel } from '../constants/regions';

/**
 * Hook for phone number input with auto-formatting
 * 
 * @param {string} value - Current phone number value
 * @param {function} onChange - Change handler
 * @param {string} country - Country code ('CA' or 'US')
 * @returns {object} - Props to spread on Input component
 */
export function usePhoneInput(value, onChange, country = 'CA') {
  const handleChange = (e) => {
    if (!e || !e.target) {
      return;
    }
    
    const formatted = formatPhoneNumber(e.target.value);
    
    // Create synthetic event with formatted value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formatted,
      },
    };
    
    // Only call onChange if it's provided
    if (onChange && typeof onChange === 'function') {
      onChange(syntheticEvent);
    }
  };

  // Validate phone number for visual feedback
  const isValid = value ? isValidPhoneNumber(value) : null;
  const status = isValid === false ? 'error' : undefined;

  return {
    onChange: handleChange,
    status,
    placeholder: '(XXX) XXX-XXXX',
    maxLength: 14, // (XXX) XXX-XXXX = 14 characters
  };
}

/**
 * Hook for postal/zip code input with auto-formatting
 * 
 * @param {string} value - Current postal/zip code value
 * @param {function} onChange - Change handler
 * @param {string} country - Country code ('CA' or 'US')
 * @returns {object} - Props to spread on Input component
 */
export function usePostalCodeInput(value, onChange, country) {
  const handleChange = (e) => {
    if (!e || !e.target) {
      return;
    }
    
    let formatted = e.target.value;
    
    if (country === 'CA') {
      formatted = formatPostalCode(e.target.value);
    } else if (country === 'US') {
      formatted = formatZipCode(e.target.value);
    }
    
    // Create synthetic event with formatted value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formatted,
      },
    };
    
    // Only call onChange if it's provided
    if (onChange && typeof onChange === 'function') {
      onChange(syntheticEvent);
    }
  };

  // Validate postal/zip code for visual feedback
  let isValid = null;
  if (value) {
    if (country === 'CA') {
      isValid = isValidPostalCode(value);
    } else if (country === 'US') {
      isValid = isValidZipCode(value);
    }
  }
  const status = isValid === false ? 'error' : undefined;

  // Get label and placeholder based on country
  const label = getPostalCodeLabel(country);
  const placeholder = country === 'CA' ? 'XXX XXX' : country === 'US' ? 'XXXXX' : 'Postal/Zip Code';
  const maxLength = country === 'CA' ? 7 : country === 'US' ? 5 : 10; // CA: XXX XXX, US: XXXXX

  return {
    onChange: handleChange,
    status,
    placeholder,
    maxLength,
    label,
    style: { textTransform: country === 'CA' ? 'uppercase' : 'none' },
  };
}

/**
 * Generic hook for any regional input with formatting
 * 
 * @param {string} type - Input type ('phone', 'postal')
 * @param {string} value - Current value
 * @param {function} onChange - Change handler
 * @param {string} country - Country code
 * @returns {object} - Props to spread on Input component
 */
export function useRegionalInput(type, value, onChange, country = 'CA') {
  if (type === 'phone') {
    return usePhoneInput(value, onChange, country);
  } else if (type === 'postal') {
    return usePostalCodeInput(value, onChange, country);
  }
  
  throw new Error(`Unknown regional input type: ${type}`);
}

/**
 * Hook for formatting existing values for display
 * Useful for table columns and read-only displays
 * 
 * @param {string} type - Input type ('phone', 'postal')
 * @param {string} value - Value to format
 * @param {string} country - Country code
 * @returns {string} - Formatted value
 */
export function useFormatValue(type, value, country = 'CA') {
  return useMemo(() => {
    if (!value) return '';
    
    switch (type) {
      case 'phone':
        return formatPhoneNumber(value);
      case 'postal':
        return country === 'CA' ? formatPostalCode(value) : formatZipCode(value);
      default:
        return value;
    }
  }, [type, value, country]);
}

/**
 * Hook for validating regional input values
 * 
 * @param {string} type - Input type ('phone', 'postal')
 * @param {string} value - Value to validate
 * @param {string} country - Country code
 * @returns {object} - Validation result { isValid, errorMessage }
 */
export function useValidateRegional(type, value, country = 'CA') {
  return useMemo(() => {
    if (!value) return { isValid: null, errorMessage: null };
    
    switch (type) {
      case 'phone':
        const phoneValid = isValidPhoneNumber(value);
        return {
          isValid: phoneValid,
          errorMessage: phoneValid ? null : 'Please enter a valid 10-digit phone number',
        };
      case 'postal':
        if (country === 'CA') {
          const postalValid = isValidPostalCode(value);
          return {
            isValid: postalValid,
            errorMessage: postalValid ? null : 'Please enter a valid Canadian postal code (e.g., M5H 2N2)',
          };
        } else if (country === 'US') {
          const zipValid = isValidZipCode(value);
          return {
            isValid: zipValid,
            errorMessage: zipValid ? null : 'Please enter a valid US zip code (e.g., 12345)',
          };
        }
        return { isValid: null, errorMessage: null };
      default:
        return { isValid: null, errorMessage: null };
    }
  }, [type, value, country]);
}

