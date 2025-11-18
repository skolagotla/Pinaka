/**
 * useModalState Hook
 * 
 * Centralized modal state management with editing item support
 * Reduces repetitive modal open/close code
 * 
 * Usage:
 * ```jsx
 * const { isOpen, open, close, editingItem, setEditingItem, reset } = useModalState();
 * 
 * <Modal open={isOpen} onCancel={close}>
 *   {editingItem && <Form initialValues={editingItem} />}
 * </Modal>
 * 
 * <Button onClick={() => open(item)}>Edit</Button>
 * ```
 */

import { useState, useCallback } from 'react';

export function useModalState({ 
  defaultItem = null,
  onOpen = null,
  onClose = null
} = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(defaultItem);

  /**
   * Open modal with optional item
   */
  const open = useCallback((item = null) => {
    if (item !== null) {
      setEditingItem(item);
    }
    setIsOpen(true);
    if (onOpen) {
      onOpen(item);
    }
  }, [onOpen]);

  /**
   * Close modal and reset editing item
   */
  const close = useCallback(() => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  /**
   * Close and reset editing item
   */
  const reset = useCallback(() => {
    setEditingItem(defaultItem);
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  }, [defaultItem, onClose]);

  /**
   * Set editing item without opening modal
   */
  const setItem = useCallback((item) => {
    setEditingItem(item);
  }, []);

  /**
   * Open modal for editing
   */
  const openForEdit = useCallback((item) => {
    setEditingItem(item);
    setIsOpen(true);
    if (onOpen) {
      onOpen(item);
    }
  }, [onOpen]);

  /**
   * Open modal for creating new item
   */
  const openForCreate = useCallback(() => {
    setEditingItem(defaultItem);
    setIsOpen(true);
    if (onOpen) {
      onOpen(defaultItem);
    }
  }, [defaultItem, onOpen]);

  return {
    isOpen,
    open,
    close,
    reset,
    editingItem,
    setEditingItem: setItem,
    openForEdit,
    openForCreate
  };
}

