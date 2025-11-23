/**
 * Shared Dashboard Helper Functions
 * Common utilities used across landlord and tenant dashboards
 */

/**
 * Convert number to ordinal (1st, 2nd, 3rd, etc.)
 * @param {number} n - Number to convert
 * @returns {string} Ordinal string
 */
export function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Format relative time (e.g., "2h ago", "Yesterday", "3d ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted relative time
 */
export function formatRelativeTime(date) {
  if (!date) return 'N/A';
  
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

/**
 * Get status color for Flowbite Badge
 * @param {string} status - Status string
 * @returns {string} Color name for Flowbite Badge ('success' | 'failure' | 'warning' | 'info' | 'gray')
 */
export function getStatusColor(status) {
  if (!status) return 'gray';
  
  const statusLower = status.toLowerCase();
  
  // Success states
  if (['paid', 'completed', 'active', 'approved', 'rented', 'success'].includes(statusLower)) {
    return 'success';
  }
  
  // Failure/Error states
  if (['overdue', 'cancelled', 'rejected', 'expired', 'error', 'failed'].includes(statusLower)) {
    return 'failure';
  }
  
  // Warning states
  if (['unpaid', 'pending', 'in progress', 'partial', 'vacant', 'warning'].includes(statusLower)) {
    return 'warning';
  }
  
  // Info states
  if (['new', 'processing', 'info'].includes(statusLower)) {
    return 'info';
  }
  
  // Default
  return 'gray';
}

