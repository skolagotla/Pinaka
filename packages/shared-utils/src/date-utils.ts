/**
 * Shared Date Utilities
 * 
 * Consolidated date formatting and manipulation utilities
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/**
 * Format date for API (ISO string)
 */
export function formatDateForAPI(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  return dayjs(date).utc().toISOString();
}

/**
 * Format date for display
 */
export function formatDateDisplay(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  return dayjs(date).format('MMM DD, YYYY');
}

/**
 * Format datetime for display
 */
export function formatDateTimeDisplay(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  return dayjs(date).format('MMM DD, YYYY hh:mm A');
}

