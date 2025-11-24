/**
 * Unified V2 CRUD Hook
 * 
 * Consolidates all CRUD operations using FastAPI v2 endpoints.
 * Replaces usePinakaCRUD, useCRUD, useCrudHooks for v2 API usage.
 * 
 * @deprecated usePinakaCRUD - Migrate to useV2CRUD
 * @deprecated useCRUD - Migrate to useV2CRUD
 * @deprecated useCrudHooks - Migrate to useV2CRUD
 * 
 * Usage:
 * ```jsx
 * const crud = useV2CRUD({
 *   entityName: 'Property',
 *   apiEndpoint: '/api/v2/properties',
 *   initialData: properties,
 * });
 * 
 * // Create
 * await crud.create({ name: 'New Property' });
 * 
 * // Update
 * await crud.update(id, { name: 'Updated Property' });
 * 
 * // Delete
 * await crud.delete(id);
 * ```
 */

"use client";

import { useState, useCallback } from 'react';
import { v2Api } from '@/lib/api/v2-client';
import { notify } from '@/lib/utils/notification-helper';

export function useV2CRUD({
  entityName = 'Item',
  apiEndpoint,
  initialData = [],
  messages = {},
  defaultFormData = {},
  onBeforeCreate,
  onBeforeUpdate,
  onBeforeDelete,
  onAfterCreate,
  onAfterUpdate,
  onAfterDelete,
  confirmDelete = true,
}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Default messages
  const createSuccess = messages.createSuccess || `${entityName} created successfully`;
  const createError = messages.createError || `Failed to create ${entityName.toLowerCase()}`;
  const updateSuccess = messages.updateSuccess || `${entityName} updated successfully`;
  const updateError = messages.updateError || `Failed to update ${entityName.toLowerCase()}`;
  const deleteSuccess = messages.deleteSuccess || `${entityName} deleted successfully`;
  const deleteError = messages.deleteError || `Failed to delete ${entityName.toLowerCase()}`;
  const loadError = messages.loadError || `Failed to load ${entityName.toLowerCase()}s`;

  // Modal management
  const openAdd = useCallback(() => {
    setIsOpen(true);
    setIsEditing(false);
    setSelectedItem(null);
    setError(null);
  }, []);

  const openEdit = useCallback((item) => {
    setIsOpen(true);
    setIsEditing(true);
    setSelectedItem(item);
    setError(null);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsEditing(false);
    setSelectedItem(null);
    setError(null);
  }, []);

  // Load data - uses fetch directly since v2Api doesn't have generic methods
  const load = useCallback(async () => {
    if (!apiEndpoint) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2'}${apiEndpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${v2Api.getToken()}`,
        },
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const responseData = await response.json();
      setData(Array.isArray(responseData) ? responseData : []);
    } catch (err) {
      setError(err);
      notify.error(loadError);
      console.error(`[useV2CRUD] Error loading ${entityName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, entityName, loadError]);

  // Create - uses fetch directly
  const create = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    
    try {
      let finalPayload = payload;
      if (onBeforeCreate) {
        finalPayload = await onBeforeCreate(payload);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2'}${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${v2Api.getToken()}`,
        },
        body: JSON.stringify(finalPayload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
      
      const created = await response.json();
      
      // Optimistic update
      setData((prev) => [created, ...prev]);
      
      notify.success(createSuccess);
      
      if (onAfterCreate) {
        await onAfterCreate(created);
      }
      
      close();
      return created;
    } catch (err) {
      setError(err);
      notify.error(createError);
      console.error(`[useV2CRUD] Error creating ${entityName}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, entityName, createSuccess, createError, onBeforeCreate, onAfterCreate, close]);

  // Update - uses fetch directly
  const update = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    
    try {
      let finalPayload = payload;
      if (onBeforeUpdate) {
        finalPayload = await onBeforeUpdate(id, payload);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2'}${apiEndpoint}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${v2Api.getToken()}`,
        },
        body: JSON.stringify(finalPayload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
      
      const updated = await response.json();
      
      // Optimistic update
      setData((prev) => 
        prev.map(item => item.id === id ? updated : item)
      );
      
      notify.success(updateSuccess);
      
      if (onAfterUpdate) {
        await onAfterUpdate(updated);
      }
      
      close();
      return updated;
    } catch (err) {
      setError(err);
      notify.error(updateError);
      console.error(`[useV2CRUD] Error updating ${entityName}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, entityName, updateSuccess, updateError, onBeforeUpdate, onAfterUpdate, close]);

  // Delete - uses fetch directly
  const remove = useCallback(async (id) => {
    if (confirmDelete && !window.confirm(`Are you sure you want to delete this ${entityName.toLowerCase()}?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      if (onBeforeDelete) {
        await onBeforeDelete(id);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2'}${apiEndpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${v2Api.getToken()}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
      
      // Optimistic update
      setData((prev) => prev.filter(item => item.id !== id));
      
      notify.success(deleteSuccess);
      
      if (onAfterDelete) {
        await onAfterDelete(id);
      }
    } catch (err) {
      setError(err);
      notify.error(deleteError);
      console.error(`[useV2CRUD] Error deleting ${entityName}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, entityName, deleteSuccess, deleteError, confirmDelete, onBeforeDelete, onAfterDelete]);

  return {
    // Data
    data,
    loading,
    error,
    
    // Modal state
    isOpen,
    isEditing,
    selectedItem,
    
    // Actions
    create,
    update,
    delete: remove,
    load,
    
    // Modal management
    openAdd,
    openEdit,
    close,
    
    // Setters (for external control)
    setData,
    setLoading,
    setError,
  };
}

