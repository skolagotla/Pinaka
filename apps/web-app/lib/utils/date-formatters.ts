/**
 * ═══════════════════════════════════════════════════════════════
 * DATE FORMATTERS - DEPRECATED
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

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// Re-export from unified formatter
import {
  formatDateDisplay,
  formatDateTimeDisplay,
  formatDateForAPI,
  formatRelativeTime,
  formatDateRange as formatDateRangeUnified,
  formatDateInTimezone,
  formatDatetimeInTimezone,
  formatTimeOnly,
} from './unified-date-formatter';

// Re-export formatDateRange for backwards compatibility
export { formatDateRangeUnified as formatDateRange };

// Legacy formatDate object (for backwards compatibility)
// Legacy formatDate object (for backwards compatibility)
export const formatDate = {
  /**
   * Format as "Nov 3, 2025 1:40 PM"
   * @deprecated Use formatDateTimeDisplay from unified-date-formatter.ts
   */
  datetime: (date: string | Date | null | undefined, userTimezone?: string): string | null => {
    const result = formatDateTimeDisplay(date, ' ', userTimezone);
    return result === '-' ? null : result;
  },

  /**
   * Format as "Nov 3, 2025"
   * @deprecated Use formatDateDisplay from unified-date-formatter.ts
   */
  date: (date: string | Date | null | undefined, userTimezone?: string): string | null => {
    if (userTimezone) {
      const result = formatDateInTimezone(date, userTimezone, 'MMM D, YYYY');
      return result === '—' ? null : result;
    }
    const result = formatDateDisplay(date);
    return result === '-' ? null : result;
  },

  /**
   * Format as "November 3, 2025"
   * Use for formal display
   * @param date - Date to format
   * @param userTimezone - Optional timezone (e.g., 'America/Toronto')
   */
  dateLong: (date: string | Date | null | undefined, userTimezone?: string): string | null => {
    if (!date) return null;
    if (userTimezone) {
      return dayjs(date).tz(userTimezone).format('MMMM D, YYYY');
    }
    return dayjs(date).format('MMMM D, YYYY');
  },

  /**
   * Format as "2025-11-03"
   * Use for API payloads and database operations
   * Note: ISO dates are always in UTC for consistency
   */
  iso: (date: string | Date | null | undefined): string | null => {
    if (!date) return null;
    return dayjs(date).format('YYYY-MM-DD');
  },

  /**
   * Format as "2 minutes ago", "3 days ago", etc.
   * Use for recent activity timestamps
   * @param date - Date to format
   * @param userTimezone - Optional timezone (e.g., 'America/Toronto')
   */
  relative: (date: string | Date | null | undefined, userTimezone?: string): string | null => {
    if (!date) return null;
    if (userTimezone) {
      return dayjs(date).tz(userTimezone).fromNow();
    }
    return dayjs(date).fromNow();
  },

  /**
   * Format as "Nov 3"
   * Use for compact display (current year)
   * @param date - Date to format
   * @param userTimezone - Optional timezone (e.g., 'America/Toronto')
   */
  short: (date: string | Date | null | undefined, userTimezone?: string): string | null => {
    if (!date) return null;
    if (userTimezone) {
      return dayjs(date).tz(userTimezone).format('MMM D');
    }
    return dayjs(date).format('MMM D');
  },

  /**
   * Format as "11/03/2025"
   * Use for numerical date display
   * @param date - Date to format
   * @param userTimezone - Optional timezone (e.g., 'America/Toronto')
   */
  numeric: (date: string | Date | null | undefined, userTimezone?: string): string | null => {
    if (!date) return null;
    if (userTimezone) {
      return dayjs(date).tz(userTimezone).format('MM/DD/YYYY');
    }
    return dayjs(date).format('MM/DD/YYYY');
  },

  /**
   * Get expiration status with color coding
   * Returns status object for use with Tags or styling
   */
  expirationStatus: (date: string | Date | null | undefined) => {
    if (!date) return null;
    
    const daysUntil = dayjs(date).diff(dayjs(), 'day');
    
    if (daysUntil < 0) {
      return { 
        status: 'expired', 
        color: '#ff4d4f', 
        tagColor: 'error',
        text: 'Expired', 
        daysRemaining: 0 
      };
    } else if (daysUntil === 0) {
      return { 
        status: 'today', 
        color: '#ff4d4f', 
        tagColor: 'error',
        text: 'Expires Today', 
        daysRemaining: 0 
      };
    } else if (daysUntil <= 7) {
      return { 
        status: 'urgent', 
        color: '#ff4d4f', 
        tagColor: 'error',
        text: 'Urgent', 
        daysRemaining: daysUntil 
      };
    } else if (daysUntil <= 30) {
      return { 
        status: 'warning', 
        color: '#fa8c16', 
        tagColor: 'warning',
        text: 'Expiring Soon', 
        daysRemaining: daysUntil 
      };
    }
    
    return { 
      status: 'valid', 
      color: '#52c41a', 
      tagColor: 'success',
      text: 'Valid', 
      daysRemaining: daysUntil 
    };
  },

  /**
   * Check if a date is in the past
   */
  isPast: (date: string | Date | null | undefined): boolean => {
    if (!date) return false;
    return dayjs(date).isBefore(dayjs(), 'day');
  },

  /**
   * Check if a date is today
   */
  isToday: (date: string | Date | null | undefined): boolean => {
    if (!date) return false;
    return dayjs(date).isSame(dayjs(), 'day');
  },

  /**
   * Get number of days between two dates
   */
  daysBetween: (startDate: string | Date, endDate: string | Date): number => {
    return dayjs(endDate).diff(dayjs(startDate), 'day');
  },

  /**
   * Get number of days until a date
   */
  daysUntil: (date: string | Date | null | undefined): number | null => {
    if (!date) return null;
    return dayjs(date).diff(dayjs(), 'day');
  },

  /**
   * Add days to a date and return formatted
   */
  addDays: (date: string | Date, days: number): Date => {
    return dayjs(date).add(days, 'day').toDate();
  },

  /**
   * Subtract days from a date and return formatted
   */
  subtractDays: (date: string | Date, days: number): Date => {
    return dayjs(date).subtract(days, 'day').toDate();
  },

  /**
   * Convert to dayjs object for custom operations
   */
  toDayjs: (date: string | Date | null | undefined) => {
    if (!date) return null;
    return dayjs(date);
  },
};

