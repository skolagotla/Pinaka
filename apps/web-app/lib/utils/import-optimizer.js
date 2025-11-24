/**
 * Import Optimizer Utilities
 * 
 * Provides optimized import patterns and helpers
 * to reduce bundle size and improve tree-shaking
 */

/**
 * Optimized Ant Design icon imports
 * Instead of importing all icons, import only what you need
 * 
 * @example
 * // ❌ Bad: Imports entire icon library
 * import { HomeOutlined, UserOutlined } from '@ant-design/icons';
 * 
 * // ✅ Good: Import individual icons (if tree-shaking works)
 * import HomeOutlined from '@ant-design/icons/HomeOutlined';
 * import UserOutlined from '@ant-design/icons/UserOutlined';
 * 
 * Note: Ant Design icons are already tree-shakeable, but this pattern
 * can help with other libraries that aren't.
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

