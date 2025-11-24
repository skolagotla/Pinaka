/**
 * ═══════════════════════════════════════════════════════════════
 * UNIFIED DATE FORMATTER
 * ═══════════════════════════════════════════════════════════════
 * 
 * Single source of truth for all date formatting
 * Consolidates: safe-date-formatter.js, date-utils.js, date-formatters.ts, timezone-utils.js
 * 
 * ⚠️  CRITICAL: Uses LOCAL timezone for date-only fields to prevent timezone shifts
 * 
 * ═══════════════════════════════════════════════════════════════
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// Import DEFAULT_TIMEZONE if available, otherwise use default
let DEFAULT_TIMEZONE = 'America/Toronto';
try {
  const timezoneConstants = require('../constants/timezones');
  if (timezoneConstants?.DEFAULT_TIMEZONE) {
    DEFAULT_TIMEZONE = timezoneConstants.DEFAULT_TIMEZONE;
  }
} catch (e) {
  // Use default if constants file doesn't exist
}

/**
 * Format date for display (e.g., "Nov 1, 2024")
 * Uses LOCAL date components to preserve the date as stored
 * 
 * @param date - Date to format (Date, string, or null)
 * @returns Formatted date string or '-' if null/undefined
 */
export function formatDateDisplay(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    // If it's already a string in YYYY-MM-DD format, parse it directly
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      const [year, month, day] = date.split('T')[0].split('-').map(Number);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[month - 1]} ${day}, ${year}`;
    }
    
    const d = new Date(date);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Use LOCAL date methods to preserve the date as stored
    return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } catch (error) {
    console.error('[Date Formatter] Error:', error);
    return '-';
  }
}

/**
 * Format date with time (e.g., "Nov 1, 2024 2:30 PM")
 * 
 * @param date - Date to format
 * @param separator - Separator between date and time (default: ' ')
 * @param userTimezone - Optional timezone (e.g., 'America/Toronto')
 * @returns Formatted date/time string or '-' if null/undefined
 */
export function formatDateTimeDisplay(
  date: string | Date | null | undefined,
  separator: string = ' ',
  userTimezone?: string
): string {
  if (!date) return '-';
  
  try {
    if (userTimezone) {
      return dayjs(date).tz(userTimezone).format(`MMM D, YYYY${separator}h:mm A`);
    }
    return dayjs(date).format(`MMM D, YYYY${separator}h:mm A`);
  } catch (error) {
    console.error('[Date Formatter] Error:', error);
    return '-';
  }
}

/**
 * Format date for API/database (e.g., "2024-11-01")
 * 
 * @param date - Date to format (Date, dayjs object, or string)
 * @returns ISO date string (YYYY-MM-DD) or null
 */
export function formatDateForAPI(date: any): string | null {
  if (!date) return null;
  
  try {
    // If it's already a string in YYYY-MM-DD format, return as-is
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      return date.split('T')[0];
    }
    
    // Use dayjs for consistent formatting
    const d = dayjs(date);
    if (!d.isValid()) return null;
    
    // Extract LOCAL date components to prevent timezone shifts
    const year = d.year();
    const month = d.month() + 1; // dayjs months are 0-indexed
    const day = d.date();
    
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  } catch (error) {
    console.error('[Date Formatter] Error:', error);
    return null;
  }
}

/**
 * Create a date at local midnight from a date string
 * Prevents timezone shifts when storing dates
 * 
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object at local midnight
 */
export function createDateAtLocalMidnight(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Create date at LOCAL midnight (not UTC) to preserve the date
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Format date for table display (short format)
 */
export function formatDateForTable(date: string | Date | null | undefined): string {
  return formatDateDisplay(date);
}

/**
 * Format date as short format (e.g., "11/01/2024")
 */
export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  } catch (error) {
    return '-';
  }
}

/**
 * Format date as month and year (e.g., "November 2024")
 */
export function formatDateMonthYear(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    const d = new Date(date);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  } catch (error) {
    return '-';
  }
}

/**
 * Format time only (e.g., "2:30 PM")
 */
export function formatTimeOnly(date: string | Date | null | undefined, userTimezone?: string): string {
  if (!date) return '-';
  
  try {
    if (userTimezone) {
      return dayjs(date).tz(userTimezone).format('h:mm A');
    }
    return dayjs(date).format('h:mm A');
  } catch (error) {
    return '-';
  }
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    return dayjs(date).fromNow();
  } catch (error) {
    return '-';
  }
}

/**
 * Format date range (e.g., "Nov 1 - Dec 31, 2024")
 */
export function formatDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): string {
  if (!startDate || !endDate) return '-';
  
  try {
    const start = formatDateDisplay(startDate);
    const end = formatDateDisplay(endDate);
    
    // If same year, show: "Nov 1 - Dec 31, 2024"
    // If different years, show: "Nov 1, 2024 - Jan 15, 2025"
    return `${start} - ${end}`;
  } catch (error) {
    return '-';
  }
}

/**
 * Format date in specific timezone
 */
export function formatDateInTimezone(
  date: string | Date | null | undefined,
  userTimezone: string = 'America/Toronto',
  format: string = 'MMM D, YYYY'
): string {
  if (!date) return '—';
  try {
    return dayjs(date).tz(userTimezone).format(format);
  } catch (error) {
    return '—';
  }
}

/**
 * Format datetime in specific timezone
 */
export function formatDatetimeInTimezone(
  date: string | Date | null | undefined,
  userTimezone: string = 'America/Toronto',
  format: string = 'MMM D, YYYY h:mm A'
): string {
  if (!date) return '—';
  try {
    return dayjs(date).tz(userTimezone).format(format);
  } catch (error) {
    return '—';
  }
}

/**
 * Get today's date at local midnight
 */
export function getTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Get date components (year, month, day) from a date
 */
export function getDateComponents(date: string | Date): { year: number; month: number; day: number } {
  const d = new Date(date);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1, // 1-indexed
    day: d.getDate(),
  };
}

// Export all functions as default object for convenience
export default {
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
  formatDateInTimezone,
  formatDatetimeInTimezone,
  getTodayLocal,
  getDateComponents,
};

// CommonJS exports for require() compatibility
if (typeof module !== 'undefined' && module.exports) {
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
    formatDateInTimezone,
    formatDatetimeInTimezone,
    getTodayLocal,
    getDateComponents,
    DEFAULT_TIMEZONE,
  };
}

