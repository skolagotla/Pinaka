"use client";

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notify } from '@/lib/utils/notification-helper';

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
  const router = useRouter();

  /**
   * Approve a version change
   */
  const approveVersionChange = useCallback(async (documentId, comment = null) => {
    const loadingDismiss = notify.loading('Recording your approval...');
    
    try {
      // Use v1Api for mutual approval
      const res = await fetch(`/api/v1/documents/${documentId}/mutual-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment }),
      });

      if (res.ok) {
        const data = await res.json();
        loadingDismiss();
        notify.success(data.message || 'Document approved successfully');
        
        if (onSuccess) {
          await onSuccess();
        } else {
          router.refresh();
        }
        
        return { success: true, data };
      } else {
        const error = await res.json();
        loadingDismiss();
        notify.error(error.error || 'Failed to approve document');
        return { success: false, error };
      }
    } catch (error) {
      console.error('[useMutualApproval] Version approval error:', error);
      loadingDismiss();
      notify.error('Failed to approve document');
      return { success: false, error };
    }
  }, [router, onSuccess]);

  /**
   * Approve a deletion request
   */
  const approveDeletion = useCallback(async (documentId, reason = null) => {
    const loadingDismiss = notify.loading('Approving deletion...');
    
    try {
      // Use v1Api for deletion approval
      const res = await fetch(`/api/v1/documents/${documentId}/approve-deletion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        const data = await res.json();
        loadingDismiss();
        notify.success(data.message || 'Deletion approved successfully');
        
        if (onSuccess) {
          await onSuccess();
        } else {
          router.refresh();
        }
        
        return { success: true, data };
      } else {
        const error = await res.json();
        loadingDismiss();
        notify.error(error.error || 'Failed to approve deletion');
        return { success: false, error };
      }
    } catch (error) {
      console.error('[useMutualApproval] Deletion approval error:', error);
      loadingDismiss();
      notify.error('Failed to approve deletion');
      return { success: false, error };
    }
  }, [router, onSuccess]);

  return {
    approveVersionChange,
    approveDeletion,
  };
}

