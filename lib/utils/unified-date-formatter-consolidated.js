/**
 * Unified Date Formatter - Consolidated
 * 
 * This is the SINGLE SOURCE OF TRUTH for all date formatting in the application.
 * All other date formatting utilities should eventually be migrated to use this.
 * 
 * Features:
 * - Consistent date formatting across the app
 * - UTC-safe date handling
 * - Multiple format options
 * - Timezone support
 * - Performance optimized
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Default timezone (can be configured per user)
const DEFAULT_TIMEZONE = 'America/New_York';

/**
 * Format date for display (MM/DD/YYYY)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateDisplay(date) {
  if (!date) return '';
  try {
    return dayjs(date).format('MM/DD/YYYY');
  } catch (error) {
    console.warn('[Date Formatter] Invalid date:', date);
    return '';
  }
}

/**
 * Format date and time for display (MM/DD/YYYY h:mm A)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date-time string
 */
export function formatDateTimeDisplay(date) {
  if (!date) return '';
  try {
    return dayjs(date).format('MM/DD/YYYY h:mm A');
  } catch (error) {
    console.warn('[Date Formatter] Invalid date:', date);
    return '';
  }
}

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string for HTML input[type="date"]
 */
export function formatDateForInput(date) {
  if (!date) return '';
  try {
    return dayjs(date).format('YYYY-MM-DD');
  } catch (error) {
    console.warn('[Date Formatter] Invalid date:', date);
    return '';
  }
}

/**
 * Format date in specific timezone
 * @param {Date|string|number} date - Date to format
 * @param {string} timezone - Timezone (e.g., 'America/New_York')
 * @param {string} format - Format string (default: 'MMM D, YYYY')
 * @returns {string} Formatted date string
 */
export function formatDateInTimezone(date, timezone = DEFAULT_TIMEZONE, format = 'MMM D, YYYY') {
  if (!date) return '';
  try {
    return dayjs(date).tz(timezone).format(format);
  } catch (error) {
    console.warn('[Date Formatter] Invalid date or timezone:', date, timezone);
    return formatDateDisplay(date); // Fallback to default format
  }
}

/**
 * Format datetime in specific timezone
 * @param {Date|string|number} date - Date to format
 * @param {string} timezone - Timezone (e.g., 'America/New_York')
 * @param {string} format - Format string (default: 'MMM D, YYYY h:mm A')
 * @returns {string} Formatted datetime string
 */
export function formatDatetimeInTimezone(date, timezone = DEFAULT_TIMEZONE, format = 'MMM D, YYYY h:mm A') {
  if (!date) return '';
  try {
    return dayjs(date).tz(timezone).format(format);
  } catch (error) {
    console.warn('[Date Formatter] Invalid date or timezone:', date, timezone);
    return formatDateTimeDisplay(date); // Fallback to default format
  }
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  try {
    return dayjs(date).fromNow();
  } catch (error) {
    console.warn('[Date Formatter] Invalid date:', date);
    return '';
  }
}

/**
 * Format date range
 * @param {Date|string|number} startDate - Start date
 * @param {Date|string|number} endDate - End date
 * @returns {string} Formatted date range string
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '';
  try {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    
    if (start.isSame(end, 'day')) {
      return formatDateDisplay(startDate);
    }
    
    if (start.isSame(end, 'month')) {
      return `${start.format('MMM D')} - ${end.format('D, YYYY')}`;
    }
    
    if (start.isSame(end, 'year')) {
      return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
    }
    
    return `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`;
  } catch (error) {
    console.warn('[Date Formatter] Invalid date range:', startDate, endDate);
    return '';
  }
}

/**
 * Parse date string safely
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
export function parseDate(dateString) {
  if (!dateString) return null;
  try {
    const parsed = dayjs(dateString);
    return parsed.isValid() ? parsed.toDate() : null;
  } catch (error) {
    console.warn('[Date Formatter] Failed to parse date:', dateString);
    return null;
  }
}

/**
 * Check if date is valid
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if date is valid
 */
export function isValidDate(date) {
  if (!date) return false;
  try {
    return dayjs(date).isValid();
  } catch (error) {
    return false;
  }
}

