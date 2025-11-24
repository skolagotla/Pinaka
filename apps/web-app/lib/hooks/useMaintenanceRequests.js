/**
 * useMaintenanceRequests Hook
 * 
 * Handles data fetching and state management for maintenance requests
 * Extracted from MaintenanceClient for better code organization
 * 
 * @param {Object} options
 * @param {'landlord'|'tenant'} options.userRole - User role
 * @param {Array} options.initialRequests - Initial requests
 * @returns {Object} Maintenance requests state and actions
 */

import { useState, useEffect, useCallback } from 'react';

export function useMaintenanceRequests({ 
  userRole, 
  initialRequests = []
}) {
  const [requests, setRequests] = useState(initialRequests || []);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  /**
   * Fetch maintenance requests from API (v1)
   */
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      // Use v1Api client
      const { v2Api } = await import('@/lib/api/v2-client');
      const response = await v1Api.maintenance.list({ page: 1, limit: 1000 });
      // v1 API returns { success: true, data: { data: [...], pagination: {...} } }
      const requestsData = response.data?.data || response.data || [];
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error('[useMaintenanceRequests] Error fetching requests:', error);
      setRequests([]); // Set empty array on error to prevent filter errors
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh requests
   */
  const refresh = useCallback(() => {
    fetchRequests();
  }, [fetchRequests]);

  /**
   * Update a request in the list
   */
  const updateRequest = useCallback((updatedRequest) => {
    setRequests(prev => 
      prev.map(req => req.id === updatedRequest.id ? updatedRequest : req)
    );
  }, []);

  /**
   * Add a new request to the list
   */
  const addRequest = useCallback((newRequest) => {
    setRequests(prev => [newRequest, ...prev]);
  }, []);

  /**
   * Remove a request from the list
   */
  const removeRequest = useCallback((requestId) => {
    setRequests(prev => prev.filter(req => req.id !== requestId));
  }, []);

  // Initial fetch if no initial requests
  useEffect(() => {
    if (!initialRequests || initialRequests.length === 0) {
      fetchRequests();
    }
  }, []); // Only run once on mount

  return {
    requests,
    loading,
    selectedRequest,
    setSelectedRequest,
    setRequests,
    fetchRequests,
    refresh,
    updateRequest,
    addRequest,
    removeRequest,
  };
}

export default useMaintenanceRequests;

