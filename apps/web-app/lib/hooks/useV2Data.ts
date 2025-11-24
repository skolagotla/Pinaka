/**
 * React Query hooks for v2 FastAPI data fetching
 * 
 * All data access goes through FastAPI v2 backend - no Next.js API routes or Prisma.
 * Uses React Query for caching, invalidation, and optimistic updates.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v2Api } from '@/lib/api/v2-client';

// StaleTime constants (in milliseconds) - controls how long data is considered fresh
// Longer staleTime = fewer refetches, better performance
const STALE_TIMES = {
  organizations: 5 * 60 * 1000,    // 5 minutes (rarely changes)
  properties: 2 * 60 * 1000,        // 2 minutes
  units: 2 * 60 * 1000,             // 2 minutes
  landlords: 2 * 60 * 1000,         // 2 minutes
  tenants: 1 * 60 * 1000,           // 1 minute
  leases: 1 * 60 * 1000,            // 1 minute
  workOrders: 30 * 1000,            // 30 seconds (changes frequently)
  notifications: 10 * 1000,         // 10 seconds (real-time)
  attachments: 2 * 60 * 1000,       // 2 minutes
  users: 2 * 60 * 1000,             // 2 minutes
  vendors: 2 * 60 * 1000,           // 2 minutes
  tasks: 1 * 60 * 1000,             // 1 minute
  conversations: 30 * 1000,         // 30 seconds
  messages: 10 * 1000,               // 10 seconds (real-time)
  invitations: 1 * 60 * 1000,       // 1 minute
  forms: 2 * 60 * 1000,             // 2 minutes
  rentPayments: 1 * 60 * 1000,       // 1 minute
  expenses: 1 * 60 * 1000,          // 1 minute
  inspections: 1 * 60 * 1000,       // 1 minute
};

// Organizations
export function useOrganizations() {
  return useQuery({
    queryKey: ['v2', 'organizations'],
    queryFn: () => v2Api.listOrganizations(),
    staleTime: STALE_TIMES.organizations,
  });
}

export function useOrganization(orgId: string) {
  return useQuery({
    queryKey: ['v2', 'organizations', orgId],
    queryFn: () => v2Api.getOrganization(orgId),
    enabled: !!orgId,
    staleTime: STALE_TIMES.organizations,
  });
}

// Properties
export function useProperties(organizationId?: string) {
  return useQuery({
    queryKey: ['v2', 'properties', organizationId],
    queryFn: () => v2Api.listProperties(organizationId),
    enabled: organizationId !== undefined,
    staleTime: STALE_TIMES.properties,
  });
}

export function useProperty(propertyId: string) {
  return useQuery({
    queryKey: ['v2', 'properties', propertyId],
    queryFn: () => v2Api.getProperty(propertyId),
    enabled: !!propertyId,
    staleTime: STALE_TIMES.properties,
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
    staleTime: STALE_TIMES.units,
    // Allow querying all units or filtered by property
  });
}

export function useUnit(unitId: string) {
  return useQuery({
    queryKey: ['v2', 'units', unitId],
    queryFn: () => v2Api.getUnit(unitId),
    enabled: !!unitId,
    staleTime: STALE_TIMES.units,
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
    staleTime: STALE_TIMES.landlords,
  });
}

export function useLandlord(landlordId: string) {
  return useQuery({
    queryKey: ['v2', 'landlords', landlordId],
    queryFn: () => v2Api.getLandlord(landlordId),
    enabled: !!landlordId,
    staleTime: STALE_TIMES.landlords,
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
    staleTime: STALE_TIMES.tenants,
  });
}

export function useTenant(tenantId: string) {
  return useQuery({
    queryKey: ['v2', 'tenants', tenantId],
    queryFn: () => v2Api.getTenant(tenantId),
    enabled: !!tenantId,
    staleTime: STALE_TIMES.tenants,
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
    staleTime: STALE_TIMES.leases,
  });
}

export function useLease(leaseId: string) {
  return useQuery({
    queryKey: ['v2', 'leases', leaseId],
    queryFn: () => v2Api.getLease(leaseId),
    enabled: !!leaseId,
    staleTime: STALE_TIMES.leases,
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

export function useDeleteLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leaseId: string) => v2Api.deleteLease(leaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'leases'] });
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
    staleTime: STALE_TIMES.workOrders,
  });
}

export function useWorkOrder(workOrderId: string) {
  return useQuery({
    queryKey: ['v2', 'work-orders', workOrderId],
    queryFn: () => v2Api.getWorkOrder(workOrderId),
    enabled: !!workOrderId,
    staleTime: STALE_TIMES.workOrders,
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
    staleTime: STALE_TIMES.attachments,
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
    staleTime: STALE_TIMES.notifications,
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
    staleTime: STALE_TIMES.users,
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['v2', 'users', userId],
    queryFn: () => v2Api.getUser(userId),
    enabled: !!userId,
    staleTime: STALE_TIMES.users,
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
    staleTime: STALE_TIMES.vendors,
  });
}

export function useVendor(vendorId: string) {
  return useQuery({
    queryKey: ['v2', 'vendors', vendorId],
    queryFn: () => v2Api.getVendor(vendorId),
    enabled: !!vendorId,
    staleTime: STALE_TIMES.vendors,
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

// Tasks
export function useTasks(organizationId?: string, propertyId?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ['v2', 'tasks', organizationId, propertyId, statusFilter],
    queryFn: () => v2Api.listTasks(organizationId, propertyId, statusFilter),
    enabled: organizationId !== undefined,
    staleTime: STALE_TIMES.tasks,
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ['v2', 'tasks', taskId],
    queryFn: () => v2Api.getTask(taskId),
    enabled: !!taskId,
    staleTime: STALE_TIMES.tasks,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof v2Api.createTask>[0]) => v2Api.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof v2Api.updateTask>[1] }) =>
      v2Api.updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'tasks', variables.id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => v2Api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'tasks'] });
    },
  });
}

// Conversations
export function useConversations(organizationId?: string, entityType?: string, entityId?: string) {
  return useQuery({
    queryKey: ['v2', 'conversations', organizationId, entityType, entityId],
    queryFn: () => v2Api.listConversations(organizationId, entityType, entityId),
    enabled: organizationId !== undefined,
    staleTime: STALE_TIMES.conversations,
  });
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: ['v2', 'conversations', conversationId],
    queryFn: () => v2Api.getConversation(conversationId),
    enabled: !!conversationId,
    staleTime: STALE_TIMES.conversations,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof v2Api.createConversation>[0]) => v2Api.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'conversations'] });
    },
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['v2', 'conversations', conversationId, 'messages'],
    queryFn: () => v2Api.listMessages(conversationId),
    enabled: !!conversationId,
    staleTime: STALE_TIMES.messages,
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: Parameters<typeof v2Api.createMessage>[1] }) =>
      v2Api.createMessage(conversationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'conversations', variables.conversationId, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'conversations', variables.conversationId] });
    },
  });
}

// Invitations
export function useInvitations(organizationId?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ['v2', 'invitations', organizationId, statusFilter],
    queryFn: () => v2Api.listInvitations(organizationId, statusFilter),
    enabled: organizationId !== undefined,
    staleTime: STALE_TIMES.invitations,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof v2Api.createInvitation>[0]) => v2Api.createInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'invitations'] });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => v2Api.acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'invitations'] });
    },
  });
}

// Forms
export function useForms(organizationId?: string, formType?: string, entityType?: string, entityId?: string) {
  return useQuery({
    queryKey: ['v2', 'forms', organizationId, formType, entityType, entityId],
    queryFn: () => v2Api.listForms(organizationId, formType, entityType, entityId),
    enabled: organizationId !== undefined,
    staleTime: STALE_TIMES.forms,
  });
}

export function useForm(formId: string) {
  return useQuery({
    queryKey: ['v2', 'forms', formId],
    queryFn: () => v2Api.getForm(formId),
    enabled: !!formId,
    staleTime: STALE_TIMES.forms,
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof v2Api.createForm>[0]) => v2Api.createForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'forms'] });
    },
  });
}

export function useCreateFormSignature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: Parameters<typeof v2Api.createFormSignature>[1] }) =>
      v2Api.createFormSignature(formId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'forms', variables.formId] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'forms'] });
    },
  });
}

// Rent Payments
export function useRentPayments(organizationId?: string, leaseId?: string, tenantId?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ['v2', 'rent-payments', organizationId, leaseId, tenantId, statusFilter],
    queryFn: () => v2Api.listRentPayments(organizationId, leaseId, tenantId, statusFilter),
    enabled: organizationId !== undefined,
    staleTime: STALE_TIMES.rentPayments,
  });
}

export function useCreateRentPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof v2Api.createRentPayment>[0]) => v2Api.createRentPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'rent-payments'] });
    },
  });
}

export function useUpdateRentPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof v2Api.updateRentPayment>[1] }) =>
      v2Api.updateRentPayment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'rent-payments'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'rent-payments', variables.id] });
    },
  });
}

// Expenses
export function useExpenses(organizationId?: string, propertyId?: string, category?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ['v2', 'expenses', organizationId, propertyId, category, statusFilter],
    queryFn: () => v2Api.listExpenses(organizationId, propertyId, category, statusFilter),
    enabled: organizationId !== undefined,
    staleTime: STALE_TIMES.expenses,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof v2Api.createExpense>[0]) => v2Api.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'expenses'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof v2Api.updateExpense>[1] }) =>
      v2Api.updateExpense(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'expenses'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'expenses', variables.id] });
    },
  });
}

// Inspections
export function useInspections(organizationId?: string, propertyId?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ['v2', 'inspections', organizationId, propertyId, statusFilter],
    queryFn: () => v2Api.listInspections(organizationId, propertyId, statusFilter),
    enabled: organizationId !== undefined,
    staleTime: STALE_TIMES.inspections,
  });
}

export function useCreateInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof v2Api.createInspection>[0]) => v2Api.createInspection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'inspections'] });
    },
  });
}

export function useUpdateInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof v2Api.updateInspection>[1] }) =>
      v2Api.updateInspection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['v2', 'inspections'] });
      queryClient.invalidateQueries({ queryKey: ['v2', 'inspections', variables.id] });
    },
  });
}
