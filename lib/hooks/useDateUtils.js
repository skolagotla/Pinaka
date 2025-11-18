"use client";

/**
 * React Hook for Date Utilities
 * 
 * This hook provides easy access to all date utilities in React components.
 * It ensures consistent date handling across the entire application.
 * 
 * @example
 * function MyComponent() {
 *   const { createUTCDate, formatDateDisplay, getTodayUTC } = useDateUtils();
 *   
 *   const today = getTodayUTC();
 *   const leaseStart = createUTCDate(2025, 3, 1);
 *   const display = formatDateDisplay(leaseStart);
 *   
 *   return <div>{display}</div>;
 * }
 */

import { useMemo } from 'react';
import {
  createUTCDate,
  createUTCDateFromString,
  getTodayUTC,
  addMonthsUTC,
  getLastDayOfMonthUTC,
  getDaysInMonth,
  formatDateDisplay,
  formatDateForInput,
  formatDateTimeDisplay,
  compareDates,
  isDateBefore,
  isDateAfter,
  isSameDate,
  getDateComponents,
  daysBetween,
  getMonthName,
  getRentDueDate
} from '../utils/date-utils';

/**
 * Custom hook that provides all date utility functions
 * 
 * Benefits:
 * - Easy access to all date utilities in React components
 * - Memoized for performance
 * - Type-safe (with JSDoc)
 * - Consistent across the app
 * 
 * @returns {Object} Object containing all date utility functions
 */
export function useDateUtils() {
  // Memoize the utilities object to prevent unnecessary re-renders
  const dateUtils = useMemo(() => ({
    // Creating dates
    createUTCDate,
    createUTCDateFromString,
    getTodayUTC,
    
    // Date operations
    addMonthsUTC,
    getLastDayOfMonthUTC,
    getDaysInMonth,
    
    // Formatting
    formatDateDisplay,
    formatDateForInput,
    formatDateTimeDisplay,
    
    // Comparisons
    compareDates,
    isDateBefore,
    isDateAfter,
    isSameDate,
    
    // Utilities
    getDateComponents,
    daysBetween,
    getMonthName,
    
    // Specialized
    getRentDueDate,
  }), []);
  
  return dateUtils;
}

/**
 * Hook for formatting a single date for display
 * Useful when you only need to format dates
 * 
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (MM/DD/YYYY)
 * 
 * @example
 * function DateDisplay({ date }) {
 *   const formattedDate = useDateFormat(date);
 *   return <span>{formattedDate}</span>;
 * }
 */
export function useDateFormat(date) {
  return useMemo(() => formatDateDisplay(date), [date]);
}

/**
 * Hook for comparing dates
 * Returns boolean indicating if date1 is before date2
 * 
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if date1 is before date2
 * 
 * @example
 * function PaymentStatus({ dueDate, paidDate }) {
 *   const isLate = useDateComparison(dueDate, paidDate, 'before');
 *   return <Tag color={isLate ? 'red' : 'green'}>
 *     {isLate ? 'Late' : 'On Time'}
 *   </Tag>;
 * }
 */
export function useDateComparison(date1, date2, type = 'before') {
  return useMemo(() => {
    switch (type) {
      case 'before':
        return isDateBefore(date1, date2);
      case 'after':
        return isDateAfter(date1, date2);
      case 'same':
        return isSameDate(date1, date2);
      default:
        return false;
    }
  }, [date1, date2, type]);
}

/**
 * Hook for getting today's date in UTC
 * Useful for comparisons and displays
 * 
 * @returns {Date} Today's date at midnight UTC
 * 
 * @example
 * function Dashboard() {
 *   const today = useToday();
 *   return <div>Today: {formatDateDisplay(today)}</div>;
 * }
 */
export function useToday() {
  // Don't memoize - we want this to update if component re-renders on a new day
  return getTodayUTC();
}

/**
 * Hook for calculating rent due date
 * 
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {number} dueDay - Day of month rent is due
 * @returns {Date} Rent due date
 * 
 * @example
 * function RentCalculator({ year, month, dueDay }) {
 *   const dueDate = useRentDueDate(year, month, dueDay);
 *   const formatted = formatDateDisplay(dueDate);
 *   return <div>Due: {formatted}</div>;
 * }
 */
export function useRentDueDate(year, month, dueDay) {
  return useMemo(
    () => getRentDueDate(year, month, dueDay),
    [year, month, dueDay]
  );
}

/**
 * Hook for calculating days between two dates
 * 
 * @param {Date|string} date1 - Start date
 * @param {Date|string} date2 - End date
 * @returns {number} Number of days between dates
 * 
 * @example
 * function DaysRemaining({ startDate, endDate }) {
 *   const days = useDaysBetween(startDate, endDate);
 *   return <div>{days} days remaining</div>;
 * }
 */
export function useDaysBetween(date1, date2) {
  return useMemo(() => daysBetween(date1, date2), [date1, date2]);
}

/**
 * Hook for getting month name
 * 
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 * 
 * @example
 * function MonthDisplay({ monthNumber }) {
 *   const monthName = useMonthName(monthNumber);
 *   return <div>{monthName}</div>;
 * }
 */
export function useMonthName(month) {
  return useMemo(() => getMonthName(month), [month]);
}

/**
 * Hook for getting date components (year, month, day)
 * 
 * @param {Date|string} date - Date to extract components from
 * @returns {{year: number, month: number, day: number}} Date components
 * 
 * @example
 * function DateParts({ date }) {
 *   const { year, month, day } = useDateComponents(date);
 *   return <div>{year}-{month}-{day}</div>;
 * }
 */
export function useDateComponents(date) {
  return useMemo(() => getDateComponents(date), [date]);
}

// Default export for convenience
export default useDateUtils;

