/**
 * Custom hook for form validation
 * Provides flexible validation rules and error state management
 * 
 * @param {Object} formData - Form data to validate
 * @param {Object} validationRules - Validation rules object
 * @returns {Object} - Validation state and helpers
 */

import { useMemo } from 'react';

/**
 * Validation rule types:
 * - required: field must not be empty
 * - minLength: minimum string length
 * - maxLength: maximum string length
 * - min: minimum number value
 * - max: maximum number value
 * - pattern: regex pattern
 * - custom: custom validation function
 * - email: valid email format
 * - url: valid URL format
 */

export function useFormValidation(formData, validationRules) {
  /**
   * Validate a single field
   */
  const validateField = (fieldName, value, rules) => {
    const errors = [];

    // Required validation
    if (rules.required) {
      if (value === null || value === undefined || value === '' || 
          (typeof value === 'string' && value.trim() === '')) {
        errors.push(rules.required === true ? 'This field is required' : rules.required);
      }
    }

    // Skip other validations if value is empty and not required
    if (!value && !rules.required) {
      return { valid: true, errors: [] };
    }

    // Min length validation
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength} characters`);
    }

    // Max length validation
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      errors.push(`Maximum length is ${rules.maxLength} characters`);
    }

    // Min value validation
    if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
      errors.push(`Minimum value is ${rules.min}`);
    }

    // Max value validation
    if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
      errors.push(`Maximum value is ${rules.max}`);
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string') {
      const regex = rules.pattern instanceof RegExp ? rules.pattern : new RegExp(rules.pattern);
      if (!regex.test(value)) {
        errors.push(rules.patternMessage || 'Invalid format');
      }
    }

    // Email validation
    if (rules.email && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push('Invalid email address');
      }
    }

    // URL validation
    if (rules.url && typeof value === 'string') {
      try {
        new URL(value);
      } catch {
        errors.push('Invalid URL');
      }
    }

    // Custom validation function
    if (rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(value, formData);
      if (customResult !== true) {
        errors.push(typeof customResult === 'string' ? customResult : 'Validation failed');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  /**
   * Validate all fields
   */
  const validation = useMemo(() => {
    const fieldErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((fieldName) => {
      const rules = validationRules[fieldName];
      const value = formData[fieldName];
      
      const result = validateField(fieldName, value, rules);
      
      if (!result.valid) {
        isValid = false;
        fieldErrors[fieldName] = result.errors;
      }
    });

    return {
      isValid,
      fieldErrors,
      hasErrors: Object.keys(fieldErrors).length > 0,
    };
  }, [formData, validationRules]);

  /**
   * Get errors for a specific field
   */
  const getFieldErrors = (fieldName) => {
    return validation.fieldErrors[fieldName] || [];
  };

  /**
   * Check if a specific field is valid
   */
  const isFieldValid = (fieldName) => {
    return !validation.fieldErrors[fieldName];
  };

  /**
   * Get first error for a field
   */
  const getFirstFieldError = (fieldName) => {
    const errors = validation.fieldErrors[fieldName];
    return errors && errors.length > 0 ? errors[0] : null;
  };

  return {
    // Overall validation state
    isValid: validation.isValid,
    hasErrors: validation.hasErrors,
    fieldErrors: validation.fieldErrors,
    
    // Field-specific helpers
    getFieldErrors,
    isFieldValid,
    getFirstFieldError,
    
    // Manual validation
    validateField,
  };
}

/**
 * Common validation rule presets
 */
export const commonRules = {
  required: { required: true },
  email: { required: true, email: true },
  optionalEmail: { email: true },
  url: { url: true },
  postalCodeCA: {
    pattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/,
    patternMessage: 'Invalid Canadian postal code (e.g., A1A 1A1)',
  },
  zipCodeUS: {
    pattern: /^\d{5}$/,
    patternMessage: 'Invalid US ZIP code (5 digits)',
  },
  phone: {
    pattern: /^[\d\s\-\+\(\)]+$/,
    patternMessage: 'Invalid phone number',
  },
  positiveNumber: {
    min: 0,
  },
  year: {
    min: 1900,
    max: new Date().getFullYear() + 10,
  },
};

