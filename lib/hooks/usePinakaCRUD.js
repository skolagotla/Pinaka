/**
 * 🎯 PINAKA CRUD HOOK - Unified hook for all CRUD operations
 * 
 * Combines 4 related hooks into one powerful, lean interface:
 * - useCRUD: Data management (create, update, delete, refresh)
 * - useDialog: Modal state management (open, close, add/edit modes)
 * - useMessage: User notifications (success, error messages)
 * - useFormButtons: Consistent form action buttons
 * 
 * This eliminates 60+ lines of boilerplate in every CRUD page!
 * 
 * @example
 * const pinaka = usePinakaCRUD({
 *   apiEndpoint: '/api/properties',
 *   initialData: properties,
 *   entityName: 'Property',
 *   messages: {
 *     createSuccess: 'Property added successfully',
 *     updateSuccess: 'Property updated successfully',
 *     deleteSuccess: 'Property deleted successfully'
 *   }
 * });
 * 
 * // Use in component:
 * <Table dataSource={pinaka.data} loading={pinaka.loading} />
 * <Button onClick={pinaka.openAdd}>Add</Button>
 * <Modal open={pinaka.isOpen} onCancel={pinaka.close}>
 *   <Form onFinish={pinaka.handleSubmit}>
 *     {pinaka.renderFormButtons()}
 *   </Form>
 * </Modal>
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Space } from 'antd';
import { ActionButton } from '../../apps/web-app/components/shared/buttons';
import { useMessage } from './useMessage';
const logger = require('../logger');

// Lazy load v1Api to avoid circular dependencies
let v1Api = null;
const getV1Api = () => {
  if (!v1Api) {
    v1Api = require('@/lib/api/v1-client').v1Api;
  }
  return v1Api;
};

// Map domain names to v1Api resources
const getV1Resource = (domain) => {
  const api = getV1Api();
  const resourceMap = {
    properties: api.properties,
    tenants: api.tenants,
    leases: api.leases,
    rentPayments: api.rentPayments,
    maintenance: api.maintenance,
    documents: api.documents,
    expenses: api.expenses,
    inspections: api.inspections,
    vendors: api.vendors,
    conversations: api.conversations,
    applications: api.applications,
    notifications: api.notifications,
    tasks: api.tasks,
    invitations: api.invitations,
  };
  return resourceMap[domain];
};

export function usePinakaCRUD({
  apiEndpoint,
  domain, // Optional: domain name for v1 API (e.g., 'properties', 'tenants')
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
  useV1Api = false, // Set to true to use v1Api instead of fetch
}) {
  // Ant Design message API
  const message = useMessage();

  // Default messages
  const {
    createSuccess = `${entityName} created successfully`,
    updateSuccess = `${entityName} updated successfully`,
    deleteSuccess = `${entityName} deleted successfully`,
    createError = `Failed to create ${entityName.toLowerCase()}`,
    updateError = `Failed to update ${entityName.toLowerCase()}`,
    deleteError = `Failed to delete ${entityName.toLowerCase()}`,
  } = messages;

  // ============================================
  // STATE MANAGEMENT (Combined from useCRUD + useDialog)
  // ============================================
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Ref to store refresh function to avoid circular dependency
  const refreshRef = useRef(null);

  // ============================================
  // DIALOG CONTROLS
  // ============================================
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

  // ============================================
  // CRUD OPERATIONS
  // ============================================
  
  /**
   * Create a new item
   */
  const create = useCallback(async (payload) => {
    logger.apiCall('POST', apiEndpoint, { payload });
    setLoading(true);
    setError(null);
    
    try {
      // Allow pre-processing
      let finalPayload = payload;
      if (onBeforeCreate) {
        finalPayload = await onBeforeCreate(payload);
      }

      let created;
      
      if (useV1Api && domain) {
        // Use v1Api client
        const resource = getV1Resource(domain);
        const response = await resource.create(finalPayload);
        // v1 API returns { success: true, data: {...} }
        created = response.data || response;
      } else {
        // Use legacy fetch API
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalPayload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || errorData.message || createError;
          const error = new Error(errorMessage);
          logger.apiError('POST', apiEndpoint, error);
          throw error;
        }

        const responseData = await response.json();
        // Handle standardized response format { success: true, data: {...} }
        created = responseData.success !== undefined ? (responseData.data || responseData) : responseData;
      }
      
      logger.apiResponse('POST', apiEndpoint, 201, { created });
      
      // Optimistic update
      setData((prev) => [created, ...prev]);
      
      message.success(createSuccess);
      
      if (onAfterCreate) {
        await onAfterCreate(created);
      }
      
      return { success: true, data: created };
    } catch (err) {
      setError(err.message);
      message.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, domain, useV1Api, createSuccess, createError, message, onBeforeCreate, onAfterCreate]);

  /**
   * Update an existing item
   */
  const update = useCallback(async (id, payload) => {
    logger.apiCall('PATCH', `${apiEndpoint}/${id}`, { payload });
    setLoading(true);
    setError(null);
    
    try {
      // Allow pre-processing
      let finalPayload = payload;
      if (onBeforeUpdate) {
        finalPayload = await onBeforeUpdate(id, payload);
      }

      let updated;
      
      if (useV1Api && domain) {
        // Use v1Api client
        const resource = getV1Resource(domain);
        const response = await resource.update(id, finalPayload);
        // v1 API returns { success: true, data: {...} }
        updated = response.data || response;
      } else {
        // Use legacy fetch API
        let requestBody;
        try {
          requestBody = JSON.stringify(finalPayload);
        } catch (jsonError) {
          const error = new Error('Invalid data format. Please check all fields and try again.');
          logger.apiError('PATCH', `${apiEndpoint}/${id}`, error);
          setError(error.message);
          message.error(error.message);
          return { success: false, error: error.message };
        }

        let response;
        try {
          response = await fetch(`${apiEndpoint}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody,
          });
        } catch (fetchError) {
          const networkError = new Error(
            fetchError.message === 'Failed to fetch' 
              ? 'Network error: Unable to connect to server. Please check your connection and try again.'
              : `Network error: ${fetchError.message}`
          );
          logger.apiError('PATCH', `${apiEndpoint}/${id}`, networkError);
          setError(networkError.message);
          message.error(networkError.message);
          return { success: false, error: networkError.message };
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || errorData.message || updateError;
          const error = new Error(errorMessage);
          logger.apiError('PATCH', `${apiEndpoint}/${id}`, error);
          throw error;
        }

        const responseData = await response.json();
        // Handle standardized response format { success: true, data: {...} }
        updated = responseData.success !== undefined ? (responseData.data || responseData) : responseData;
      }
      
      logger.apiResponse('PATCH', `${apiEndpoint}/${id}`, 200, { updated });
      
      // Optimistic update - merge with existing data to preserve all fields
      setData((prev) => {
        const existing = prev.find((item) => item.id === id);
        const merged = existing ? { ...existing, ...updated } : updated;
        return prev.map((item) => (item.id === id ? merged : item));
      });
      
      message.success(updateSuccess);
      
      // Refresh data to ensure we have the latest from server (including all relations)
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
      setError(err.message);
      message.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, domain, useV1Api, updateSuccess, updateError, message, onBeforeUpdate, onAfterUpdate]);

  /**
   * Delete an item
   */
  const remove = useCallback(async (id, item = null) => {
    // Confirmation if enabled
    if (confirmDelete) {
      logger.action('Delete confirmation shown', { id, entityName });
      // Note: Confirmation is handled by Ant Design Popconfirm in the UI
    }
    
    logger.apiCall('DELETE', `${apiEndpoint}/${id}`);
    setLoading(true);
    setError(null);
    
    try {
      // Allow pre-processing
      if (onBeforeDelete) {
        const shouldContinue = await onBeforeDelete(id, item);
        if (shouldContinue === false) {
          logger.action('Delete cancelled by pre-hook', { id });
          return { success: false, cancelled: true };
        }
      }

      if (useV1Api && domain) {
        // Use v1Api client
        const resource = getV1Resource(domain);
        await resource.delete(id);
      } else {
        // Use legacy fetch API
        const response = await fetch(`${apiEndpoint}/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok && response.status !== 204) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || errorData.message || deleteError;
          const error = new Error(errorMessage);
          logger.apiError('DELETE', `${apiEndpoint}/${id}`, error);
          throw error;
        }
      }

      logger.apiResponse('DELETE', `${apiEndpoint}/${id}`, 204);
      
      // Optimistic update
      setData((prev) => prev.filter((item) => item.id !== id));
      
      message.success(deleteSuccess);
      
      if (onAfterDelete) {
        await onAfterDelete(id);
      }
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      message.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, domain, useV1Api, deleteSuccess, deleteError, message, confirmDelete, onBeforeDelete, onAfterDelete, entityName]);

  /**
   * Refresh data from API
   */
  const refresh = useCallback(async (query = {}) => {
    logger.apiCall('GET', apiEndpoint, { query });
    setLoading(true);
    setError(null);
    
    try {
      let data = [];
      
      if (useV1Api && domain) {
        // Use v1Api client
        const resource = getV1Resource(domain);
        const response = await resource.list(query);
        // v1 API returns { success: true, data: { data: [...], pagination: {...} } }
        data = response.data?.data || response.data || [];
      } else {
        // Use legacy fetch API
        const cacheBuster = `?t=${Date.now()}`;
        const url = apiEndpoint.includes('?') 
          ? `${apiEndpoint}&t=${Date.now()}` 
          : `${apiEndpoint}${cacheBuster}`;
        
        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const fetched = await response.json();
        
        // Handle various response formats:
        // 1. Standardized: { success: true, data: [...] }
        // 2. Wrapped: { tenants: [...] } or { data: [...] }
        // 3. Direct array: [...]
        if (fetched.success !== undefined) {
          data = fetched.data || fetched;
        } else if (fetched.tenants && Array.isArray(fetched.tenants)) {
          data = fetched.tenants;
        } else if (fetched.data && Array.isArray(fetched.data)) {
          data = fetched.data;
        } else if (Array.isArray(fetched)) {
          data = fetched;
        }
      }
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        data = [];
      }
      
      logger.apiResponse('GET', apiEndpoint, 200, { count: data.length });
      setData(data);
      
      // Update selectedItem if it's currently set (user is viewing/editing)
      if (selectedItem && Array.isArray(data)) {
        const updatedItem = data.find(item => item.id === selectedItem.id);
        if (updatedItem) {
          setSelectedItem(updatedItem);
          logger.info('Updated selectedItem after refresh', { itemId: updatedItem.id });
        }
      }
      
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      message.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, domain, useV1Api, message, selectedItem]);
  
  // Store refresh function in ref to avoid circular dependency
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  // ============================================
  // FORM SUBMISSION (Intelligent routing)
  // ============================================
  const handleSubmit = useCallback(async (values) => {
    logger.action('Form submitted', { isEditing, entityName, values });
    
    const result = isEditing
      ? await update(selectedItem.id, values)
      : await create(values);

    if (result.success) {
      close();
    }
    
    return result;
  }, [isEditing, selectedItem, create, update, close, entityName]);

  // ============================================
  // FORM BUTTONS (Integrated)
  // ============================================
  const renderFormButtons = useCallback((options = {}) => {
    const { hideCancel = false } = options;
    return (
      <Space style={{ width: '100%', justifyContent: 'flex-end' }} size="middle">
        {!hideCancel && (
          <ActionButton
            action="cancel"
            onClick={close}
            disabled={loading}
            size="large"
            tooltip="Cancel"
          />
        )}
        <ActionButton
          action="save"
          htmlType="submit"
          loading={loading}
          size="large"
          tooltip={isEditing ? 'Save Changes' : `Add ${entityName}`}
        />
      </Space>
    );
  }, [close, loading, isEditing, entityName]);

  // ============================================
  // RETURN EVERYTHING
  // ============================================
  return {
    // Data State
    data,
    loading,
    error,
    
    // Dialog State
    isOpen,
    isEditing,
    selectedItem,
    
    // Dialog Controls
    openAdd,
    openEdit,
    close,
    
    // CRUD Operations
    create,
    update,
    remove,
    refresh,
    setData,
    
    // Integrated Actions
    handleSubmit,      // Automatic create/update routing
    renderFormButtons, // Consistent form buttons
  };
}

