/**
 * useFormDataSanitizer Hook
 * 
 * Centralized data sanitization and formatting for form submissions
 * Handles trimming, phone/postal formatting, date formatting, etc.
 */

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { formatPhoneNumber, formatPostalCode } from '../utils/formatters';

// Helper functions for unformatting
const getUnformattedPhone = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

const getUnformattedPostalCode = (value) => {
  if (!value) return '';
  return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
};

/**
 * Hook for sanitizing form data before submission
 * @param {object} options - Configuration options
 * @returns {object} - Sanitization functions
 */
export function useFormDataSanitizer(options = {}) {
  const {
    formatPhone = true,
    formatPostal = true,
    trimStrings = true,
    formatDates = true,
    country = 'CA'
  } = options;

  /**
   * Sanitize a single field value
   */
  const sanitizeField = useMemo(() => {
    return (fieldName, value, fieldOptions = {}) => {
      if (value === null || value === undefined) {
        return fieldOptions.defaultValue ?? null;
      }

      // Handle strings
      if (typeof value === 'string') {
        let sanitized = value;
        
        // Trim strings
        if (trimStrings) {
          sanitized = sanitized.trim();
        }
        
        // Format phone numbers
        if (formatPhone && fieldName === 'phone') {
          // For display: format it
          if (fieldOptions.mode === 'display') {
            if (sanitized && !sanitized.includes('(')) {
              sanitized = formatPhoneNumber(sanitized);
            }
          } else {
            // For storage: unformat it (digits only)
            sanitized = getUnformattedPhone(sanitized);
          }
        }
        
        // Format postal codes
        if (formatPostal && (fieldName === 'postalZip' || fieldName === 'postalCode')) {
          // For display: format it
          if (fieldOptions.mode === 'display') {
            if (sanitized && country === 'CA') {
              sanitized = formatPostalCode(sanitized);
            }
          } else {
            // For storage: unformat it
            sanitized = getUnformattedPostalCode(sanitized);
          }
        }
        
        return sanitized || (fieldOptions.defaultValue ?? '');
      }

      // Handle dates
      if (value instanceof Date || (formatDates && dayjs.isDayjs(value))) {
        if (fieldOptions.mode === 'display') {
          return dayjs.isDayjs(value) ? value : dayjs(value);
        } else {
          return dayjs(value).format('YYYY-MM-DD');
        }
      }

      // Handle numbers
      if (typeof value === 'number') {
        return isNaN(value) ? fieldOptions.defaultValue ?? null : value;
      }

      // Handle arrays
      if (Array.isArray(value)) {
        return value.filter(item => item !== null && item !== undefined);
      }

      return value;
    };
  }, [formatPhone, formatPostal, trimStrings, formatDates, country]);

  /**
   * Sanitize entire form data object
   */
  const sanitizeFormData = useMemo(() => {
    return (formData, options = {}) => {
      const sanitized = {};
      const mode = options.mode || 'storage'; // 'storage' or 'display'
      
      for (const [key, value] of Object.entries(formData)) {
        sanitized[key] = sanitizeField(key, value, { ...options, mode });
      }
      
      return sanitized;
    };
  }, [sanitizeField]);

  /**
   * Sanitize nested objects (like emergency contacts, employers)
   */
  const sanitizeNestedArray = useMemo(() => {
    return (array, fieldSanitizers = {}) => {
      if (!Array.isArray(array)) return [];
      
      return array
        .filter(item => item !== null && item !== undefined)
        .map(item => {
          const sanitized = {};
          for (const [key, value] of Object.entries(item)) {
            const sanitizer = fieldSanitizers[key] || sanitizeField;
            sanitized[key] = typeof sanitizer === 'function' 
              ? sanitizer(key, value, { mode: 'storage' })
              : sanitizeField(key, value, { mode: 'storage' });
          }
          return sanitized;
        });
    };
  }, [sanitizeField]);

  return {
    sanitizeField,
    sanitizeFormData,
    sanitizeNestedArray
  };
}

