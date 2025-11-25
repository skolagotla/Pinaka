"use client";

import React, { useRef } from 'react';
import { Modal, Button, Spinner } from 'flowbite-react';
import { HiX } from 'react-icons/hi';
import FocusTrap from '@/components/a11y/FocusTrap';
import { useFocusManagement } from '@/components/a11y/useFocusManagement';

/**
 * StandardModal Component (Flowbite Pro Enhanced)
 * 
 * A standardized modal component for forms and content with Flowbite Pro styling
 */
export default function StandardModal({
  title,
  open,
  onCancel,
  onFinish,
  children,
  loading = false,
  submitText = "Submit",
  cancelText = "Cancel",
  width = 600,
  form,
  submitColor = "blue",
  ...props
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useFocusManagement({ isOpen: open, initialFocus: titleRef });

  const handleSubmit = async () => {
    if (form) {
      try {
        const values = await form.validateFields();
        onFinish?.(values);
      } catch (error) {
        console.error('Form validation failed:', error);
      }
    } else {
      onFinish?.();
    }
  };

  // Determine modal size based on width
  const getModalSize = () => {
    if (width > 1200) return "7xl";
    if (width > 800) return "5xl";
    if (width > 600) return "3xl";
    if (width > 400) return "xl";
    return "md";
  };

  return (
    <Modal
      show={open}
      onClose={onCancel}
      size={getModalSize()}
      className="[&>div]:rounded-lg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      {...props}
    >
      <FocusTrap active={open} onEscape={onCancel}>
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between w-full">
            <h3 
              id="modal-title"
              ref={titleRef}
              className="text-xl font-semibold text-gray-900 dark:text-white"
              tabIndex={-1}
            >
              {title}
            </h3>
            <button
              onClick={onCancel}
              className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Close modal"
            >
              <HiX className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
        </Modal.Header>
      <Modal.Body className="p-6">
        <div className="space-y-4">
          {children}
        </div>
      </Modal.Body>
      <Modal.Footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-end gap-3 w-full">
          <Button 
            color="gray" 
            onClick={onCancel} 
            disabled={loading}
            className="min-w-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={cancelText}
          >
            {cancelText}
          </Button>
          <Button 
            color={submitColor}
            onClick={handleSubmit} 
            disabled={loading}
            className="min-w-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={submitText}
          >
            {loading ? (
              <span className="flex items-center gap-2" aria-live="polite" aria-busy="true">
                <Spinner size="sm" aria-hidden="true" />
                <span className="sr-only">Loading</span>
                Loading...
              </span>
            ) : (
              submitText
            )}
          </Button>
        </div>
      </Modal.Footer>
      </FocusTrap>
    </Modal>
  );
}
