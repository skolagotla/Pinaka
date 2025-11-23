"use client";

import { Modal } from 'flowbite-react';
import { notify } from '@/lib/utils/notification-helper';

/**
 * Flowbite Modal Helper
 * 
 * Provides Modal.confirm functionality similar to Ant Design
 * 
 * @param {Object} config - Modal configuration
 * @param {string} config.title - Modal title
 * @param {string|ReactNode} config.content - Modal content
 * @param {string} config.okText - OK button text
 * @param {string} config.cancelText - Cancel button text
 * @param {function} config.onOk - Handler when OK is clicked
 * @param {function} config.onCancel - Handler when Cancel is clicked
 * @param {number} config.width - Modal width
 */
export function modalConfirm(config) {
  const {
    title = "Confirm",
    content,
    okText = "OK",
    cancelText = "Cancel",
    onOk,
    onCancel,
    width = 500,
  } = config;

  // Create a temporary container for the modal
  const container = document.createElement('div');
  document.body.appendChild(container);

  let isOpen = true;

  const handleOk = async () => {
    try {
      if (onOk) {
        await onOk();
      }
    } catch (error) {
      console.error('[Modal.confirm] Error in onOk:', error);
    } finally {
      close();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    close();
  };

  const close = () => {
    isOpen = false;
    // Remove modal from DOM
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  // Note: This is a simplified version. For a full implementation,
  // you'd need to use React's createRoot or render to mount the Modal component.
  // For now, we'll use a simpler approach with window.confirm for basic cases
  // and a custom modal implementation for complex cases.
  
  // For complex content, we'll need to use a state management solution
  // or a global modal manager. For now, this is a placeholder.
  
  if (typeof content === 'string' && !content.includes('<')) {
    // Simple text confirmation - use browser confirm
    const confirmed = window.confirm(`${title}\n\n${content}`);
    if (confirmed && onOk) {
      onOk();
    } else if (!confirmed && onCancel) {
      onCancel();
    }
  } else {
    // Complex content - would need proper React rendering
    // For now, fallback to browser confirm
    const textContent = typeof content === 'string' 
      ? content.replace(/<[^>]*>/g, '') 
      : 'Are you sure?';
    const confirmed = window.confirm(`${title}\n\n${textContent}`);
    if (confirmed && onOk) {
      onOk();
    } else if (!confirmed && onCancel) {
      onCancel();
    }
  }
}

// Export as Modal.confirm for compatibility
export const ModalHelper = {
  confirm: modalConfirm,
};

