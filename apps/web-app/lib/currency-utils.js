/**
 * Currency Utilities
 * Maps countries to their currencies and provides formatting functions
 * 
 * Currently supports:
 * - CA (Canada) → CAD
 * - US (United States) → USD
 * 
 * Infrastructure is in place for future expansion to additional countries.
 */

// Country code to currency code mapping
// Currently focused on North America (CA, US)
// Can be easily expanded to support more countries in the future
export const COUNTRY_CURRENCY_MAP = {
  // North America (Active)
  'US': 'USD',
  'CA': 'CAD',
  
  // Future expansion placeholder - uncomment and add as needed
  // 'MX': 'MXN',
  // 'GB': 'GBP',
  // 'FR': 'EUR',
  // 'DE': 'EUR',
  // 'AU': 'AUD',
  // Add more countries here as the application expands
};

/**
 * Get currency code from country code
 * @param {string} countryCode - Two-letter country code (e.g., 'US', 'CA')
 * @returns {string} Currency code (e.g., 'USD', 'CAD')
 */
export function getCurrencyFromCountry(countryCode) {
  if (!countryCode) return 'USD'; // Default to USD
  const upperCode = countryCode.toUpperCase();
  return COUNTRY_CURRENCY_MAP[upperCode] || 'USD';
}

/**
 * Format amount as currency based on country using rules engine
 * Format: $X,XXX.XX with thousand separator (comma) and 2 decimal places
 * @param {number} amount - The amount to format
 * @param {string} countryCode - Two-letter country code (e.g., 'US', 'CA')
 * @returns {string} Formatted currency string
 * 
 * Examples:
 * - formatCurrency(5550, 'US') → "$5,550.00" (USD)
 * - formatCurrency(5550, 'CA') → "$5,550.00" (CAD)
 * 
 * Uses rules engine pattern: always includes thousand separator (comma) and 2 decimal places.
 * Defaults to USD for any unrecognized country codes.
 */
export function formatCurrency(amount, countryCode = 'US') {
  const currencyCode = getCurrencyFromCountry(countryCode);
  
  try {
    // Use rules engine pattern: thousand separator (comma) and 2 decimal places
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is invalid (defaults to USD)
    console.error(`Invalid currency code: ${currencyCode} for country: ${countryCode}. Defaulting to USD.`);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(amount);
  }
}

/**
 * Get currency symbol from country code
 * @param {string} countryCode - Two-letter country code
 * @returns {string} Currency symbol (e.g., '$', '€', '£')
 */
export function getCurrencySymbol(countryCode = 'US') {
  const currencyCode = getCurrencyFromCountry(countryCode);
  
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    // Format a zero amount and extract the symbol
    const parts = formatter.formatToParts(0);
    const symbolPart = parts.find(part => part.type === 'currency');
    return symbolPart ? symbolPart.value : '$';
  } catch (error) {
    return '$'; // Fallback
  }
}

/**
 * Format amount as number with commas (no currency symbol)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted number string (e.g., "5,550.00")
 */
export function formatAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Get full currency name from country code
 * @param {string} countryCode - Two-letter country code
 * @returns {string} Currency name (e.g., 'US Dollar', 'Canadian Dollar')
 */
export function getCurrencyName(countryCode = 'US') {
  const currencyCode = getCurrencyFromCountry(countryCode);
  
  const currencyNames = {
    // Active currencies
    'USD': 'US Dollar',
    'CAD': 'Canadian Dollar',
    
    // Future expansion - add more as needed
    // 'EUR': 'Euro',
    // 'GBP': 'British Pound',
    // 'MXN': 'Mexican Peso',
    // 'AUD': 'Australian Dollar',
  };
  
  return currencyNames[currencyCode] || currencyCode;
}

