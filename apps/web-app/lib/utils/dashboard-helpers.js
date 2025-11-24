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
  const now = new Date();
  const diffTime = now - new Date(date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

/**
 * Get status color for Ant Design Tag
 * @param {string} status - Status string
 * @returns {string} Color name
 */
export function getStatusColor(status) {
  switch (status) {
    case "Completed":
    case "Closed":
      return "success";
    case "In Progress":
      return "processing";
    case "Pending":
      return "warning";
    case "Overdue":
      return "error";
    default:
      return "default";
  }
}

