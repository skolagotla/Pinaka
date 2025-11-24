/**
 * TypeScript type definitions for useFormValidation hook
 */

export interface ValidationRule {
  required?: boolean | string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp | string;
  patternMessage?: string;
  email?: boolean;
  url?: boolean;
  custom?: (value: any, formData: any) => boolean | string;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export interface FieldValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ValidationState {
  isValid: boolean;
  fieldErrors: { [fieldName: string]: string[] };
  hasErrors: boolean;
}

export interface FormValidationReturn {
  isValid: boolean;
  hasErrors: boolean;
  fieldErrors: { [fieldName: string]: string[] };
  getFieldErrors: (fieldName: string) => string[];
  isFieldValid: (fieldName: string) => boolean;
  getFirstFieldError: (fieldName: string) => string | null;
  validateField: (fieldName: string, value: any, rules: ValidationRule) => FieldValidationResult;
}

export function useFormValidation(
  formData: any,
  validationRules: ValidationRules
): FormValidationReturn;

export const commonRules: {
  required: ValidationRule;
  email: ValidationRule;
  optionalEmail: ValidationRule;
  url: ValidationRule;
  postalCodeCA: ValidationRule;
  zipCodeUS: ValidationRule;
  phone: ValidationRule;
  positiveNumber: ValidationRule;
  year: ValidationRule;
};

