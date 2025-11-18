/**
 * useMaintenanceActions Hook
 * 
 * Handles CRUD operations for maintenance requests
 * Extracted from MaintenanceClient for better code organization
 * 
 * @param {Object} options
 * @param {'landlord'|'tenant'} options.userRole - User role
 * @param {Function} options.updateRequest - Update request in state
 * @param {Function} options.addRequest - Add request to state
 * @param {Function} options.removeRequest - Remove request from state
 * @param {Function} options.message - Ant Design message instance
 * @returns {Object} Maintenance action handlers
 */

import { useCallback } from 'react';

export function useMaintenanceActions({
  userRole,
  updateRequest,
  addRequest,
  removeRequest,
  message,
}) {
  /**
   * Create a new maintenance request (v1 API)
   */
  const createRequest = useCallback(async (formData) => {
    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.maintenance.create(formData);
      const request = response.data || response;
      if (request) {
        addRequest(request);
        message.success('Maintenance request created successfully');
        return request;
      }
    } catch (error) {
      console.error('[useMaintenanceActions] Error creating request:', error);
      throw error;
    }
  }, [addRequest, message]);

  /**
   * Update an existing maintenance request (v1 API)
   */
  const handleUpdate = useCallback(async (requestId, updates) => {
    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.maintenance.update(requestId, updates);
      const request = response.data || response;
      if (request) {
        updateRequest(request);
        message.success('Maintenance request updated successfully');
        return request;
      }
    } catch (error) {
      console.error('[useMaintenanceActions] Error updating request:', error);
      throw error;
    }
  }, [updateRequest, message]);

  /**
   * Delete a maintenance request (v1 API)
   */
  const handleDelete = useCallback(async (requestId) => {
    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.maintenance.delete(requestId);
      
      removeRequest(requestId);
      message.success('Maintenance request deleted successfully');
    } catch (error) {
      console.error('[useMaintenanceActions] Error deleting request:', error);
      throw error;
    }
  }, [removeRequest, message]);

  /**
   * Approve a maintenance request
   */
  const handleApprove = useCallback(async (requestId) => {
    return handleUpdate(requestId, {
      [userRole === 'landlord' ? 'landlordApproved' : 'tenantApproved']: true,
    });
  }, [handleUpdate, userRole]);

  /**
   * Reject a maintenance request
   */
  const handleReject = useCallback(async (requestId, reason = null) => {
    const updates = {
      [userRole === 'landlord' ? 'landlordApproved' : 'tenantApproved']: false,
    };
    if (reason) {
      updates.rejectionReason = reason;
    }
    return handleUpdate(requestId, updates);
  }, [handleUpdate, userRole]);

  /**
   * Update request status
   */
  const handleStatusUpdate = useCallback(async (requestId, status) => {
    return handleUpdate(requestId, { status });
  }, [handleUpdate]);

  /**
   * Add a comment to a maintenance request (v1 API)
   */
  const handleAddComment = useCallback(async (requestId, comment) => {
    try {
      // Use v1 API endpoint for comments
      const response = await fetch(`/api/v1/maintenance/${requestId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to add comment');
      }
      const data = await response.json();
      const request = data.request || data.data || data;
      if (request) {
        updateRequest(request);
        return request;
      }
    } catch (error) {
      console.error('[useMaintenanceActions] Error adding comment:', error);
      throw error;
    }
  }, [updateRequest]);

  return {
    createRequest,
    handleUpdate,
    handleDelete,
    handleApprove,
    handleReject,
    handleStatusUpdate,
    handleAddComment,
  };
}

export default useMaintenanceActions;

