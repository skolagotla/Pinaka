/**
 * Hook for maintenance request actions using v2 FastAPI
 * 
 * Provides actions for CRUD operations on work orders using v2 backend.
 */
"use client";

import { useCallback } from 'react';
import { useCreateWorkOrder, useUpdateWorkOrder, useAddWorkOrderComment, useApproveWorkOrder } from './useV2Data';

export function useMaintenanceActions({ userRole, updateRequest, addRequest, removeRequest, message }) {
  const createWorkOrder = useCreateWorkOrder();
  const updateWorkOrder = useUpdateWorkOrder();
  const addComment = useAddWorkOrderComment();
  const approveWorkOrder = useApproveWorkOrder();
  
  const handleCreate = useCallback(async (workOrderData) => {
    try {
      const result = await createWorkOrder.mutateAsync(workOrderData);
      addRequest(result);
      if (message) {
        message.success('Work order created successfully');
      }
      return result;
    } catch (error) {
      if (message) {
        message.error(error.message || 'Failed to create work order');
      }
      throw error;
    }
  }, [createWorkOrder, addRequest, message]);
  
  const handleUpdate = useCallback(async (workOrderId, updates) => {
    try {
      const result = await updateWorkOrder.mutateAsync({
        id: workOrderId,
        data: updates,
      });
      updateRequest(workOrderId, result);
      if (message) {
        message.success('Work order updated successfully');
      }
      return result;
    } catch (error) {
      if (message) {
        message.error(error.message || 'Failed to update work order');
      }
      throw error;
    }
  }, [updateWorkOrder, updateRequest, message]);
  
  const handleAddComment = useCallback(async (workOrderId, commentBody) => {
    try {
      await addComment.mutateAsync({
        workOrderId,
        body: commentBody,
      });
      if (message) {
        message.success('Comment added successfully');
      }
    } catch (error) {
      if (message) {
        message.error(error.message || 'Failed to add comment');
      }
      throw error;
    }
  }, [addComment, message]);
  
  const handleApprove = useCallback(async (workOrderId) => {
    try {
      await approveWorkOrder.mutateAsync(workOrderId);
      updateRequest(workOrderId, { status: 'approved' });
      if (message) {
        message.success('Work order approved');
      }
    } catch (error) {
      if (message) {
        message.error(error.message || 'Failed to approve work order');
      }
      throw error;
    }
  }, [approveWorkOrder, updateRequest, message]);
  
  return {
    handleCreate,
    handleUpdate,
    handleAddComment,
    handleApprove,
  };
}

