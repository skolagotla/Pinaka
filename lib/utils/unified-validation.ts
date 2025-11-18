/**
 * ═══════════════════════════════════════════════════════════════
 * UNIFIED VALIDATION UTILITIES
 * ═══════════════════════════════════════════════════════════════
 * 
 * Single source of truth for all validation rules
 * Consolidates: validation-helpers.ts, form-validation-rules.js, useFormValidation.js
 * 
 * Supports both Ant Design Form rules and custom validation
 * 
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Validation Rules for Ant Design Form.Item components
 * 
 * Usage:
 * ```tsx
 * import { ValidationRules } from '@/lib/utils/unified-validation';
 * 
 * <Form.Item
 *   name="email"
 *   label="Email"
 *   rules={[ValidationRules.required('Email'), ValidationRules.email]}
 * >
 *   <Input />
 * </Form.Item>
 * ```
 */
export const ValidationRules = {
  /**
   * Required field validation
   */
  required: (fieldName: string) => ({
    required: true,
    message: `${fieldName} is required`,
  }),

  /**
   * Email validation
   */
  email: {
    type: 'email' as const,
    message: 'Please enter a valid email address',
  },

  /**
   * Phone number validation (North American format: (XXX) XXX-XXXX)
   */
  phone: {
    pattern: /^\(\d{3}\) \d{3}-\d{4}$/,
    message: 'Please enter a valid phone number: (XXX) XXX-XXXX',
  },

  /**
   * Phone number validation (digits only, 10 digits)
   */
  phoneDigits: {
    pattern: /^\d{10}$/,
    message: 'Please enter a 10-digit phone number',
  },

  /**
   * Phone number validation with custom validator (handles formatted input)
   */
  phoneValidator: (required: boolean = true) => ({
    validator: (_: any, value: string) => {
      if (!value && !required) return Promise.resolve();
      if (!value && required) return Promise.reject('Phone number is required');
      
      // Remove formatting to check if it's 10 digits
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 10) {
        return Promise.reject('Please enter a valid 10-digit phone number');
      }
      return Promise.resolve();
    },
  }),

  /**
   * Postal code validation (country-specific)
   */
  postalCode: (country: 'CA' | 'US') => ({
    pattern: country === 'CA' 
      ? /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i 
      : /^\d{5}(-\d{4})?$/,
    message: country === 'CA'
      ? 'Please enter a valid Canadian postal code (A1A 1A1)'
      : 'Please enter a valid US ZIP code (12345 or 12345-6789)',
  }),

  /**
   * Canadian postal code validation
   */
  postalCodeCA: {
    pattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    message: 'Please enter a valid Canadian postal code (A1A 1A1)',
  },

  /**
   * US ZIP code validation
   */
  zipCodeUS: {
    pattern: /^\d{5}(-\d{4})?$/,
    message: 'Please enter a valid US ZIP code (12345 or 12345-6789)',
  },

  /**
   * Postal code validator with custom logic
   */
  postalCodeValidator: (country: 'CA' | 'US', required: boolean = true) => {
    const label = country === 'CA' ? 'Postal Code' : 'ZIP Code';
    return {
      validator: (_: any, value: string) => {
        if (!value && !required) return Promise.resolve();
        if (!value && required) return Promise.reject(`${label} is required`);
        
        const isValid = country === 'CA' 
          ? /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(value)
          : /^\d{5}(-\d{4})?$/.test(value);
        
        if (!isValid) {
          return Promise.reject(
            country === 'CA'
              ? 'Please enter a valid Canadian postal code (A1A 1A1)'
              : 'Please enter a valid US ZIP code (12345)'
          );
        }
        return Promise.resolve();
      },
    };
  },

  /**
   * Currency/Money validation
   */
  currency: {
    pattern: /^\d+(\.\d{1,2})?$/,
    message: 'Please enter a valid amount (e.g., 1000.00)',
  },

  /**
   * Positive number validation
   */
  positiveNumber: {
    pattern: /^\d+$/,
    message: 'Please enter a positive number',
  },

  /**
   * Min length validation
   */
  minLength: (min: number, fieldName: string = 'Field') => ({
    min,
    message: `${fieldName} must be at least ${min} characters`,
  }),

  /**
   * Max length validation
   */
  maxLength: (max: number, fieldName: string = 'Field') => ({
    max,
    message: `${fieldName} must be no more than ${max} characters`,
  }),

  /**
   * Min value validation
   */
  min: (min: number, fieldName: string = 'Field') => ({
    type: 'number' as const,
    min,
    message: `${fieldName} must be at least ${min}`,
  }),

  /**
   * Max value validation
   */
  max: (max: number, fieldName: string = 'Field') => ({
    type: 'number' as const,
    max,
    message: `${fieldName} must be no more than ${max}`,
  }),

  /**
   * URL validation
   */
  url: {
    type: 'url' as const,
    message: 'Please enter a valid URL',
  },
};

/**
 * Helper functions for common validation rule sets
 */
export const ValidationHelpers = {
  /**
   * Get phone number validation rules
   */
  getPhoneValidationRules: (required: boolean = true) => {
    const rules: any[] = [];
    if (required) {
      rules.push(ValidationRules.required('Phone number'));
    }
    if (ValidationRules.phoneValidator) {
      rules.push(ValidationRules.phoneValidator(required));
    }
    return rules;
  },

  /**
   * Get postal/ZIP code validation rules
   */
  getPostalCodeValidationRules: (country: 'CA' | 'US' = 'CA', required: boolean = true) => {
    const rules: any[] = [];
    const label = country === 'CA' ? 'Postal Code' : 'ZIP Code';
    if (required) {
      rules.push(ValidationRules.required(label));
    }
    // Use postalCode validator if available, otherwise use pattern-based validation
    if (ValidationRules.postalCodeValidator) {
      rules.push(ValidationRules.postalCodeValidator(country, required));
    } else {
      rules.push(ValidationRules.postalCode(country));
    }
    return rules;
  },

  /**
   * Get email validation rules
   */
  getEmailValidationRules: (required: boolean = true) => {
    const rules: any[] = [];
    if (required) {
      rules.push(ValidationRules.required('Email'));
    }
    rules.push(ValidationRules.email);
    return rules;
  },

  /**
   * Get province/state validation rules
   */
  getProvinceStateValidationRules: (label: string = 'Province/State', required: boolean = true) => {
    const rules: any[] = [];
    if (required) {
      rules.push(ValidationRules.required(label));
    }
    return rules;
  },

  /**
   * Get country validation rules
   */
  getCountryValidationRules: (required: boolean = true) => {
    const rules: any[] = [];
    if (required) {
      rules.push(ValidationRules.required('Country'));
    }
    return rules;
  },

  /**
   * Get all common validation rules for tenant form
   */
  getTenantFormValidationRules: (country: 'CA' | 'US' = 'CA') => ({
    firstName: [ValidationRules.required('First name')],
    lastName: [ValidationRules.required('Last name')],
    email: ValidationHelpers.getEmailValidationRules(true),
    phone: ValidationHelpers.getPhoneValidationRules(true),
    country: ValidationHelpers.getCountryValidationRules(true),
    provinceState: ValidationHelpers.getProvinceStateValidationRules(
      country === 'CA' ? 'Province' : 'State',
      true
    ),
    postalZip: ValidationHelpers.getPostalCodeValidationRules(country, true),
  }),
};

// CommonJS exports for require() compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ValidationRules,
    ValidationHelpers,
  };
}

