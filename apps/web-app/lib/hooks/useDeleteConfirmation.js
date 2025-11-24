/**
 * useDeleteConfirmation Hook
 * 
 * Standardized delete operation with confirmation, loading states, and notifications.
 * Reduces boilerplate code for delete operations across the application.
 * 
 * @param {Object} options
 * @param {function} options.onDelete - Delete function (async) that takes an ID
 * @param {string} options.entityName - Name of entity (for messages, default: 'item')
 * @param {function} options.onSuccess - Success callback (receives id)
 * @param {function} options.onError - Error callback (receives error, id)
 * @param {boolean} options.showSuccessMessage - Show success notification (default: true)
 * @param {boolean} options.showErrorMessage - Show error notification (default: true)
 * 
 * @returns {Object} { handleDelete, loading }
 * 
 * @example
 * const { handleDelete, loading } = useDeleteConfirmation({
 *   onDelete: async (id) => {
 *     const response = await fetch(`/api/tenants/${id}`, { method: 'DELETE' });
 *     if (!response.ok) throw new Error('Delete failed');
 *   },
 *   entityName: 'tenant',
 *   onSuccess: () => refresh(),
 * });
 * 
 * // Usage
 * <DeleteConfirmButton
 *   entityName="tenant"
 *   onConfirm={() => handleDelete(tenant.id)}
 * />
 */

import { useCallback } from 'react';
import { useLoading } from './useLoading';
import { notify, notifySuccess, notifyError } from '@/lib/utils/notification-helper';

export function useDeleteConfirmation({
  onDelete,
  entityName = 'item',
  onSuccess,
  onError,
  showSuccessMessage = true,
  showErrorMessage = true,
}) {
  const { loading, withLoading } = useLoading();

  const handleDelete = useCallback(async (id, options = {}) => {
    const {
      successMessage,
      errorMessage,
      showSuccess = showSuccessMessage,
      showError = showErrorMessage,
    } = options;

    try {
      await withLoading(async () => {
        await onDelete(id);
      });

      if (showSuccess) {
        if (successMessage) {
          notify.success(successMessage);
        } else {
          notifySuccess('delete', entityName);
        }
      }

      if (onSuccess) {
        onSuccess(id);
      }
    } catch (error) {
      if (showError) {
        if (errorMessage) {
          notify.error(errorMessage);
        } else {
          notifyError('delete', entityName);
        }
      }

      if (onError) {
        onError(error, id);
      }
      
      // Re-throw error so caller can handle it if needed
      throw error;
    }
  }, [onDelete, entityName, onSuccess, onError, withLoading, showSuccessMessage, showErrorMessage]);

  return {
    handleDelete,
    loading,
  };
}

export default useDeleteConfirmation;
