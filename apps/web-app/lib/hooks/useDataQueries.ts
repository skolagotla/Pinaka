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
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  useUnits,
  useUnit,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
  useLandlords,
  useLandlord,
  useCreateLandlord,
  useUpdateLandlord,
  useTenants,
  useTenant,
  useCreateTenant,
  useUpdateTenant,
  useApproveTenant,
  useRejectTenant,
  useLeases,
  useLease,
  useCreateLease,
  useUpdateLease,
  useRenewLease,
  useTerminateLease,
  useWorkOrders,
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
 * Portfolio Hook - Uses v2 API
 */
export function usePortfolio(role?: string) {
  const { user } = useV2Auth();
  const organizationId = user?.organization_id || undefined;
  
  return useQuery({
    queryKey: queryKeys.portfolio(role, { organizationId }),
    queryFn: async () => {
      // Fetch portfolio data from v2 API
      const [properties, leases, workOrders, tenants, landlords] = await Promise.all([
        v2Api.listProperties(organizationId).catch(() => []),
        v2Api.listLeases({ organization_id: organizationId }).catch(() => []),
        v2Api.listWorkOrders({ organization_id: organizationId }).catch(() => []),
        v2Api.listTenants(organizationId).catch(() => []),
        v2Api.listLandlords(organizationId).catch(() => []),
      ]);
      
      return {
        success: true,
        data: {
          properties: properties || [],
          leases: leases || [],
          workOrders: workOrders || [],
          tenants: tenants || [],
          landlords: landlords || [],
        }
      };
    },
    enabled: !!user,
  });
}
