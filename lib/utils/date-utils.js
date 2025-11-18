/**
 * ═══════════════════════════════════════════════════════════════
 * DATE UTILITIES - DEPRECATED
 * ═══════════════════════════════════════════════════════════════
 * 
 * ⚠️  DEPRECATED: This file is kept for backwards compatibility only.
 * 
 * All date utilities have been consolidated into:
 * - lib/utils/unified-date-formatter.ts (primary source)
 * 
 * Please update imports to use unified-date-formatter.ts instead.
 * 
 * ═══════════════════════════════════════════════════════════════
 */

// Re-export from unified date formatter
const {
  createDateAtLocalMidnight,
  formatDateDisplay,
  formatDateTimeDisplay,
  formatDateForAPI,
  getTodayLocal,
  getDateComponents,
} = require('./unified-date-formatter');

// Legacy function names (for backwards compatibility)
function createLocalDate(year, month, day) {
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

module.exports = {
  // Re-exported from unified formatter
  createDateAtLocalMidnight,
  formatDateDisplay,
  formatDateTimeDisplay,
  formatDateForAPI,
  getTodayLocal,
  getDateComponents,
  
  // Legacy exports (for backwards compatibility)
  createLocalDate,
  
  // Deprecated functions (kept for compatibility)
  createUTCDate: (year, month, day) => {
    console.warn('[date-utils] createUTCDate is deprecated. Use createDateAtLocalMidnight instead.');
    return new Date(Date.UTC(year, month - 1, day));
  },
};
