/**
 * Common Validation Rules
 * 
 * Reusable validation rules for Ant Design Form.Item
 * Provides consistent validation across the application
 * 
 * Usage:
 * ```jsx
 * import { rules } from '@/lib/utils/validation-rules';
 * 
 * <Form.Item name="email" rules={rules.email}>
 *   <Input />
 * </Form.Item>
 * 
 * <Form.Item name="phone" rules={rules.phone}>
 *   <Input />
 * </Form.Item>
 * ```
 */

/**
 * Common validation rules
 */
export const rules = {
  /**
   * Required field rule
   */
  required: (fieldName = 'This field') => ({
    required: true,
    message: `${fieldName} is required`,
  }),
  
  /**
   * Email validation rule
   */
  email: {
    type: 'email',
    message: 'Please enter a valid email address',
  },
  
  /**
   * Phone number validation rule (North American format)
   */
  phone: {
    pattern: /^[\d\s\-\(\)\+]+$/,
    message: 'Please enter a valid phone number',
  },
  
  /**
   * Canadian postal code validation
   */
  postalCodeCA: {
    pattern: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    message: 'Please enter a valid Canadian postal code (e.g., A1A 1A1)',
  },
  
  /**
   * US ZIP code validation
   */
  zipCodeUS: {
    pattern: /^\d{5}(-\d{4})?$/,
    message: 'Please enter a valid US ZIP code (e.g., 12345 or 12345-6789)',
  },
  
  /**
   * URL validation rule
   */
  url: {
    type: 'url',
    message: 'Please enter a valid URL',
  },
  
  /**
   * Positive number validation
   */
  positiveNumber: {
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return Promise.reject(new Error('Please enter a positive number'));
      }
      return Promise.resolve();
    },
  },
  
  /**
   * Non-negative number validation (allows 0)
   */
  nonNegativeNumber: {
    validator: (_, value) => {
      if (!value && value !== 0) return Promise.resolve();
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return Promise.reject(new Error('Please enter a non-negative number'));
      }
      return Promise.resolve();
    },
  },
  
  /**
   * Minimum length validation
   */
  minLength: (min, fieldName = 'This field') => ({
    min,
    message: `${fieldName} must be at least ${min} characters`,
  }),
  
  /**
   * Maximum length validation
   */
  maxLength: (max, fieldName = 'This field') => ({
    max,
    message: `${fieldName} must be no more than ${max} characters`,
  }),
  
  /**
   * Password strength validation
   */
  password: {
    min: 8,
    message: 'Password must be at least 8 characters',
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      if (value.length < 8) {
        return Promise.reject(new Error('Password must be at least 8 characters'));
      }
      // Add more password strength checks if needed
      return Promise.resolve();
    },
  },
  
  /**
   * Date validation (must be in the past)
   */
  pastDate: {
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date >= today) {
        return Promise.reject(new Error('Date must be in the past'));
      }
      return Promise.resolve();
    },
  },
  
  /**
   * Date validation (must be in the future)
   */
  futureDate: {
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date <= today) {
        return Promise.reject(new Error('Date must be in the future'));
      }
      return Promise.resolve();
    },
  },
};

/**
 * Helper function to combine multiple rules
 */
export function combineRules(...ruleArrays) {
  return ruleArrays.flat().filter(Boolean);
}

/**
 * Common rule combinations
 */
export const ruleCombos = {
  /**
   * Required email
   */
  requiredEmail: [
    rules.required('Email'),
    rules.email,
  ],
  
  /**
   * Required phone
   */
  requiredPhone: [
    rules.required('Phone'),
    rules.phone,
  ],
  
  /**
   * Required positive number
   */
  requiredPositiveNumber: [
    rules.required(),
    rules.positiveNumber,
  ],
};

export default rules;

