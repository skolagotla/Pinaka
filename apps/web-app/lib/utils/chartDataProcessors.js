/**
 * Chart Data Processors
 * 
 * Utility functions for transforming data into chart-ready formats
 * Reduces duplicate data processing logic across components
 * 
 * Usage:
 * ```jsx
 * import { processExpensesByCategory, processMonthlyTrend } from '@/lib/utils/chartDataProcessors';
 * 
 * const pieData = processExpensesByCategory(expenses);
 * const trendData = processMonthlyTrend(expenses, 'date', 'amount');
 * ```
 */

import dayjs from 'dayjs';

/**
 * Process expenses into pie chart data by category
 * @param {Array} expenses - Array of expense objects
 * @returns {Array} - Chart-ready data with type and value
 */
export function processExpensesByCategory(expenses) {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return [];
  }

  const expensesByCategory = expenses.reduce((acc, exp) => {
    const category = exp.category || 'Other';
    acc[category] = (acc[category] || 0) + (exp.amount || 0);
    return acc;
  }, {});

  return Object.entries(expensesByCategory).map(([category, amount]) => ({
    type: category,
    value: amount
  }));
}

/**
 * Process data into monthly trend chart data
 * @param {Array} data - Array of data objects
 * @param {string} dateField - Field name containing the date
 * @param {string} amountField - Field name containing the amount
 * @param {string} format - Date format (default: 'MMM YYYY')
 * @returns {Array} - Chart-ready data with month and amount
 */
export function processMonthlyTrend(data, dateField = 'date', amountField = 'amount', format = 'MMM YYYY') {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const monthlyTrend = data.reduce((acc, item) => {
    const date = item[dateField];
    if (!date) return acc;
    
    const month = dayjs(date).format(format);
    if (!acc[month]) acc[month] = 0;
    acc[month] += item[amountField] || 0;
    return acc;
  }, {});

  return Object.entries(monthlyTrend).map(([month, amount]) => ({
    month,
    amount
  }));
}

/**
 * Process income vs expenses data for DualAxes chart
 * @param {Array} trends - Array of trend objects with month, income, expenses
 * @returns {Array} - Chart-ready data
 */
export function processIncomeExpensesTrend(trends) {
  if (!Array.isArray(trends) || trends.length === 0) {
    return [];
  }

  return trends.map(trend => ({
    month: trend.month || '',
    income: trend.income || 0,
    expenses: trend.expenses || 0,
    net: trend.net || (trend.income || 0) - (trend.expenses || 0)
  }));
}

/**
 * Process data into property breakdown chart data
 * @param {Object} breakdown - Object with property names as keys and amounts as values
 * @returns {Array} - Chart-ready data
 */
export function processPropertyBreakdown(breakdown) {
  if (!breakdown || typeof breakdown !== 'object') {
    return [];
  }

  return Object.entries(breakdown)
    .filter(([_, amount]) => typeof amount === 'number' && amount > 0)
    .map(([property, amount]) => ({
      property,
      amount
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Format currency for chart labels
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} - Formatted currency string
 */
/**
 * Format chart currency using rules engine
 * Format: $X,XXX with thousand separator (comma), no decimals for charts
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export function formatChartCurrency(amount, currency = 'USD') {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0';
  }

  // Use rules engine pattern: thousand separator (comma)
  // Charts typically don't show decimals for cleaner display
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true
  });

  return formatter.format(amount);
}

/**
 * Get default chart colors
 * @returns {Object} - Color palette for charts
 */
export function getChartColors() {
  return {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    income: '#3f8600',
    expenses: '#cf1322',
    net: '#1890ff'
  };
}

