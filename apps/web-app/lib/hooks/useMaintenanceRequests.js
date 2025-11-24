/**
 * Hook for managing maintenance requests (work orders) using v2 FastAPI
 * 
 * This hook provides a simple interface for fetching and managing work orders
 * using the v2 FastAPI backend. It replaces the old v1 API calls.
 */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWorkOrders, useCreateWorkOrder, useUpdateWorkOrder } from './useV2Data';
import { useV2Auth } from './useV2Auth';

export function useMaintenanceRequests({ userRole, initialRequests = [] }) {
  const { user } = useV2Auth();
  const organizationId = user?.organization_id;
  
  // Build filters based on role
  const filters: any = {};
  if (organizationId) {
    filters.organization_id = organizationId;
  }
  
  // Tenants only see their own work orders - backend handles this via RBAC
  // Landlords see work orders for their properties - backend handles this
  // PM/PMC see all org work orders - backend handles this
  
  const { data: workOrders, isLoading, refetch } = useWorkOrders(filters);
  const createWorkOrder = useCreateWorkOrder();
  const updateWorkOrder = useUpdateWorkOrder();
  
  const [requests, setRequests] = useState(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Update requests when workOrders data changes
  useEffect(() => {
    if (workOrders && Array.isArray(workOrders)) {
      setRequests(workOrders);
    } else if (initialRequests.length > 0) {
      setRequests(initialRequests);
    }
  }, [workOrders, initialRequests]);
  
  const fetchRequests = useCallback(() => {
    refetch();
  }, [refetch]);
  
  const addRequest = useCallback((newRequest) => {
    setRequests(prev => [...prev, newRequest]);
  }, []);
  
  const removeRequest = useCallback((requestId) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
  }, []);
  
  const updateRequest = useCallback((requestId, updates) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, ...updates } : r
    ));
    if (selectedRequest?.id === requestId) {
      setSelectedRequest(prev => ({ ...prev, ...updates }));
    }
  }, [selectedRequest]);
  
  return {
    requests,
    loading: isLoading,
    selectedRequest,
    setSelectedRequest,
    setRequests,
    fetchRequests,
    updateRequest,
    addRequest,
    removeRequest,
    createWorkOrder,
    updateWorkOrder,
  };
}

