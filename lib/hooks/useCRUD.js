/**
 * Custom hook for CRUD operations
 * Provides standardized Create, Read, Update, Delete functionality
 * with loading states, error handling, and optimistic updates
 * 
 * @param {string} apiEndpoint - Base API endpoint (e.g., '/api/properties')
 * @param {Array} initialData - Initial data array
 * @param {Object} options - Configuration options
 * @returns {Object} - CRUD operations and state
 */

import { useState, useCallback } from 'react';
const logger = require('../logger');

export function useCRUD(apiEndpoint, initialData = [], options = {}) {
  const {
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
    onError,
    confirmDelete = true,
    deleteConfirmMessage = (item) => `Are you sure you want to delete this item?`,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a new item
   */
  const create = useCallback(async (payload) => {
    logger.apiCall('POST', apiEndpoint, { payload });
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Failed to create item');
        logger.apiError('POST', apiEndpoint, error);
        throw error;
      }

      const created = await response.json();
      logger.apiResponse('POST', apiEndpoint, response.status, { created });
      
      // Optimistic update: add to beginning of array
      setData((prev) => [created, ...prev]);
      
      if (onCreateSuccess) onCreateSuccess(created);
      
      return { success: true, data: created };
    } catch (err) {
      setError(err.message);
      if (onError) onError(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, onCreateSuccess, onError]);

  /**
   * Update an existing item
   */
  const update = useCallback(async (id, payload) => {
    logger.apiCall('PATCH', `${apiEndpoint}/${id}`, { payload });
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Failed to update item');
        logger.apiError('PATCH', `${apiEndpoint}/${id}`, error);
        throw error;
      }

      const updated = await response.json();
      logger.apiResponse('PATCH', `${apiEndpoint}/${id}`, response.status, { updated });
      
      // Optimistic update: replace in array
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      
      if (onUpdateSuccess) onUpdateSuccess(updated);
      
      return { success: true, data: updated };
    } catch (err) {
      setError(err.message);
      if (onError) onError(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, onUpdateSuccess, onError]);

  /**
   * Delete an item
   */
  const remove = useCallback(async (id, item = null) => {
    // Show confirmation dialog if enabled
    if (confirmDelete) {
      const message = deleteConfirmMessage(item);
      logger.action('Delete confirmation shown', { id, message });
      if (!confirm(message)) {
        logger.action('Delete cancelled by user', { id });
        return { success: false, cancelled: true };
      }
      logger.action('Delete confirmed by user', { id });
    }
    
    logger.apiCall('DELETE', `${apiEndpoint}/${id}`);
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Failed to delete item');
        logger.apiError('DELETE', `${apiEndpoint}/${id}`, error);
        throw error;
      }

      logger.apiResponse('DELETE', `${apiEndpoint}/${id}`, response.status);
      
      // Optimistic update: remove from array
      setData((prev) => prev.filter((item) => item.id !== id));
      
      if (onDeleteSuccess) onDeleteSuccess(id);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      if (onError) onError(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, confirmDelete, deleteConfirmMessage, onDeleteSuccess, onError]);

  /**
   * Refresh data from API
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiEndpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const fetched = await response.json();
      setData(fetched);
      
      return { success: true, data: fetched };
    } catch (err) {
      setError(err.message);
      if (onError) onError(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, onError]);

  /**
   * Set data manually (useful for external updates)
   */
  const setDataManually = useCallback((newData) => {
    setData(newData);
  }, []);

  return {
    // State
    data,
    loading,
    error,
    
    // Operations
    create,
    update,
    remove,
    refresh,
    setData: setDataManually,
  };
}

