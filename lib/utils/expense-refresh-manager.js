/**
 * Expense Refresh Manager
 * 
 * Centralized utility to trigger expense data refreshes across the application
 * when expenses are added, updated, or deleted. This ensures all views stay
 * synchronized with the single source of truth.
 */

/**
 * Broadcast expense update event to all listening components
 * @param {string} eventType - 'added', 'updated', or 'deleted'
 * @param {object} expenseData - The expense data that changed
 */
export function broadcastExpenseUpdate(eventType, expenseData) {
  if (typeof window === 'undefined') return; // Server-side, skip
  
  // Dispatch custom event that components can listen to
  const event = new CustomEvent('expenseUpdated', {
    detail: {
      eventType,
      expense: expenseData,
      timestamp: new Date().toISOString()
    }
  });
  
  window.dispatchEvent(event);
}

/**
 * Hook to listen for expense updates and trigger refresh
 * @param {function} refreshCallback - Function to call when expense is updated
 * @returns {function} Cleanup function to remove event listener
 */
export function useExpenseRefreshListener(refreshCallback) {
  if (typeof window === 'undefined') {
    return () => {}; // Server-side, return no-op
  }

  const handleExpenseUpdate = (event) => {
    if (refreshCallback && typeof refreshCallback === 'function') {
      refreshCallback(event.detail);
    }
  };

  window.addEventListener('expenseUpdated', handleExpenseUpdate);

  // Return cleanup function
  return () => {
    window.removeEventListener('expenseUpdated', handleExpenseUpdate);
  };
}

