/**
 * Custom hook for confirmation dialogs
 * Provides a reusable confirmation dialog with customizable messages
 * 
 * @returns {Object} - Confirmation dialog state and control functions
 */

import { useState, useCallback } from 'react';

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
    variant: 'default', // default, danger, warning, info
  });

  /**
   * Show confirmation dialog
   */
  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setConfig({
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure you want to proceed?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'default',
        onConfirm: () => {
          setIsOpen(false);
          if (options.onConfirm) options.onConfirm();
          resolve(true);
        },
        onCancel: () => {
          setIsOpen(false);
          if (options.onCancel) options.onCancel();
          resolve(false);
        },
      });
      setIsOpen(true);
    });
  }, []);

  /**
   * Confirm with native browser dialog (simple fallback)
   */
  const confirmNative = useCallback((message) => {
    return window.confirm(message);
  }, []);

  /**
   * Close dialog
   */
  const close = useCallback(() => {
    setIsOpen(false);
    if (config.onCancel) config.onCancel();
  }, [config]);

  /**
   * Handle confirm action
   */
  const handleConfirm = useCallback(() => {
    if (config.onConfirm) config.onConfirm();
    setIsOpen(false);
  }, [config]);

  /**
   * Handle cancel action
   */
  const handleCancel = useCallback(() => {
    if (config.onCancel) config.onCancel();
    setIsOpen(false);
  }, [config]);

  return {
    // State
    isOpen,
    config,
    
    // Controls
    confirm,
    confirmNative,
    close,
    handleConfirm,
    handleCancel,
  };
}

