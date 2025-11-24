"use client";

/**
 * FormActions Component
 * 
 * Standardized form action buttons (Save/Cancel/Reset) with consistent patterns.
 * 
 * Features:
 * - Standard Save/Cancel/Reset buttons
 * - Loading states
 * - Permission-based visibility
 * - Consistent styling
 * 
 * @param {Object} props
 * @param {function} props.onSave - Save handler
 * @param {function} props.onCancel - Cancel handler
 * @param {function} props.onReset - Reset handler
 * @param {boolean} props.loading - Loading state for save button
 * @param {boolean} props.showCancel - Show cancel button (default: true)
 * @param {boolean} props.showReset - Show reset button (default: false)
 * @param {string} props.saveText - Save button text (default: 'Save')
 * @param {string} props.cancelText - Cancel button text (default: 'Cancel')
 * @param {string} props.resetText - Reset button text (default: 'Reset')
 * @param {boolean} props.canSave - Permission to save (default: true)
 * @param {boolean} props.canCancel - Permission to cancel (default: true)
 * @param {string} props.align - Button alignment: 'left' | 'right' | 'center' (default: 'right')
 * @param {string} props.size - Button size: 'small' | 'middle' | 'large' (default: 'large')
 * 
 * @example
 * <FormActions
 *   onSave={() => form.submit()}
 *   onCancel={() => setModalVisible(false)}
 *   onReset={() => form.resetFields()}
 *   loading={saving}
 *   showReset
 * />
 */

import React from 'react';
import { ActionButton } from './buttons';

export default function FormActions({
  onSave,
  onCancel,
  onReset,
  loading = false,
  showCancel = true,
  showReset = false,
  saveText = 'Save',
  cancelText = 'Cancel',
  resetText = 'Reset',
  canSave = true,
  canCancel = true,
  align = 'right',
  size = 'large',
}) {
  const justifyContent = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align];

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className={`flex items-center gap-3 ${justifyContent}`}>
        {showReset && onReset && (
          <>
            <ActionButton
              action="refresh"
              onClick={onReset}
              disabled={loading}
              size={size}
              tooltip={resetText}
            />
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
          </>
        )}
        {showCancel && onCancel && canCancel && (
          <ActionButton
            action="cancel"
            onClick={onCancel}
            disabled={loading}
            size={size}
            tooltip={cancelText}
          />
        )}
        {onSave && canSave && (
          <ActionButton
            action="save"
            onClick={onSave}
            loading={loading}
            size={size}
            tooltip={saveText}
          />
        )}
      </div>
    </div>
  );
}
