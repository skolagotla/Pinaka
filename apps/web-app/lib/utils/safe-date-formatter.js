/**
 * ═══════════════════════════════════════════════════════════════
 * SAFE DATE FORMATTER - DEPRECATED
 * ═══════════════════════════════════════════════════════════════
 * 
 * ⚠️  DEPRECATED: This file is kept for backwards compatibility only.
 * 
 * All date formatting functions have been consolidated into:
 * - lib/utils/unified-date-formatter.ts (primary source)
 * 
 * Please update imports to use unified-date-formatter.ts instead.
 * 
 * ═══════════════════════════════════════════════════════════════
 */

// Re-export from unified date formatter
const {
  formatDateDisplay,
  formatDateTimeDisplay,
  formatDateForAPI,
  createDateAtLocalMidnight,
  formatDateForTable,
  formatDateShort,
  formatDateMonthYear,
  formatTimeOnly,
  formatRelativeTime,
  formatDateRange,
} = require('./unified-date-formatter');

module.exports = {
  formatDateDisplay,
  formatDateTimeDisplay,
  formatDateForAPI,
  createDateAtLocalMidnight,
  formatDateForTable,
  formatDateShort,
  formatDateMonthYear,
  formatTimeOnly,
  formatRelativeTime,
  formatDateRange,
};
