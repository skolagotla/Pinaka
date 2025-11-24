/**
 * React Query hooks for v2 FastAPI data fetching
 * 
 * All data access goes through FastAPI v2 backend - no Next.js API routes or Prisma.
 * Uses React Query for caching, invalidation, and optimistic updates.
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

export function useOrganization(orgId: string) {
  return useQuery({
    queryKey: ['v2', 'organizations', orgId],
    queryFn: () => v2Api.getOrganization(orgId),
    enabled: !!orgId,
  });
}

// Properties
export function useProperties(organizationId?: string) {
  return useQuery({
    queryKey: ['v2', 'properties', organizationId],
    queryFn: () => v2Api.listProperties(organizationId),
    enabled: organizationId !== undefined,
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

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof v2Api.updateProperty>[1] }) =>
      v2Api.updateProperty(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'properties'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'properties', variables.id] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => v2Api.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'properties'] });
    },
  });
}

// Units
export function useUnits(propertyId?: string) {
  return useQuery({
    queryKey: ['v2', 'units', propertyId],
    queryFn: () => v2Api.listUnits(propertyId),
    // Allow querying all units or filtered by property
  });
}

export function useUnit(unitId: string) {
  return useQuery({
    queryKey: ['v2', 'units', unitId],
    queryFn: () => v2Api.getUnit(unitId),
    enabled: !!unitId,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof v2Api.createUnit>[0]) => v2Api.createUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'units'] });
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof v2Api.updateUnit>[1] }) =>
      v2Api.updateUnit(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'units'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'units', variables.id] });
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => v2Api.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'units'] });
    },
  });
}

// Landlords
export function useLandlords(organizationId?: string) {
  return useQuery({
    queryKey: ['v2', 'landlords', organizationId],
    queryFn: () => v2Api.listLandlords(organizationId),
    enabled: organizationId !== undefined,
  });
}

export function useLandlord(landlordId: string) {
  return useQuery({
    queryKey: ['v2', 'landlords', landlordId],
    queryFn: () => v2Api.getLandlord(landlordId),
    enabled: !!landlordId,
  });
}

export function useCreateLandlord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof v2Api.createLandlord>[0]) => v2Api.createLandlord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'landlords'] });
    },
  });
}

export function useUpdateLandlord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof v2Api.updateLandlord>[1] }) =>
      v2Api.updateLandlord(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'landlords'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'landlords', variables.id] });
    },
  });
}

// Tenants
export function useTenants(organizationId?: string) {
  return useQuery({
    queryKey: ['v2', 'tenants', organizationId],
    queryFn: () => v2Api.listTenants(organizationId),
    enabled: organizationId !== undefined,
  });
}

export function useTenant(tenantId: string) {
  return useQuery({
    queryKey: ['v2', 'tenants', tenantId],
    queryFn: () => v2Api.getTenant(tenantId),
    enabled: !!tenantId,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof v2Api.createTenant>[0]) => v2Api.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'tenants'] });
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof v2Api.updateTenant>[1] }) =>
      v2Api.updateTenant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'tenants', variables.id] });
    },
  });
}

export function useApproveTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) => v2Api.approveTenant(tenantId),
    onSuccess: (_, tenantId) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'tenants', tenantId] });
    },
  });
}

export function useRejectTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, reason }: { tenantId: string; reason?: string }) =>
      v2Api.rejectTenant(tenantId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'tenants', variables.tenantId] });
    },
  });
}

// Leases
export function useLeases(filters?: { organization_id?: string; unit_id?: string; tenant_id?: string; landlord_id?: string }) {
  return useQuery({
    queryKey: ['v2', 'leases', filters],
    queryFn: () => v2Api.listLeases(filters),
  });
}

export function useLease(leaseId: string) {
  return useQuery({
    queryKey: ['v2', 'leases', leaseId],
    queryFn: () => v2Api.getLease(leaseId),
    enabled: !!leaseId,
  });
}

export function useCreateLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof v2Api.createLease>[0]) => v2Api.createLease(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'leases'] });
    },
  });
}

export function useUpdateLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof v2Api.updateLease>[1] }) =>
      v2Api.updateLease(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'leases'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'leases', variables.id] });
    },
  });
}

export function useRenewLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leaseId, data }: { leaseId: string; data: Parameters<typeof v2Api.renewLease>[1] }) =>
      v2Api.renewLease(leaseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'leases'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'leases', variables.leaseId] });
    },
  });
}

export function useTerminateLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leaseId, data }: { leaseId: string; data: Parameters<typeof v2Api.terminateLease>[1] }) =>
      v2Api.terminateLease(leaseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'leases'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'leases', variables.leaseId] });
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

export function useApproveWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workOrderId, data }: { workOrderId: string; data?: Parameters<typeof v2Api.approveWorkOrder>[1] }) =>
      v2Api.approveWorkOrder(workOrderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'work-orders', variables.workOrderId] });
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

export function useDownloadAttachment() {
  return useMutation({
    mutationFn: (attachmentId: string) => v2Api.downloadAttachment(attachmentId),
  });
}

// Notifications
export function useNotifications(isRead?: boolean) {
  return useQuery({
    queryKey: ['v2', 'notifications', isRead],
    queryFn: () => v2Api.listNotifications(isRead),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => v2Api.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => v2Api.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'notifications'] });
    },
  });
}

// Users (for admin)
export function useUsers(organizationId?: string) {
  return useQuery({
    queryKey: ['v2', 'users', organizationId],
    queryFn: () => v2Api.listUsers(organizationId),
    enabled: organizationId !== undefined,
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['v2', 'users', userId],
    queryFn: () => v2Api.getUser(userId),
    enabled: !!userId,
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleName, organizationId }: { userId: string; roleName: string; organizationId?: string }) =>
      v2Api.assignRole(userId, roleName, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'users', variables.userId] });
    },
  });
}

// Vendors
export function useVendors(organizationId?: string, search?: string, status?: string) {
  return useQuery({
    queryKey: ['v2', 'vendors', organizationId, search, status],
    queryFn: () => v2Api.listVendors(organizationId, search, status),
    enabled: organizationId !== undefined,
  });
}

export function useVendor(vendorId: string) {
  return useQuery({
    queryKey: ['v2', 'vendors', vendorId],
    queryFn: () => v2Api.getVendor(vendorId),
    enabled: !!vendorId,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof v2Api.createVendor>[0]) => v2Api.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'vendors'] });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof v2Api.updateVendor>[1] }) =>
      v2Api.updateVendor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'vendors', variables.id] });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => v2Api.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'vendors'] });
    },
  });
}