/**
 * React hook for date formatting
 * Use in components for easier access
 */
export function useDateFormat() {
  return formatDate;
}

// formatDateRange is already re-exported above from unified-date-formatter

/**
 * Get current date/time in user's timezone
 */
export function nowInTimezone(userTimezone?: string) {
  const tz = userTimezone || 'America/Toronto';
  return dayjs().tz(tz);
}

/**
 * Convert a date to user's timezone (returns dayjs object)
 */
export function toTimezone(date: string | Date, userTimezone?: string) {
  const tz = userTimezone || 'America/Toronto';
  return dayjs(date).tz(tz);
}

/**
 * Check if a date is today in user's timezone
 */
export function isTodayInTimezone(date: string | Date, userTimezone?: string): boolean {
  const tz = userTimezone || 'America/Toronto';
  const today = dayjs().tz(tz).startOf('day');
  const checkDate = dayjs(date).tz(tz).startOf('day');
  return today.isSame(checkDate);
}

/**
 * Check if a date is overdue in user's timezone
 */
export function isOverdue(dueDate: string | Date, userTimezone?: string): boolean {
  const tz = userTimezone || 'America/Toronto';
  const now = dayjs().tz(tz);
  const due = dayjs(dueDate).tz(tz);
  return now.isAfter(due);
}

/**
 * Get start of day in user's timezone
 */
export function startOfDay(date: string | Date, userTimezone?: string): Date {
  const tz = userTimezone || 'America/Toronto';
  return dayjs(date).tz(tz).startOf('day').toDate();
}

/**
 * Get end of day in user's timezone
 */
export function endOfDay(date: string | Date, userTimezone?: string): Date {
  const tz = userTimezone || 'America/Toronto';
  return dayjs(date).tz(tz).endOf('day').toDate();
}

/**
 * Parse a date string in user's timezone
 */
export function parseDateInTimezone(dateString: string, userTimezone?: string): Date {
  const tz = userTimezone || 'America/Toronto';
  return dayjs.tz(dateString, tz).toDate();
}

/**
 * Get timezone abbreviation (e.g., "EST", "PST")
 */
export function getTimezoneAbbreviation(timezone?: string): string {
  const tz = timezone || 'America/Toronto';
  try {
    const date = new Date();
    const formatted = date.toLocaleString('en-US', { 
      timeZone: tz, 
      timeZoneName: 'short' 
    });
    const parts = formatted.split(' ');
    return parts[parts.length - 1];
  } catch (error) {
    return tz;
  }
}

/**
 * Format time only (e.g., "1:40 PM")
 */
export function formatTime(date: string | Date | null | undefined, userTimezone?: string): string | null {
  if (!date) return null;
  if (userTimezone) {
    return dayjs(date).tz(userTimezone).format('h:mm A');
  }
  return dayjs(date).format('h:mm A');
}

export default formatDate;

