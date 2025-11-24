/**
 * 🎯 PINAKA CRUD HOOK V1 - v1 API Compatible Version
 * 
 * Enhanced version of usePinakaCRUD that supports v1 APIs
 * Automatically handles v1 response format and schema validation
 * 
 * @example
 * const pinaka = usePinakaCRUDV1({
 *   domain: 'properties', // Uses v1Api.properties
 *   initialData: properties,
 *   entityName: 'Property',
 * });
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Space } from 'antd';
import { ActionButton } from '@/components/shared/buttons';
import { useMessage } from './useMessage';
import { v1Api } from '@/lib/api/v1-client';
const logger = require('../logger');

export function usePinakaCRUDV1({
  domain, // Domain name: 'properties', 'tenants', etc.
  initialData = [],
  entityName = 'Item',
  messages = {},
  defaultFormData = {},
  onBeforeCreate,
  onBeforeUpdate,
  onBeforeDelete,
  onAfterCreate,
  onAfterUpdate,
  onAfterDelete,
  confirmDelete = true,
  useV1Api = true, // Use v1Api by default
}) {
  const message = useMessage();

  const {
    createSuccess = `${entityName} created successfully`,
    updateSuccess = `${entityName} updated successfully`,
    deleteSuccess = `${entityName} deleted successfully`,
    createError = `Failed to create ${entityName.toLowerCase()}`,
    updateError = `Failed to update ${entityName.toLowerCase()}`,
    deleteError = `Failed to delete ${entityName.toLowerCase()}`,
  } = messages;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const refreshRef = useRef(null);

  // Get v1Api resource
  const getResource = () => {
    const resourceMap = {
      properties: v1Api.properties,
      tenants: v1Api.tenants,
      leases: v1Api.leases,
      rentPayments: v1Api.rentPayments,
      maintenance: v1Api.maintenance,
      documents: v1Api.documents,
      expenses: v1Api.expenses,
      inspections: v1Api.inspections,
      vendors: v1Api.vendors,
      conversations: v1Api.conversations,
      applications: v1Api.applications,
      notifications: v1Api.notifications,
      tasks: v1Api.tasks,
      invitations: v1Api.invitations,
    };
    return resourceMap[domain];
  };

  const openAdd = useCallback(() => {
    logger.action('Opening add dialog', { entityName });
    setIsOpen(true);
    setIsEditing(false);
    setSelectedItem(null);
  }, [entityName]);

  const openEdit = useCallback((item) => {
    logger.action('Opening edit dialog', { entityName, itemId: item?.id });
    setIsOpen(true);
    setIsEditing(true);
    setSelectedItem(item);
  }, [entityName]);

  const close = useCallback(() => {
    logger.action('Closing dialog', { entityName });
    setIsOpen(false);
    setIsEditing(false);
    setSelectedItem(null);
    setError(null);
  }, [entityName]);

  const create = useCallback(async (payload) => {
    logger.apiCall('POST', `/api/v1/${domain}`, { payload });
    setLoading(true);
    setError(null);
    
    try {
      let finalPayload = payload;
      if (onBeforeCreate) {
        finalPayload = await onBeforeCreate(payload);
      }

      const resource = getResource();
      const response = await resource.create(finalPayload);
      
      // v1 API returns { success: true, data: {...} }
      const created = response.data || response;
      
      logger.apiResponse('POST', `/api/v1/${domain}`, 201, { created });
      
      setData((prev) => [created, ...prev]);
      message.success(createSuccess);
      
      if (onAfterCreate) {
        await onAfterCreate(created);
      }
      
      return { success: true, data: created };
    } catch (err) {
      const errorMsg = err.message || createError;
      setError(errorMsg);
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [domain, createSuccess, createError, message, onBeforeCreate, onAfterCreate]);

  const update = useCallback(async (id, payload) => {
    logger.apiCall('PATCH', `/api/v1/${domain}/${id}`, { payload });
    setLoading(true);
    setError(null);
    
    try {
      let finalPayload = payload;
      if (onBeforeUpdate) {
        finalPayload = await onBeforeUpdate(id, payload);
      }

      const resource = getResource();
      const response = await resource.update(id, finalPayload);
      
      // v1 API returns { success: true, data: {...} }
      const updated = response.data || response;
      
      logger.apiResponse('PATCH', `/api/v1/${domain}/${id}`, 200, { updated });
      
      setData((prev) => {
        const existing = prev.find((item) => item.id === id);
        const merged = existing ? { ...existing, ...updated } : updated;
        return prev.map((item) => (item.id === id ? merged : item));
      });
      
      message.success(updateSuccess);
      
      if (refreshRef.current) {
        try {
          await refreshRef.current();
        } catch (refreshError) {
          console.warn('Failed to refresh after update:', refreshError);
        }
      }
      
      if (onAfterUpdate) {
        await onAfterUpdate(updated);
      }
      
      return { success: true, data: updated };
    } catch (err) {
      const errorMsg = err.message || updateError;
      setError(errorMsg);
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [domain, updateSuccess, updateError, message, onBeforeUpdate, onAfterUpdate]);

  const remove = useCallback(async (id, item = null) => {
    if (confirmDelete) {
      logger.action('Delete confirmation shown', { id, entityName });
    }
    
    logger.apiCall('DELETE', `/api/v1/${domain}/${id}`);
    setLoading(true);
    setError(null);
    
    try {
      if (onBeforeDelete) {
        const shouldContinue = await onBeforeDelete(id, item);
        if (shouldContinue === false) {
          logger.action('Delete cancelled by pre-hook', { id });
          return { success: false, cancelled: true };
        }
      }

      const resource = getResource();
      await resource.delete(id);
      
      logger.apiResponse('DELETE', `/api/v1/${domain}/${id}`, 204);
      
      setData((prev) => prev.filter((item) => item.id !== id));
      message.success(deleteSuccess);
      
      if (onAfterDelete) {
        await onAfterDelete(id);
      }
      
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || deleteError;
      setError(errorMsg);
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [domain, deleteSuccess, deleteError, message, confirmDelete, onBeforeDelete, onAfterDelete, entityName]);

  const refresh = useCallback(async (query = {}) => {
    logger.apiCall('GET', `/api/v1/${domain}`, { query });
    setLoading(true);
    setError(null);
    
    try {
      const resource = getResource();
      const response = await resource.list(query);
      
      // v1 API returns { success: true, data: { data: [...], pagination: {...} } }
      const fetched = response.data?.data || response.data || [];
      
      logger.apiResponse('GET', `/api/v1/${domain}`, 200, { count: fetched.length });
      setData(fetched);
      
      if (selectedItem && Array.isArray(fetched)) {
        const updatedItem = fetched.find(item => item.id === selectedItem.id);
        if (updatedItem) {
          setSelectedItem(updatedItem);
          logger.info('Updated selectedItem after refresh', { itemId: updatedItem.id });
        }
      }
      
      return { success: true, data: fetched };
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch data';
      setError(errorMsg);
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [domain, message, selectedItem]);

  // Store refresh function in ref
  refreshRef.current = refresh;

  const handleSubmit = useCallback(async (formValues) => {
    if (isEditing && selectedItem) {
      return await update(selectedItem.id, formValues);
    } else {
      return await create(formValues);
    }
  }, [isEditing, selectedItem, create, update]);

  const renderFormButtons = useCallback(() => {
    return (
      <Space>
        <ActionButton
          type="default"
          onClick={close}
          label="Cancel"
        />
        <ActionButton
          type="primary"
          htmlType="submit"
          loading={loading}
          label={isEditing ? 'Update' : 'Create'}
        />
      </Space>
    );
  }, [close, loading, isEditing]);

  return {
    // Data
    data,
    loading,
    error,
    
    // Dialog state
    isOpen,
    isEditing,
    selectedItem,
    setSelectedItem,
    
    // Dialog controls
    openAdd,
    openEdit,
    close,
    
    // CRUD operations
    create,
    update,
    remove,
    refresh,
    handleSubmit,
    
    // UI helpers
    renderFormButtons,
  };
}

