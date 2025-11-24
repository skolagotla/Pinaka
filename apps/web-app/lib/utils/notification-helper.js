/**
 * Notification Helper Utility
 * 
 * Centralized notification system for consistent messaging across the application
 * Uses a simple toast implementation compatible with Flowbite
 * 
 * Usage:
 * ```jsx
 * import { notify } from '@/lib/utils/notification-helper';
 * 
 * notify.success('Operation completed successfully');
 * notify.error('Something went wrong');
 * notify.warning('Please check your input');
 * ```
 * 
 * Benefits:
 * - Consistent messaging across the app
 * - Easy to add analytics/logging later
 * - Centralized configuration
 * - Type-safe (if using TypeScript)
 */

// Simple toast implementation using browser notifications or console
// In production, you might want to use react-hot-toast or a custom toast component

/**
 * Default durations (in seconds)
 */
const DEFAULT_DURATIONS = {
  success: 3,
  error: 4, // Longer for errors so users can read them
  warning: 3,
  info: 3,
  loading: 0, // Loading messages don't auto-dismiss
};

// Simple toast queue for browser notifications
let toastQueue = [];
let toastIdCounter = 0;

function showToast(type, content, duration = 3) {
  if (typeof window === 'undefined') {
    // Server-side: just log
    console.log(`[${type.toUpperCase()}] ${content}`);
    return () => {};
  }

  // Client-side: use browser notification or create DOM element
  const id = toastIdCounter++;
  
  // Create a simple toast element
  const toast = document.createElement('div');
  toast.id = `toast-${id}`;
  toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    type === 'warning' ? 'bg-yellow-500 text-white' :
    'bg-blue-500 text-white'
  }`;
  toast.textContent = content;
  
  document.body.appendChild(toast);
  
  // Auto-remove after duration
  let timeoutId;
  if (duration > 0) {
    timeoutId = setTimeout(() => {
      toast.remove();
    }, duration * 1000);
  }
  
  // Return cleanup function
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
    toast.remove();
  };
}

/**
 * Notification helper object
 */
export const notify = {
  /**
   * Show success message
   * @param {string} content - Message content
   * @param {number} duration - Duration in seconds (default: 3)
   */
  success: (content, duration = DEFAULT_DURATIONS.success) => {
    return showToast('success', content, duration);
  },
  
  /**
   * Show error message
   * @param {string} content - Message content
   * @param {number} duration - Duration in seconds (default: 4)
   */
  error: (content, duration = DEFAULT_DURATIONS.error) => {
    return showToast('error', content, duration);
  },
  
  /**
   * Show warning message
   * @param {string} content - Message content
   * @param {number} duration - Duration in seconds (default: 3)
   */
  warning: (content, duration = DEFAULT_DURATIONS.warning) => {
    return showToast('warning', content, duration);
  },
  
  /**
   * Show info message
   * @param {string} content - Message content
   * @param {number} duration - Duration in seconds (default: 3)
   */
  info: (content, duration = DEFAULT_DURATIONS.info) => {
    return showToast('info', content, duration);
  },
  
  /**
   * Show loading message
   * @param {string} content - Message content
   * @param {number} duration - Duration in seconds (default: 0 = no auto-dismiss)
   * @returns {Function} - Function to hide the loading message
   */
  loading: (content, duration = DEFAULT_DURATIONS.loading) => {
    return showToast('info', content, duration);
  },
  
  /**
   * Destroy all messages
   */
  destroy: () => {
    // Remove all toasts
    document.querySelectorAll('[id^="toast-"]').forEach(toast => toast.remove());
    toastQueue = [];
  },
};

/**
 * Common notification messages
 * Use these for consistent messaging across the app
 */
export const commonMessages = {
  // Success messages
  saved: (entityName = 'Item') => `${entityName} saved successfully`,
  created: (entityName = 'Item') => `${entityName} created successfully`,
  updated: (entityName = 'Item') => `${entityName} updated successfully`,
  deleted: (entityName = 'Item') => `${entityName} deleted successfully`,
  
  // Error messages
  saveFailed: (entityName = 'Item') => `Failed to save ${entityName.toLowerCase()}`,
  createFailed: (entityName = 'Item') => `Failed to create ${entityName.toLowerCase()}`,
  updateFailed: (entityName = 'Item') => `Failed to update ${entityName.toLowerCase()}`,
  deleteFailed: (entityName = 'Item') => `Failed to delete ${entityName.toLowerCase()}`,
  loadFailed: (entityName = 'Data') => `Failed to load ${entityName.toLowerCase()}`,
  
  // Warning messages
  unsavedChanges: 'You have unsaved changes',
  confirmDelete: (entityName = 'item') => `Are you sure you want to delete this ${entityName}?`,
  
  // Info messages
  loading: 'Loading...',
  saving: 'Saving...',
  deleting: 'Deleting...',
};

/**
 * Helper function to show success notification with common message
 */
export const notifySuccess = (action, entityName = 'Item') => {
  const messages = {
    save: commonMessages.saved(entityName),
    create: commonMessages.created(entityName),
    update: commonMessages.updated(entityName),
    delete: commonMessages.deleted(entityName),
  };
  notify.success(messages[action] || commonMessages.saved(entityName));
};

/**
 * Helper function to show error notification with common message
 */
export const notifyError = (action, entityName = 'Item') => {
  const messages = {
    save: commonMessages.saveFailed(entityName),
    create: commonMessages.createFailed(entityName),
    update: commonMessages.updateFailed(entityName),
    delete: commonMessages.deleteFailed(entityName),
    load: commonMessages.loadFailed(entityName),
  };
  notify.error(messages[action] || commonMessages.saveFailed(entityName));
};

export default notify;
