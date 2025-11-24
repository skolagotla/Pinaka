/**
 * API Keys Management - Backward Compatibility Wrapper
 * 
 * This module provides backward compatibility for the deprecated api-keys.js file.
 * All functionality has been moved to app-config.js, which is the single source of truth.
 * 
 * This file re-exports from app-config.js to maintain compatibility with any code
 * that might still reference the old api-keys.js module.
 * 
 * ⚠️  DEPRECATED: Use app-config.js directly instead
 * 
 * Migration Guide:
 *   OLD: import { getRadarApiKey } from '@/lib/config/api-keys';
 *   NEW: import config from '@/lib/config/app-config';
 *        const radarKey = config.apiKeys.radar;
 * 
 *   OLD: import { getAllApiKeys } from '@/lib/config/api-keys';
 *   NEW: import config from '@/lib/config/app-config';
 *        const allKeys = { radar: config.apiKeys.radar };
 */

import config from './app-config';

/**
 * Get Radar API publishable key
 * @deprecated Use config.apiKeys.radar instead
 * @returns {string|null} Radar API key or null if not found
 */
export function getRadarApiKey() {
  return config.apiKeys.radar;
}

/**
 * Get all API keys (for admin/debugging purposes)
 * @deprecated Use config.apiKeys directly instead
 * @returns {Object} Object containing all API keys
 */
export function getAllApiKeys() {
  return {
    radar: config.apiKeys.radar,
  };
}

/**
 * Check if Radar API is configured
 * @deprecated Use config.apiKeys.radar !== null instead
 * @returns {boolean} True if Radar API key is available
 */
export function isRadarApiConfigured() {
  return config.apiKeys.radar !== null;
}

/**
 * Set Radar API key in localStorage (for development/testing)
 * @deprecated This functionality is handled automatically by app-config.js
 * @param {string} key - Radar API key
 */
export function setRadarApiKey(key) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('radar_api_key', key);
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  api-keys.js is deprecated. Use app-config.js instead.');
      console.log('✅ Radar API key saved to localStorage');
    }
  } else {
    console.warn('⚠️  Cannot set localStorage on server-side');
  }
}

/**
 * Clear Radar API key from localStorage
 * @deprecated This functionality is handled automatically by app-config.js
 */
export function clearRadarApiKey() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('radar_api_key');
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  api-keys.js is deprecated. Use app-config.js instead.');
      console.log('✅ Radar API key cleared from localStorage');
    }
  }
}

// Re-export the config object for convenience
export default config;

