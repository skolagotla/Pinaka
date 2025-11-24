/**
 * Shared utility functions for rent payments and receipts
 */

import dayjs from 'dayjs';

/**
 * Calculate cumulative balance owed for a payment
 * This includes ALL unpaid/overdue amounts from lease start until this payment's due date
 * 
 * @param {Object} payment - Current payment record
 * @param {Array} allPayments - All payment records for this lease (optional, for cumulative calculation)
 * @returns {number} Balance remaining
 */
export function calculateBalance(payment, allPayments = null) {
  // If payment is fully paid, return 0
  if (payment.status === 'Paid') return 0;
  
  // Calculate partial payments for this specific payment
  const totalPaid = (payment.partialPayments || []).reduce(
    (sum, pp) => sum + parseFloat(pp.amount || 0),
    0
  );
  
  const thisPaymentBalance = parseFloat(payment.amount || 0) - totalPaid;
  
  // If allPayments array is provided, calculate cumulative balance
  if (allPayments && Array.isArray(allPayments)) {
    // Get all payments for the same lease that are:
    // 1. Due on or before this payment's due date
    // 2. Not fully paid (Unpaid, Overdue, or Partial)
    const unpaidPayments = allPayments.filter(p => {
      if (!p.lease || p.lease.id !== payment.lease?.id) return false;
      if (p.status === 'Paid') return false;
      
      const pDueDate = dayjs(p.dueDate);
      const currentDueDate = dayjs(payment.dueDate);
      
      return pDueDate.isBefore(currentDueDate) || pDueDate.isSame(currentDueDate, 'day');
    });
    
    // Sum up all unpaid balances
    const cumulativeBalance = unpaidPayments.reduce((sum, p) => {
      const paidAmount = (p.partialPayments || []).reduce(
        (s, pp) => s + parseFloat(pp.amount || 0),
        0
      );
      const balance = parseFloat(p.amount || 0) - paidAmount;
      return sum + balance;
    }, 0);
    
    return cumulativeBalance;
  }
  
  // If no allPayments provided, just return this payment's balance
  return thisPaymentBalance;
}

/**
 * Check if partial payment is overdue
 * @param {Object} payment - Payment record
 * @returns {boolean} True if overdue
 */
export function isPartialOverdue(payment) {
  return (
    payment.status === 'Partial' &&
    dayjs().isAfter(dayjs(payment.dueDate))
  );
}

/**
 * Get status color for Ant Design Tag
 * @param {Object} payment - Payment record
 * @returns {string} Color name
 */
export function getPaymentStatusColor(payment) {
  // Check if partial payment is overdue
  if (isPartialOverdue(payment)) {
    return 'error'; // Red
  }
  
  // Default status colors
  switch (payment.status) {
    case 'Paid':
      return 'success'; // Green
    case 'Partial':
      return 'processing'; // Blue
    case 'Unpaid':
      return 'warning'; // Yellow/Orange
    case 'Overdue':
      return 'error'; // Red
    default:
      return 'default'; // Gray
  }
}

/**
 * Get status icon for Ant Design Tag
 * @param {string} status - Payment status
 * @returns {JSX.Element|null} Icon component
 */
export function getPaymentStatusIcon(status) {
  const { 
    CheckCircleOutlined, 
    WarningOutlined, 
    CloseCircleOutlined 
  } = require('@ant-design/icons');
  
  switch (status) {
    case 'Paid':
      return CheckCircleOutlined;
    case 'Overdue':
      return WarningOutlined;
    case 'Unpaid':
      return CloseCircleOutlined;
    default:
      return null;
  }
}

/**
 * Format property display based on unit count
 * @param {Object} lease - Lease object with unit and property
 * @returns {string} Formatted property name
 */
/**
 * Format property display string
 * Rule: If property has only 1 unit, show just property name.
 *       If property has multiple units, show "Unit# - Property Name" (e.g., "1801 Aspen")
 * @param {Object} lease - Lease object with unit and property
 * @returns {string} Formatted property display
 */
export function formatPropertyDisplay(lease) {
  if (!lease?.unit?.property) return '—';
  
  const property = lease.unit.property;
  const propertyName = property.propertyName || property.addressLine1;
  
  // If property has only 1 unit, show just property name
  if (property.unitCount === 1) {
    return propertyName;
  }
  
  // If property has multiple units, show "Unit# - Property Name" (e.g., "1801 Aspen")
  const unitName = lease.unit.unitName || '';
  return `${unitName} - ${propertyName}`;
}

/**
 * Format tenant display
 * @param {Object} lease - Lease object with leaseTenants
 * @returns {string} Tenant full name
 */
export function formatTenantDisplay(lease) {
  if (!lease?.leaseTenants?.[0]?.tenant) return '—';
  
  const tenant = lease.leaseTenants[0].tenant;
  return `${tenant.firstName} ${tenant.lastName}`;
}

/**
 * NOTE: Payment creation logic has been moved to lib/rent-payment-service.js
 * This file only contains UI display helpers for client-side use.
 * 
 * If you need to create missing rent payments, use the server-side service:
 * const { createMissingRentPayments } = require('@/lib/rent-payment-service');
 */

