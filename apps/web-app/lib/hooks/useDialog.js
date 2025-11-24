/**
 * Custom hook for dialog/modal state management
 * Handles open/close state and form modes (add/edit)
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} - Dialog state and control functions
 */

import { useState, useCallback } from 'react';

export function useDialog(options = {}) {
  const {
    onOpen,
    onClose,
    defaultFormData = {},
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);

  /**
   * Open dialog in "add" mode
   */
  const openAdd = useCallback(() => {
    setIsOpen(true);
    setIsEditing(false);
    setSelectedItem(null);
    setFormData(defaultFormData);
    
    if (onOpen) onOpen({ mode: 'add' });
  }, [defaultFormData, onOpen]);

  /**
   * Open dialog in "edit" mode
   */
  const openEdit = useCallback((item) => {
    setIsOpen(true);
    setIsEditing(true);
    setSelectedItem(item);
    setFormData(item);
    
    if (onOpen) onOpen({ mode: 'edit', item });
  }, [onOpen]);

  /**
   * Close dialog and reset state
   */
  const close = useCallback(() => {
    setIsOpen(false);
    setIsEditing(false);
    setSelectedItem(null);
    setFormData(defaultFormData);
    
    if (onClose) onClose();
  }, [defaultFormData, onClose]);

  /**
   * Update form data
   */
  const updateFormData = useCallback((updates) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  /**
   * Handle form field change
   */
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  /**
   * Reset form to default
   */
  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
  }, [defaultFormData]);

  return {
    // State
    isOpen,
    isEditing,
    selectedItem,
    formData,
    
    // Controls
    openAdd,
    openEdit,
    close,
    updateFormData,
    handleFieldChange,
    resetForm,
    setFormData,
  };
}

