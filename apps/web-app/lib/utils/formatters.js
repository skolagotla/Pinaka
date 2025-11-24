/**
 * Formatting Utilities
 * Standardized formatters for phone numbers, postal codes, and zip codes
 */

/**
 * Format phone number for North America
 * @param {string|number|null|undefined} value - Raw phone number input
 * @returns {string} - Formatted as (XXX) XXX-XXXX
 */
export const formatPhoneNumber = (value) => {
  if (!value && value !== 0) return '';
  
  // Convert to string to handle numbers and other types
  const stringValue = String(value);
  
  // Remove all non-numeric characters
  const cleaned = stringValue.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limited = cleaned.substring(0, 10);
  
  // Format based on length
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  } else {
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  }
};

/**
 * Format Canadian postal code using rules engine
 * Format: XXX XXX (e.g., M5H 2N2)
 * @param {string|number|null|undefined} value - Raw postal code input
 * @returns {string} - Formatted as XXX XXX
 */
export const formatPostalCode = (value) => {
  if (!value && value !== 0) return '';
  
  // Convert to string to handle numbers and other types
  const stringValue = String(value);
  
  // Remove all non-alphanumeric characters and convert to uppercase
  const cleaned = stringValue.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Limit to 6 characters
  const limited = cleaned.substring(0, 6);
  
  // Format as XXX XXX (per rules engine)
  if (limited.length <= 3) {
    return limited;
  } else {
    return `${limited.slice(0, 3)} ${limited.slice(3)}`;
  }
};

/**
 * Format US zip code using rules engine
 * Format: XXXXX (5 digits)
 * @param {string|number|null|undefined} value - Raw zip code input
 * @returns {string} - Formatted as XXXXX
 */
export const formatZipCode = (value) => {
  if (!value && value !== 0) return '';
  
  // Convert to string to handle numbers and other types
  const stringValue = String(value);
  
  // Remove all non-numeric characters
  const cleaned = stringValue.replace(/\D/g, '');
  
  // Limit to 5 digits
  const limited = cleaned.substring(0, 5);
  
  return limited;
};

/**
 * Validate phone number
 * @param {string|number|null|undefined} value - Phone number to validate
 * @returns {boolean} - True if valid (10 digits)
 */
export const isValidPhoneNumber = (value) => {
  if (!value && value !== 0) return false;
  const stringValue = String(value);
  const cleaned = stringValue.replace(/\D/g, '');
  return cleaned.length === 10;
};

/**
 * Validate Canadian postal code
 * @param {string|number|null|undefined} value - Postal code to validate
 * @returns {boolean} - True if valid (XXX XXX format)
 */
export const isValidPostalCode = (value) => {
  if (!value && value !== 0) return false;
  const stringValue = String(value);
  // Canadian postal code pattern: A1A 1A1
  const pattern = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;
  return pattern.test(stringValue);
};

/**
 * Validate US zip code
 * @param {string|number|null|undefined} value - Zip code to validate
 * @returns {boolean} - True if valid (5 digits)
 */
export const isValidZipCode = (value) => {
  if (!value && value !== 0) return false;
  const stringValue = String(value);
  const cleaned = stringValue.replace(/\D/g, '');
  return cleaned.length === 5;
};

/**
 * Get unformatted phone number (digits only)
 * @param {string|number|null|undefined} value - Formatted phone number
 * @returns {string} - Digits only
 */
export const getUnformattedPhone = (value) => {
  if (!value && value !== 0) return '';
  const stringValue = String(value);
  return stringValue.replace(/\D/g, '');
};

/**
 * Get unformatted postal/zip code
 * @param {string|number|null|undefined} value - Formatted postal/zip code
 * @returns {string} - Alphanumeric only
 */
export const getUnformattedPostalCode = (value) => {
  if (!value && value !== 0) return '';
  const stringValue = String(value);
  return stringValue.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
};

