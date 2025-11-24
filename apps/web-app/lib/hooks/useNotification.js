/**
 * useNotification Hook
 * 
 * Enhanced notification hook with standardized message formats and auto-dismiss.
 * Now uses the notify helper from notification-helper.js (Flowbite-compatible)
 * 
 * Features:
 * - Standardized message formats
 * - Auto-dismiss timers
 * - Success/error/warning/info variants
 * - Persistent notifications option
 * 
 * @returns {Object} Notification methods
 * 
 * @example
 * const notification = useNotification();
 * 
 * notification.success('User created successfully');
 * notification.error('Failed to save', { duration: 0 }); // Persistent
 */

import { notify } from '@/lib/utils/notification-helper';

const DEFAULT_DURATION = 3; // seconds

export function useNotification() {
  return {
    success: (content, options = {}) => {
      const duration = options.duration ?? DEFAULT_DURATION;
      notify.success(content, duration);
    },
    error: (content, options = {}) => {
      const duration = options.duration ?? DEFAULT_DURATION;
      notify.error(content, duration);
    },
    warning: (content, options = {}) => {
      const duration = options.duration ?? DEFAULT_DURATION;
      notify.warning(content, duration);
    },
    info: (content, options = {}) => {
      const duration = options.duration ?? DEFAULT_DURATION;
      notify.info(content, duration);
    },
    loading: (content, duration = DEFAULT_DURATION) => {
      return notify.loading(content, duration);
    },
  };
}

export default useNotification;
