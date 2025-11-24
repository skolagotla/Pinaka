/**
 * Import Optimizer Utilities
 * 
 * Provides optimized import patterns and helpers
 * to reduce bundle size and improve tree-shaking
 */

/**
 * Optimized icon imports
 * Use react-icons/hi (Heroicons) for Flowbite-compatible icons
 * 
 * @example
 * // ✅ Good: Import only what you need from react-icons
 * import { HiHome, HiUser, HiSearch } from 'react-icons/hi';
 * 
 * // ✅ Also good: Import from specific icon sets as needed
 * import { FaHome } from 'react-icons/fa'; // Font Awesome
 * import { MdSettings } from 'react-icons/md'; // Material Design
 * 
 * Note: react-icons are tree-shakeable and provide consistent
 * icon styling across the application.
 */

/**
 * Lazy import helper for heavy components
 * @param {Function} importFn - Function that returns import promise
 * @param {Object} options - Dynamic import options
 * @returns {Promise} Component
 */
export function lazyImport(importFn, options = {}) {
  return importFn().then(module => module.default || module);
}

/**
 * Check if import is used (for dead code elimination)
 * @param {any} module - Imported module
 * @returns {boolean} True if module is used
 */
export function isUsed(module) {
  return module !== undefined && module !== null;
}

/**
 * Re-export pattern for better tree-shaking
 * Create index files that re-export only what's needed
 * 
 * @example
 * // lib/utils/index.js
 * export { formatDate } from './date-utils';
 * export { formatCurrency } from './currency-utils';
 * 
 * // Usage
 * import { formatDate, formatCurrency } from '@/lib/utils';
 */

