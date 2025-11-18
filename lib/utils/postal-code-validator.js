/**
 * Postal Code Validator and Corrector
 * 
 * Validates and attempts to correct postal codes from address autocomplete APIs
 * Sometimes APIs return incorrect or incomplete postal codes
 */

/**
 * Validate Canadian postal code format
 * @param {string} postalCode - Postal code to validate
 * @returns {boolean} - True if valid format
 */
export function isValidCanadianPostalCode(postalCode) {
  if (!postalCode) return false;
  const cleaned = postalCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  // Canadian format: A1A1A1 (letter-number-letter-number-letter-number)
  return /^[A-Z]\d[A-Z]\d[A-Z]\d$/i.test(cleaned);
}

/**
 * Validate US zip code format
 * @param {string} zipCode - Zip code to validate
 * @returns {boolean} - True if valid format
 */
export function isValidUSZipCode(zipCode) {
  if (!zipCode) return false;
  const cleaned = zipCode.replace(/\D/g, '');
  // US format: 5 digits or 9 digits (with optional dash)
  return cleaned.length === 5 || cleaned.length === 9;
}

/**
 * Attempt to correct a postal code
 * @param {string} postalCode - Postal code to correct
 * @param {string} country - Country code ('CA' or 'US')
 * @returns {string|null} - Corrected postal code or null if cannot be corrected
 */
export function correctPostalCode(postalCode, country) {
  if (!postalCode) return null;
  
  if (country === 'CA') {
    // Remove all non-alphanumeric and convert to uppercase
    const cleaned = postalCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Must be exactly 6 characters
    if (cleaned.length !== 6) return null;
    
    // Check pattern: A1A1A1
    if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(cleaned)) return null;
    
    // Format as XXX XXX
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  } else if (country === 'US') {
    // Remove all non-digits
    const cleaned = postalCode.replace(/\D/g, '');
    
    // Must be 5 or 9 digits
    if (cleaned.length === 5) {
      return cleaned;
    } else if (cleaned.length === 9) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    } else if (cleaned.length > 5 && cleaned.length < 9) {
      // If between 5-9, take first 5
      return cleaned.slice(0, 5);
    }
    
    return null;
  }
  
  return null;
}

/**
 * Validate and correct postal code from API response
 * @param {string} postalCode - Postal code from API
 * @param {string} country - Country code
 * @param {Object} options - Options
 * @param {boolean} options.autoCorrect - Attempt to auto-correct invalid codes (default: true)
 * @param {boolean} options.strict - Use strict validation (default: false)
 * @returns {Object} - { valid: boolean, corrected: string|null, original: string }
 */
export function validateAndCorrectPostalCode(postalCode, country, options = {}) {
  const { autoCorrect = true, strict = false } = options;
  
  if (!postalCode) {
    return { valid: false, corrected: null, original: postalCode };
  }
  
  const isValid = country === 'CA' 
    ? isValidCanadianPostalCode(postalCode)
    : isValidUSZipCode(postalCode);
  
  if (isValid) {
    return { valid: true, corrected: postalCode, original: postalCode };
  }
  
  // Attempt to correct if autoCorrect is enabled
  if (autoCorrect) {
    const corrected = correctPostalCode(postalCode, country);
    if (corrected) {
      const correctedIsValid = country === 'CA'
        ? isValidCanadianPostalCode(corrected)
        : isValidUSZipCode(corrected);
      
      return {
        valid: correctedIsValid,
        corrected: correctedIsValid ? corrected : null,
        original: postalCode,
        wasCorrected: true,
      };
    }
  }
  
  return {
    valid: false,
    corrected: null,
    original: postalCode,
    wasCorrected: false,
  };
}

/**
 * Log postal code validation issues for debugging
 * @param {string} postalCode - Postal code
 * @param {string} country - Country code
 * @param {string} address - Full address for context
 */
export function logPostalCodeIssue(postalCode, country, address) {
  if (process.env.NODE_ENV === 'development') {
    const validation = validateAndCorrectPostalCode(postalCode, country);
    if (!validation.valid) {
      console.warn('[PostalCodeValidator] ⚠️  Invalid postal code detected:', {
        postalCode,
        country,
        address: address.substring(0, 100),
        canBeCorrected: validation.corrected !== null,
        corrected: validation.corrected,
      });
    }
  }
}

