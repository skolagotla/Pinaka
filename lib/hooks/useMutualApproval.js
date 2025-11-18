"use client";

import { useCallback } from 'react';
import { App } from 'antd';
import { useRouter } from 'next/navigation';

/**
 * useMutualApproval Hook
 * 
 * Centralized hook for handling mutual approval workflows:
 * - Version promotion approval
 * - Document deletion approval
 * 
 * Benefits:
 * - Single source of truth for approval logic
 * - Consistent error handling
 * - Reusable across landlord/tenant views
 * 
 * @param {Object} config
 * @param {Function} config.onSuccess - Callback after successful approval
 * @returns {Object} Approval handlers
 */
export function useMutualApproval({ onSuccess } = {}) {
  const { message } = App.useApp();
  const router = useRouter();

  /**
   * Approve a version change
   */
  const approveVersionChange = useCallback(async (documentId, comment = null) => {
    try {
      message.loading({ content: 'Recording your approval...', key: 'approve-version', duration: 0 });
      
      // Use v1Api for mutual approval
      const res = await fetch(`/api/v1/documents/${documentId}/mutual-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment }),
      });

      if (res.ok) {
        const data = await res.json();
        message.success({ content: data.message, key: 'approve-version' });
        
        if (onSuccess) {
          await onSuccess();
        } else {
          router.refresh();
        }
        
        return { success: true, data };
      } else {
        const error = await res.json();
        message.error({ content: error.error || 'Failed to approve document', key: 'approve-version' });
        return { success: false, error };
      }
    } catch (error) {
      console.error('[useMutualApproval] Version approval error:', error);
      message.error({ content: 'Failed to approve document', key: 'approve-version' });
      return { success: false, error };
    }
  }, [message, router, onSuccess]);

  /**
   * Approve a deletion request
   */
  const approveDeletion = useCallback(async (documentId, reason = null) => {
    try {
      message.loading({ content: 'Approving deletion...', key: 'approve-deletion', duration: 0 });
      
      // Use v1Api for deletion approval
      const res = await fetch(`/api/v1/documents/${documentId}/approve-deletion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        const data = await res.json();
        message.success({ content: data.message, key: 'approve-deletion' });
        
        if (onSuccess) {
          await onSuccess();
        } else {
          router.refresh();
        }
        
        return { success: true, data };
      } else {
        const error = await res.json();
        message.error({ content: error.error || 'Failed to approve deletion', key: 'approve-deletion' });
        return { success: false, error };
      }
    } catch (error) {
      console.error('[useMutualApproval] Deletion approval error:', error);
      message.error({ content: 'Failed to approve deletion', key: 'approve-deletion' });
      return { success: false, error };
    }
  }, [message, router, onSuccess]);

  return {
    approveVersionChange,
    approveDeletion,
  };
}

