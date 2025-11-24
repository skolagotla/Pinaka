/**
 * ═══════════════════════════════════════════════════════════════
 * REACT QUERY DATA FETCHING HOOKS - MIGRATED TO V2
 * ═══════════════════════════════════════════════════════════════
 * 
 * DEPRECATED: This file is kept for backward compatibility.
 * New code should use hooks from useV2Data.ts instead.
 * 
 * All hooks now use FastAPI v2 backend exclusively.
 * No fallbacks to Next.js API routes.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v2Api } from '@/lib/api/v2-client';
import { useV2Auth } from './useV2Auth';

// Re-export v2 hooks for backward compatibility
export {
  useProperties,
  useProperty,
  useLeases,
  useWorkOrders,
  useTenants,
  useLandlords,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  useUnits,
  useUnit,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
  useLandlord,
  useCreateLandlord,
  useUpdateLandlord,
  useTenant,
  useCreateTenant,
  useUpdateTenant,
  useApproveTenant,
  useRejectTenant,
  useLease,
  useCreateLease,
  useUpdateLease,
  useRenewLease,
  useTerminateLease,
  useWorkOrder,
  useCreateWorkOrder,
  useUpdateWorkOrder,
  useAddWorkOrderComment,
  useApproveWorkOrder,
  useAttachments,
  useUploadAttachment,
  useDownloadAttachment,
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useVendors,
  useVendor,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
  useOrganizations,
  useOrganization,
  useUsers,
  useUser,
  useAssignRole,
} from './useV2Data';

// Query Keys (for backward compatibility)
export const queryKeys = {
  properties: (filters?: any) => ['v2', 'properties', filters],
  tenants: (filters?: any) => ['v2', 'tenants', filters],
  landlords: (filters?: any) => ['v2', 'landlords', filters],
  leases: (filters?: any) => ['v2', 'leases', filters],
  workOrders: (filters?: any) => ['v2', 'work-orders', filters],
  vendors: (filters?: any) => ['v2', 'vendors', filters],
  portfolio: (role?: string, filters?: any) => ['v2', 'portfolio', role, filters],
  search: (query: string) => ['v2', 'search', query],
};

/**
 * Portfolio Hook - Uses v2 API with optimized caching
 * Uses individual hooks to leverage React Query caching instead of Promise.all
 */
export function usePortfolio(role?: string) {
  const { user } = useV2Auth();
  const organizationId = user?.organization_id || undefined;
  
  // Import hooks directly from useV2Data
  const { 
    useProperties, 
    useLeases, 
    useWorkOrders, 
    useTenants, 
    useLandlords 
  } = require('./useV2Data');
  
  // Use individual hooks - React Query will cache each independently
  // This allows other components to reuse cached data
  const propertiesQuery = useProperties(organizationId);
  const leasesQuery = useLeases({ organization_id: organizationId });
  const workOrdersQuery = useWorkOrders({ organization_id: organizationId });
  const tenantsQuery = useTenants(organizationId);
  const landlordsQuery = useLandlords(organizationId);
  
  return {
    data: {
      properties: propertiesQuery.data || [],
      leases: leasesQuery.data || [],
      workOrders: workOrdersQuery.data || [],
      tenants: tenantsQuery.data || [],
      landlords: landlordsQuery.data || [],
    },
    isLoading: propertiesQuery.isLoading || leasesQuery.isLoading || 
               workOrdersQuery.isLoading || tenantsQuery.isLoading || 
               landlordsQuery.isLoading,
    isError: propertiesQuery.isError || leasesQuery.isError || 
             workOrdersQuery.isError || tenantsQuery.isError || 
             landlordsQuery.isError,
    error: propertiesQuery.error || leasesQuery.error || 
           workOrdersQuery.error || tenantsQuery.error || 
           landlordsQuery.error,
    success: !(propertiesQuery.isError || leasesQuery.isError || 
               workOrdersQuery.isError || tenantsQuery.isError || 
               landlordsQuery.isError),
    // Allow refetching individual pieces
    refetch: async () => {
      await Promise.all([
        propertiesQuery.refetch(),
        leasesQuery.refetch(),
        workOrdersQuery.refetch(),
        tenantsQuery.refetch(),
        landlordsQuery.refetch(),
      ]);
    },
  };
}