/**
 * Get today's date in UTC
 * @returns {Date} Today's date
 */
export function getTodayUTC() {
  return dayjs().utc().toDate();
}

/**
 * Create UTC date from components
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {number} day - Day (1-31)
 * @returns {Date} UTC date
 */
export function createUTCDate(year, month, day) {
  return dayjs.utc([year, month - 1, day]).toDate();
}

/**
 * Get rent due date
 * Rent for month X is due on day Y of month X+1
 * @param {number} year - Year of the rent month
 * @param {number} month - Month of the rent (1-12, 1-indexed)
 * @param {number} dueDay - Day of month rent is due (1-31)
 * @returns {Date} Rent due date (in month X+1)
 */
export function getRentDueDate(year, month, dueDay) {
  // Validate inputs
  if (!year || !month || !dueDay) {
    console.error('[getRentDueDate] Invalid inputs:', { year, month, dueDay });
    return new Date(); // Return today as fallback
  }
  
  // Rent for month X is due on day Y of month X+1
  // If month is December (12), next month is January of next year
  let dueYear = year;
  let dueMonth = month + 1;
  
  if (dueMonth > 12) {
    dueMonth = 1;
    dueYear = year + 1;
  }
  
  // Ensure dueDay is valid for the target month
  const daysInMonth = dayjs([dueYear, dueMonth - 1, 1]).daysInMonth();
  const validDueDay = Math.min(dueDay, daysInMonth);
  
  // Create date in the next month
  const date = dayjs.utc([dueYear, dueMonth - 1, validDueDay]);
  
  if (!date.isValid()) {
    console.error('[getRentDueDate] Invalid date created:', { year, month, dueDay, dueYear, dueMonth, validDueDay });
    return new Date(); // Return today as fallback
  }
  
  return date.toDate();
}

/**
 * Get today's date in local timezone
 * @returns {Date} Today's date
 */
export function getTodayLocal() {
  return dayjs().toDate();
}

/**
 * Create local date from components
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {number} day - Day (1-31)
 * @returns {Date} Local date
 */
export function createLocalDate(year, month, day) {
  return dayjs([year, month - 1, day]).toDate();
}

/**
 * Get number of days in a month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {number} Number of days in the month
 */
export function getDaysInMonth(year, month) {
  return dayjs([year, month - 1, 1]).daysInMonth();
}

/**
 * Get date components (year, month, day)
 * @param {Date|string|number} date - Date to extract components from
 * @returns {object} Object with year, month, day properties
 */
export function getDateComponents(date) {
  const d = dayjs(date);
  return {
    year: d.year(),
    month: d.month() + 1, // dayjs months are 0-indexed, return 1-indexed
    day: d.date(),
  };
}

/**
 * Calculate days between two dates
 * @param {Date|string|number} date1 - First date
 * @param {Date|string|number} date2 - Second date
 * @returns {number} Number of days between dates
 */
export function daysBetween(date1, date2) {
  return dayjs(date2).diff(dayjs(date1), 'day');
}

/**
 * Check if date1 is before date2
 * @param {Date|string|number} date1 - First date
 * @param {Date|string|number} date2 - Second date
 * @returns {boolean} True if date1 is before date2
 */
export function isDateBefore(date1, date2) {
  return dayjs(date1).isBefore(dayjs(date2));
}

/**
 * Check if date1 is after date2
 * @param {Date|string|number} date1 - First date
 * @param {Date|string|number} date2 - Second date
 * @returns {boolean} True if date1 is after date2
 */
export function isDateAfter(date1, date2) {
  return dayjs(date1).isAfter(dayjs(date2));
}

// Export all functions as default object for convenience
export default {
  formatDateDisplay,
  formatDateTimeDisplay,
  formatDateForInput,
  formatDateInTimezone,
  formatDatetimeInTimezone,
  formatRelativeTime,
  formatDateRange,
  parseDate,
  isValidDate,
  getTodayUTC,
  createUTCDate,
  getRentDueDate,
  getTodayLocal,
  createLocalDate,
  getDaysInMonth,
  getDateComponents,
  daysBetween,
  isDateBefore,
  isDateAfter,
};

