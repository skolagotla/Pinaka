/**
 * ═══════════════════════════════════════════════════════════════
 * REACT QUERY DATA FETCHING HOOKS
 * ═══════════════════════════════════════════════════════════════
 * 
 * Centralized data fetching hooks using React Query
 * Replaces ad-hoc fetch calls throughout the application
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/utils/api-client';

// Query Keys
export const queryKeys = {
  properties: (filters?: any) => ['properties', filters],
  tenants: (filters?: any) => ['tenants', filters],
  landlords: (filters?: any) => ['landlords', filters],
  leases: (filters?: any) => ['leases', filters],
  workOrders: (filters?: any) => ['workOrders', filters],
  vendors: (filters?: any) => ['vendors', filters],
  portfolio: (role?: string, filters?: any) => ['portfolio', role, filters],
  search: (query: string) => ['search', query],
};

/**
 * Properties Hook
 */
export function useProperties(filters?: { landlordId?: string; propertyId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.properties(filters),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters?.landlordId) queryParams.append('landlordId', filters.landlordId);
      if (filters?.propertyId) queryParams.append('propertyId', filters.propertyId);
      if (filters?.page) queryParams.append('page', String(filters.page));
      if (filters?.limit) queryParams.append('limit', String(filters.limit));
      
      const response = await apiClient(`/api/v1/properties?${queryParams.toString()}`, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    },
    enabled: true,
  });
}

/**
 * Tenants Hook
 */
export function useTenants(filters?: { landlordId?: string; propertyId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.tenants(filters),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters?.landlordId) queryParams.append('landlordId', filters.landlordId);
      if (filters?.propertyId) queryParams.append('propertyId', filters.propertyId);
      if (filters?.page) queryParams.append('page', String(filters.page));
      if (filters?.limit) queryParams.append('limit', String(filters.limit));
      
      const response = await apiClient(`/api/v1/tenants?${queryParams.toString()}`, { method: 'GET' });
      const data = await response.json();
      return data;
    },
    enabled: true,
  });
}

/**
 * Landlords Hook
 */
export function useLandlords(filters?: { pmcId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.landlords(filters),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters?.pmcId) queryParams.append('pmcId', filters.pmcId);
      if (filters?.page) queryParams.append('page', String(filters.page));
      if (filters?.limit) queryParams.append('limit', String(filters.limit));
      
      const response = await apiClient(`/api/v1/landlords?${queryParams.toString()}`, { method: 'GET' });
      const data = await response.json();
      return data;
    },
    enabled: true,
  });
}

/**
 * Leases Hook
 */
export function useLeases(filters?: { landlordId?: string; propertyId?: string; tenantId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.leases(filters),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters?.landlordId) queryParams.append('landlordId', filters.landlordId);
      if (filters?.propertyId) queryParams.append('propertyId', filters.propertyId);
      if (filters?.tenantId) queryParams.append('tenantId', filters.tenantId);
      if (filters?.page) queryParams.append('page', String(filters.page));
      if (filters?.limit) queryParams.append('limit', String(filters.limit));
      
      const response = await apiClient(`/api/v1/leases?${queryParams.toString()}`, { method: 'GET' });
      const data = await response.json();
      return data;
    },
    enabled: true,
  });
}

/**
 * Work Orders Hook (Maintenance Requests)
 */
export function useWorkOrders(filters?: { 
  propertyId?: string; 
  tenantId?: string; 
  status?: string; 
  priority?: string;
  page?: number; 
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.workOrders(filters),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters?.propertyId) queryParams.append('propertyId', filters.propertyId);
      if (filters?.tenantId) queryParams.append('tenantId', filters.tenantId);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.priority) queryParams.append('priority', filters.priority);
      if (filters?.page) queryParams.append('page', String(filters.page));
      if (filters?.limit) queryParams.append('limit', String(filters.limit));
      
      const response = await apiClient(`/api/v1/maintenance?${queryParams.toString()}`, { method: 'GET' });
      const data = await response.json();
      return data;
    },
    enabled: true,
  });
}

/**
 * Vendors Hook (Service Providers)
 */
export function useVendors(filters?: { type?: string; page?: number; limit?: number }) {
  // Use FastAPI backend if available, fallback to Next.js API
  const useFastAPI = process.env.NEXT_PUBLIC_USE_FASTAPI === 'true';
  const baseUrl = useFastAPI 
    ? (process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000')
    : '';
  
  return useQuery({
    queryKey: queryKeys.vendors(filters),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.page) queryParams.append('page', String(filters.page));
      if (filters?.limit) queryParams.append('limit', String(filters.limit));
      
      if (useFastAPI) {
        // Call FastAPI backend
        const token = localStorage.getItem('auth_token'); // TODO: Get from auth context
        const response = await fetch(`${baseUrl}/api/v1/vendors?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch vendors: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } else {
        // Call Next.js API (existing)
        const response = await apiClient(`/api/v1/vendors?${queryParams.toString()}`, { method: 'GET' });
        if (!response.ok) {
          throw new Error(`Failed to fetch vendors: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      }
    },
    enabled: true,
  });
}

/**
 * Portfolio Hook
 */
export function usePortfolio(role?: string, filters?: any) {
  return useQuery({
    queryKey: queryKeys.portfolio(role, filters),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      queryParams.append('includeStats', 'true');
      
      const response = await apiClient(`/api/v1/portfolio/summary?${queryParams.toString()}`, { method: 'GET' });
      const data = await response.json();
      return data;
    },
    enabled: !!role,
  });
}

/**
 * Global Search Hook
 */
export function useGlobalSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: async () => {
      const response = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data;
    },
    enabled: enabled && query.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Update Work Order Status Mutation
 */
export function useUpdateWorkOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiClient(`/api/v1/maintenance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error(`Failed to update work order: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      // Invalidate work orders queries
      queryClient.invalidateQueries({ queryKey: queryKeys.workOrders() });
    },
  });
}

