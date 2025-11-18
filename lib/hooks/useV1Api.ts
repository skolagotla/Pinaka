/**
 * useV1Api Hook
 * 
 * React hook wrapper for v1Api client with state management
 * Provides loading, error, and data states similar to useUnifiedApi
 * 
 * This hook makes it easier to migrate from useUnifiedApi to v1Api
 * 
 * @example
 * const { get, post, loading, error, data } = useV1Api();
 * 
 * // GET request
 * useEffect(() => {
 *   get('properties', { page: 1, limit: 10 });
 * }, []);
 * 
 * // POST request
 * const handleCreate = async (formData) => {
 *   await post('properties', formData);
 * };
 */

import { useState, useCallback } from 'react';
import { App } from 'antd';
import { v1Api } from '@/lib/api/v1-client';

type DomainName = 
  | 'properties' 
  | 'tenants' 
  | 'leases' 
  | 'rentPayments'
  | 'maintenance'
  | 'documents'
  | 'expenses'
  | 'inspections'
  | 'vendors'
  | 'conversations'
  | 'applications'
  | 'notifications'
  | 'tasks'
  | 'invitations';

export function useV1Api(options: { showUserMessage?: boolean } = {}) {
  const { showUserMessage = true } = options;
  const { message } = App.useApp();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  /**
   * Get API resource by domain name
   */
  const getResource = useCallback((domain: DomainName) => {
    const resourceMap: Record<DomainName, any> = {
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
  }, []);

  /**
   * GET request
   */
  const get = useCallback(async (domain: DomainName, query?: any) => {
    setLoading(true);
    setError(null);
    try {
      const resource = getResource(domain);
      const response = await resource.list(query);
      setData(response);
      return { success: true, data: response };
    } catch (err: any) {
      const errorMsg = err.message || 'Request failed';
      setError(errorMsg);
      if (showUserMessage) {
        message.error(errorMsg);
      }
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [getResource, showUserMessage, message]);

  /**
   * GET by ID
   */
  const getById = useCallback(async (domain: DomainName, id: string) => {
    setLoading(true);
    setError(null);
    try {
      const resource = getResource(domain);
      const response = await resource.get(id);
      setData(response);
      return { success: true, data: response };
    } catch (err: any) {
      const errorMsg = err.message || 'Request failed';
      setError(errorMsg);
      if (showUserMessage) {
        message.error(errorMsg);
      }
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [getResource, showUserMessage, message]);

  /**
   * POST request (create)
   */
  const post = useCallback(async (domain: DomainName, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const resource = getResource(domain);
      const response = await resource.create(data);
      setData(response);
      if (showUserMessage) {
        message.success('Created successfully');
      }
      return { success: true, data: response };
    } catch (err: any) {
      const errorMsg = err.message || 'Create failed';
      setError(errorMsg);
      if (showUserMessage) {
        message.error(errorMsg);
      }
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [getResource, showUserMessage, message]);

  /**
   * PATCH request (update)
   */
  const patch = useCallback(async (domain: DomainName, id: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const resource = getResource(domain);
      const response = await resource.update(id, data);
      setData(response);
      if (showUserMessage) {
        message.success('Updated successfully');
      }
      return { success: true, data: response };
    } catch (err: any) {
      const errorMsg = err.message || 'Update failed';
      setError(errorMsg);
      if (showUserMessage) {
        message.error(errorMsg);
      }
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [getResource, showUserMessage, message]);

  /**
   * DELETE request
   */
  const del = useCallback(async (domain: DomainName, id: string) => {
    setLoading(true);
    setError(null);
    try {
      const resource = getResource(domain);
      await resource.delete(id);
      if (showUserMessage) {
        message.success('Deleted successfully');
      }
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'Delete failed';
      setError(errorMsg);
      if (showUserMessage) {
        message.error(errorMsg);
      }
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [getResource, showUserMessage, message]);

  return {
    get,
    getById,
    post,
    patch,
    delete: del,
    loading,
    error,
    data,
  };
}

