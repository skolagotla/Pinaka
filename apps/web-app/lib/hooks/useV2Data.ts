/**
 * React Query hooks for v2 FastAPI data fetching
 */
"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v2Api } from '../../../../lib/api/v2-client';

// Organizations
export function useOrganizations() {
  return useQuery({
    queryKey: ['v2', 'organizations'],
    queryFn: () => v2Api.listOrganizations(),
  });
}

// Properties
export function useProperties(organizationId?: string) {
  return useQuery({
    queryKey: ['v2', 'properties', organizationId],
    queryFn: () => v2Api.listProperties(organizationId),
    enabled: !!organizationId || organizationId === undefined,
  });
}

export function useProperty(propertyId: string) {
  return useQuery({
    queryKey: ['v2', 'properties', propertyId],
    queryFn: () => v2Api.getProperty(propertyId),
    enabled: !!propertyId,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof v2Api.createProperty>[0]) => v2Api.createProperty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'properties'] });
    },
  });
}

// Work Orders
export function useWorkOrders(filters?: {
  organization_id?: string;
  property_id?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['v2', 'work-orders', filters],
    queryFn: () => v2Api.listWorkOrders(filters),
  });
}

export function useWorkOrder(workOrderId: string) {
  return useQuery({
    queryKey: ['v2', 'work-orders', workOrderId],
    queryFn: () => v2Api.getWorkOrder(workOrderId),
    enabled: !!workOrderId,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof v2Api.createWorkOrder>[0]) => v2Api.createWorkOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'work-orders'] });
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof v2Api.updateWorkOrder>[1] }) =>
      v2Api.updateWorkOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'work-orders', variables.id] });
    },
  });
}

export function useAddWorkOrderComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workOrderId, body }: { workOrderId: string; body: string }) =>
      v2Api.addWorkOrderComment(workOrderId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'work-orders', variables.workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'work-orders'] });
    },
  });
}

// Attachments
export function useAttachments(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['v2', 'attachments', entityType, entityId],
    queryFn: () => v2Api.listAttachments(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entityType, entityId, file }: { entityType: string; entityId: string; file: File }) =>
      v2Api.uploadAttachment(entityType, entityId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'attachments', variables.entityType, variables.entityId] });
    },
  });
}

