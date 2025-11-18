/**
 * Custom hook for toast notifications
 * Provides a simple toast notification system
 * 
 * @returns {Object} - Toast state and control functions
 */

import { useState, useCallback, useEffect } from 'react';

export function useToast(defaultDuration = 3000) {
  const [toasts, setToasts] = useState([]);

  /**
   * Show a toast notification
   */
  const showToast = useCallback((message, options = {}) => {
    const {
      type = 'info', // success, error, warning, info
      duration = defaultDuration,
      action = null,
    } = options;

    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      action,
    };

    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  }, [defaultDuration]);

  /**
   * Show success toast
   */
  const success = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'success' });
  }, [showToast]);

  /**
   * Show error toast
   */
  const error = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'error' });
  }, [showToast]);

  /**
   * Show warning toast
   */
  const warning = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'warning' });
  }, [showToast]);

  /**
   * Show info toast
   */
  const info = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'info' });
  }, [showToast]);

  /**
   * Dismiss a specific toast
   */
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Clear all toasts
   */
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    // State
    toasts,
    
    // Controls
    showToast,
    success,
    error,
    warning,
    info,
    dismissToast,
    clearAll,
  };
}

/**
 * Simple toast component for quick integration
 * Place this in your app layout or create a proper MUI Snackbar version
 */
export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#323232';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: getTypeColor(toast.type),
            color: 'white',
            padding: '12px 20px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            minWidth: '250px',
            maxWidth: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              marginLeft: '10px',
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

