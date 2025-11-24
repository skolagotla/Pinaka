/**
 * Shared Maintenance Ticket Hook
 * Manages maintenance ticket state, comments, status updates, and approvals
 * Used by both landlord and tenant maintenance pages
 */

import { useState, useCallback } from 'react';
import { notify } from '@/lib/utils/notification-helper';

export function useMaintenanceTicket(userRole = 'landlord') {
  
  // State management
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  /**
   * Fetch all maintenance requests (v1 API)
   */
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      // Use v1Api client
      const { v2Api } = await import('@/lib/api/v2-client');
      const response = await v1Api.maintenance.list({ page: 1, limit: 1000 });
      const requestsData = response.data?.data || response.data || [];
      const data = Array.isArray(requestsData) ? requestsData : [];
      setRequests(data);
      
      // Update selected request if it's currently open
      if (selectedRequest) {
        const updated = data.find(r => r.id === selectedRequest.id);
        if (updated) {
          setSelectedRequest(updated);
        }
      }
    } catch (error) {
      console.error('[useMaintenanceTicket] Fetch error:', error);
      notify.error(error.message || 'Failed to fetch maintenance requests');
    } finally {
      setLoading(false);
    }
  }, [selectedRequest]);

  /**
   * Open ticket details modal
   */
  const openTicket = useCallback(async (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
    
    // Mark as viewed (v1 API)
    try {
      const { v2Api } = await import('@/lib/api/v2-client');
      await v1Api.specialized.markMaintenanceViewed(request.id, userRole);
      
      // Refresh to update the red dot
      fetchRequests();
    } catch (error) {
      console.error('[useMaintenanceTicket] Mark viewed error:', error);
    }
  }, [userRole, fetchRequests]);

  /**
   * Close ticket details modal
   */
  const closeTicket = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    setNewComment('');
  }, []);

  /**
   * Add comment to ticket (v1 API)
   */
  const addComment = useCallback(async (comment, authorName, authorEmail) => {
    if (!comment.trim() || !selectedRequest) return;
    
    setCommentLoading(true);
    try {
      // Use v1Api client
      const { v2Api } = await import('@/lib/api/v2-client');
      const data = await v1Api.specialized.addMaintenanceComment(
        selectedRequest.id,
        comment.trim(),
        {
          authorRole: userRole,
          authorName,
          authorEmail,
        }
      );
      const updated = data.request || data.data || data;
      setSelectedRequest(updated);
      setNewComment('');
      notify.success('Comment added successfully');
      
      // Refresh to get latest data
      fetchRequests();
    } catch (error) {
      console.error('[useMaintenanceTicket] Add comment error:', error);
      notify.error(error.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  }, [selectedRequest, userRole, fetchRequests]);

  /**
   * Update ticket status (v1 API)
   */
  const updateStatus = useCallback(async (newStatus, authorName, authorEmail) => {
    if (!selectedRequest) return;
    
    setStatusUpdateLoading(true);
    try {
      // Use v1Api client
      const { v2Api } = await import('@/lib/api/v2-client');
      const response = await v1Api.maintenance.update(selectedRequest.id, {
        status: newStatus,
        authorRole: userRole,
        authorName,
        authorEmail,
      });
      const updated = response.data || response;
      setSelectedRequest(updated);
      notify.success(`Status updated to ${newStatus}`);
      
      // Refresh to get latest data
      fetchRequests();
    } catch (error) {
      console.error('[useMaintenanceTicket] Update status error:', error);
      notify.error(error.message || 'Failed to update status');
    } finally {
      setStatusUpdateLoading(false);
    }
  }, [selectedRequest, userRole, fetchRequests]);

  /**
   * Approve ticket closure
   */
  const approveTicket = useCallback(async (authorName, authorEmail) => {
    if (!selectedRequest) return;
    
    setStatusUpdateLoading(true);
    try {
      // Use v1Api client
      const { v2Api } = await import('@/lib/api/v2-client');
      const data = await v1Api.specialized.approveMaintenance(selectedRequest.id, {
        approved: true,
        authorRole: userRole,
        authorName,
        authorEmail,
      });
      const updated = data.request || data.data || data;
      setSelectedRequest(updated);
      notify.success('Ticket closure approved');
      
      // Refresh to get latest data
      fetchRequests();
    } catch (error) {
      console.error('[useMaintenanceTicket] Approve error:', error);
      notify.error(error.message || 'Failed to approve ticket');
    } finally {
      setStatusUpdateLoading(false);
    }
  }, [selectedRequest, userRole, fetchRequests]);

  /**
   * Reject ticket closure (reopen)
   */
  const rejectTicket = useCallback(async (authorName, authorEmail) => {
    if (!selectedRequest) return;
    
    setStatusUpdateLoading(true);
    try {
      // Use v1Api client
      const { v2Api } = await import('@/lib/api/v2-client');
      const data = await v1Api.specialized.approveMaintenance(selectedRequest.id, {
        approved: false,
        authorRole: userRole,
        authorName,
        authorEmail,
      });
      const updated = data.request || data.data || data;
      setSelectedRequest(updated);
      notify.success('Ticket reopened');
      
      // Refresh to get latest data
      fetchRequests();
    } catch (error) {
      console.error('[useMaintenanceTicket] Reject error:', error);
      notify.error(error.message || 'Failed to reject ticket');
    } finally {
      setStatusUpdateLoading(false);
    }
  }, [selectedRequest, userRole, fetchRequests]);

  /**
   * Create new maintenance request (landlord only) (v1 API)
   */
  const createRequest = useCallback(async (requestData) => {
    try {
      // Use v1Api client
      const { v2Api } = await import('@/lib/api/v2-client');
      const response = await v1Api.maintenance.create(requestData);
      const request = response.data || response;
      
      notify.success('Maintenance request created successfully');
      setIsCreateModalOpen(false);
      fetchRequests();
      return { success: true, request };
    } catch (error) {
      console.error('[useMaintenanceTicket] Create error:', error);
      notify.error(error.message || 'Failed to create request');
      return { success: false, error: error.message };
    }
  }, [fetchRequests]);

  /**
   * Download ticket as PDF (v1 API)
   */
  const downloadTicketPDF = useCallback(async (ticketId) => {
    try {
      // Use v1Api to download maintenance PDF
      const { v2Api } = await import('@/lib/api/v2-client');
      const blob = await v1Api.forms.downloadMaintenancePDF(ticketId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Ticket_${ticketId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notify.success('Ticket downloaded');
    } catch (error) {
      console.error('[useMaintenanceTicket] Download error:', error);
      notify.error('Failed to download ticket');
    }
  }, []);

  return {
    // State
    requests,
    loading,
    selectedRequest,
    isModalOpen,
    isCreateModalOpen,
    newComment,
    commentLoading,
    statusUpdateLoading,
    
    // Setters
    setRequests,
    setSelectedRequest,
    setIsCreateModalOpen,
    setNewComment,
    
    // Actions
    fetchRequests,
    openTicket,
    closeTicket,
    addComment,
    updateStatus,
    approveTicket,
    rejectTicket,
    createRequest,
    downloadTicketPDF,
  };
}
