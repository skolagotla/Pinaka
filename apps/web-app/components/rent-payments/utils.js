/**
 * Shared utility functions for rent payment/receipt pages
 * Used by both landlord and tenant sides
 */

/**
 * Format date without timezone conversion
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date as MM/DD/YYYY
 */
export const formatDateLocal = (dateString) => {
  if (!dateString) return "";
  // Extract YYYY-MM-DD directly from ISO string to avoid timezone issues
  const datePart = dateString.split("T")[0];
  const [year, month, day] = datePart.split("-");
  return `${month}/${day}/${year}`; // Format as MM/DD/YYYY
};

/**
 * Get property display name with optional unit
 * @param {Object} payment - Payment/receipt object
 * @param {string} userRole - 'landlord' or 'tenant'
 * @returns {string} Property display string
 */
export const getPropertyDisplay = (payment, userRole) => {
  const property = payment.lease?.unit?.property;
  const unit = payment.lease?.unit;
  
  if (!property) return "Unknown";
  
  const propertyName = property.propertyName || property.addressLine1;
  const unitName = unit?.unitName;
  const hasMultipleUnits = property.unitCount > 1;
  
  if (userRole === 'landlord') {
    // Landlord sees full property - unit display
    return unitName ? `${propertyName} - ${unitName}` : propertyName;
  } else {
    // Tenant sees simplified display
    if (hasMultipleUnits && unitName) {
      return `${propertyName} - ${unitName}`;
    }
    return propertyName;
  }
};

/**
 * Get tenant display name from payment
 * @param {Object} payment - Payment object
 * @returns {string} Tenant name
 */
export const getTenantDisplay = (payment) => {
  const tenant = payment.lease?.leaseTenants?.[0]?.tenant;
  if (!tenant) return "Unknown";
  return `${tenant.firstName} ${tenant.lastName}`;
};

/**
 * Get status chip color based on payment status and balance
 * @param {string} status - Payment status
 * @param {number} balance - Remaining balance
 * @returns {string} MUI color name
 */
export const getStatusColor = (status, balance) => {
  if (balance === 0) return 'success';
  if (status === 'Overdue') return 'error';
  if (status === 'Partial') return 'warning';
  if (status === 'Unpaid') return 'error';
  return 'default';
};

/**
 * Get status label based on balance
 * @param {number} balance - Remaining balance
 * @param {string} status - Payment status
 * @returns {string} Status label
 */
export const getStatusLabel = (balance, status) => {
  if (balance === 0) return 'Paid';
  if (status === 'Overdue') return 'Overdue';
  if (status === 'Partial') return 'Partial';
  return 'Unpaid';
};

/**
 * Check if a payment is fully paid
 * @param {Object} payment - Payment object
 * @returns {boolean} True if fully paid
 */
export const isPaymentPaid = (payment) => {
  return payment.balance === 0 || payment.status === 'Paid';
};

/**
 * Check if a payment is overdue
 * @param {Object} payment - Payment object
 * @returns {boolean} True if overdue
 */
export const isPaymentOverdue = (payment) => {
  if (payment.balance === 0) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(payment.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
};

/**
 * Format receipt number with # prefix
 * @param {string|number} receiptNumber - Receipt number
 * @returns {string} Formatted receipt number
 */
export const formatReceiptNumber = (receiptNumber) => {
  return receiptNumber ? `#${receiptNumber}` : "N/A";
};

