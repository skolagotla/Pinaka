"use client";

import React from 'react';
import { Modal, Button, Spinner } from 'flowbite-react';
import { HiX } from 'react-icons/hi';

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
      {...props}
    >
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onCancel}
            className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white transition-colors"
          >
            <HiX className="h-5 w-5" />
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
            className="min-w-[100px]"
          >
            {cancelText}
          </Button>
          <Button 
            color={submitColor}
            onClick={handleSubmit} 
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Loading...
              </span>
            ) : (
              submitText
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
