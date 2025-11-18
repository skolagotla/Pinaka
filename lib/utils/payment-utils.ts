/**
 * Payment Utilities
 * 
 * Centralized utilities for payment calculations
 * Reduces duplication and ensures consistent payment logic
 */

/**
 * Calculate balance from a rent payment and its partial payments
 * @param payment - Rent payment object with partialPayments included
 * @returns Calculated balance (0 if fully paid)
 */
export function calculateBalance(payment: any): number {
  // If payment is marked as paid, balance is 0
  if (payment.status === 'Paid') {
    return 0;
  }

  // Calculate total partial payments
  const totalPartialPaid = (payment.partialPayments || []).reduce(
    (sum: number, pp: any) => sum + (pp.amount || 0),
    0
  );

  // If there are partial payments, calculate remaining balance
  if (totalPartialPaid > 0) {
    return Math.max(0, (payment.amount || 0) - totalPartialPaid);
  }

  // For Unpaid or Overdue status with no partial payments, return full amount
  if (payment.status === 'Unpaid' || payment.status === 'Overdue') {
    return payment.amount || 0;
  }

  // For Partial status, calculate remaining balance
  if (payment.status === 'Partial') {
    return Math.max(0, (payment.amount || 0) - totalPartialPaid);
  }

  return 0;
}

/**
 * Calculate total amount paid (including partial payments)
 * @param payment - Rent payment object with partialPayments included
 * @returns Total amount paid so far
 */
export function calculateTotalPaid(payment: any): number {
  if (payment.status === 'Paid') {
    return payment.amount;
  }

  if (!payment.partialPayments || payment.partialPayments.length === 0) {
    return 0;
  }

  return payment.partialPayments.reduce(
    (sum: number, pp: any) => sum + pp.amount,
    0
  );
}

/**
 * Calculate payment progress percentage
 * @param payment - Rent payment object
 * @returns Percentage paid (0-100)
 */
export function calculatePaymentProgress(payment: any): number {
  if (payment.status === 'Paid') return 100;
  if (payment.status === 'Unpaid') return 0;

  const totalPaid = calculateTotalPaid(payment);
  return Math.round((totalPaid / payment.amount) * 100);
}

/**
 * Check if payment is overdue
 * @param payment - Rent payment object
 * @returns True if payment is overdue
 */
export function isPaymentOverdue(payment: any): boolean {
  if (payment.status === 'Paid') return false;
  
  const now = new Date();
  const dueDate = new Date(payment.dueDate);
  
  return now > dueDate;
}

/**
 * Get days overdue (negative if not yet due)
 * @param payment - Rent payment object
 * @returns Number of days overdue (negative if not yet due)
 */
export function getDaysOverdue(payment: any): number {
  const now = new Date();
  const dueDate = new Date(payment.dueDate);
  
  const diffTime = now.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get payment status color for UI
 * @param payment - Rent payment object
 * @returns Color code for status
 */
export function getPaymentStatusColor(payment: any): string {
  if (payment.status === 'Paid') return '#52c41a'; // green
  if (isPaymentOverdue(payment)) return '#ff4d4f'; // red
  if (payment.status === 'Partial') return '#fa8c16'; // orange
  return '#1890ff'; // blue
}

/**
 * Get payment status tag properties
 * @param payment - Rent payment object
 * @returns Object with color and text for Ant Design Tag
 */
export function getPaymentStatusTag(payment: any): {
  color: string;
  text: string;
} {
  if (payment.status === 'Paid') {
    return { color: 'success', text: 'Paid' };
  }
  
  if (isPaymentOverdue(payment)) {
    const days = getDaysOverdue(payment);
    return { 
      color: 'error', 
      text: `Overdue (${days} day${days !== 1 ? 's' : ''})` 
    };
  }
  
  if (payment.status === 'Partial') {
    const progress = calculatePaymentProgress(payment);
    return { 
      color: 'warning', 
      text: `Partial (${progress}% paid)` 
    };
  }
  
  return { color: 'default', text: 'Unpaid' };
}

/**
 * Format payment amount for display using rules engine
 * Format: $X,XXX.XX with thousand separator (comma)
 * @param amount - Amount to format
 * @param currency - Currency symbol (default: '$')
 * @param country - Country code for locale (default: 'CA')
 * @returns Formatted currency string
 */
export function formatPaymentAmount(amount: number, currency = '$', country = 'CA'): string {
  // Use rules engine pattern: thousand separator (comma) and 2 decimal places
  return `${currency}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  })}`;
}

/**
 * Calculate late fee based on days overdue
 * @param payment - Rent payment object
 * @param lateFeePerDay - Late fee per day (default: 5)
 * @param maxLateFee - Maximum late fee (optional)
 * @returns Calculated late fee amount
 */
export function calculateLateFee(
  payment: any,
  lateFeePerDay = 5,
  maxLateFee?: number
): number {
  const daysOverdue = getDaysOverdue(payment);
  
  if (daysOverdue <= 0) return 0;
  
  let lateFee = daysOverdue * lateFeePerDay;
  
  if (maxLateFee && lateFee > maxLateFee) {
    lateFee = maxLateFee;
  }
  
  return lateFee;
}

/**
 * Get total amount due (including late fees if applicable)
 * @param payment - Rent payment object
 * @param includeLat eFee - Whether to include late fee
 * @param lateFeePerDay - Late fee per day
 * @param maxLateFee - Maximum late fee
 * @returns Total amount due
 */
export function getTotalAmountDue(
  payment: any,
  includeLateFee = true,
  lateFeePerDay = 5,
  maxLateFee?: number
): number {
  const balance = calculateBalance(payment);
  
  if (!includeLateFee) return balance;
  
  const lateFee = calculateLateFee(payment, lateFeePerDay, maxLateFee);
  
  return balance + lateFee;
}

/**
 * Sort payments by priority (overdue first, then by due date)
 * @param payments - Array of payment objects
 * @returns Sorted array of payments
 */
export function sortPaymentsByPriority(payments: any[]): any[] {
  return [...payments].sort((a, b) => {
    const aOverdue = isPaymentOverdue(a);
    const bOverdue = isPaymentOverdue(b);
    
    // Overdue payments first
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    // Then sort by due date
    const aDate = new Date(a.dueDate).getTime();
    const bDate = new Date(b.dueDate).getTime();
    
    return aDate - bDate;
  });
}

/**
 * Get payment summary statistics
 * @param payments - Array of payment objects
 * @returns Summary object with totals
 */
export function getPaymentSummary(payments: any[]): {
  totalDue: number;
  totalPaid: number;
  totalOverdue: number;
  totalPartial: number;
  overdueCount: number;
  partialCount: number;
  paidCount: number;
  unpaidCount: number;
} {
  return payments.reduce(
    (summary, payment) => {
      const balance = calculateBalance(payment);
      const paid = calculateTotalPaid(payment);
      
      if (payment.status === 'Paid') {
        summary.paidCount++;
        summary.totalPaid += paid;
      } else if (isPaymentOverdue(payment)) {
        summary.overdueCount++;
        summary.totalOverdue += balance;
      } else if (payment.status === 'Partial') {
        summary.partialCount++;
        summary.totalPartial += balance;
        summary.totalPaid += paid;
      } else {
        summary.unpaidCount++;
      }
      
      summary.totalDue += payment.amount;
      
      return summary;
    },
    {
      totalDue: 0,
      totalPaid: 0,
      totalOverdue: 0,
      totalPartial: 0,
      overdueCount: 0,
      partialCount: 0,
      paidCount: 0,
      unpaidCount: 0,
    }
  );
}

