/**
 * Unified CRUD Hook - V2 Compliant
 * 
 * Single source of truth for all CRUD operations using:
 * - FastAPI v2 endpoints
 * - React Query for caching and state management
 * - Generated OpenAPI types
 * - Typed API client
 * 
 * Replaces: usePinakaCRUD, useCRUD, useV2CRUD, useCrudHooks
 * 
 * Usage:
 * ```tsx
 * const { data, isLoading, create, update, remove, refresh } = useUnifiedCRUD({
 *   entityName: 'properties',
 *   apiEndpoint: '/api/v2/properties',
 * });
 * ```
 */

"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v2Api } from '@/lib/api/v2-client';
import type { components } from '@pinaka/shared-types/v2-api';

export interface UseUnifiedCRUDOptions<T = any, TCreate = any, TUpdate = any> {
  entityName: string;
  apiEndpoint: string;
  initialData?: T[];
  staleTime?: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  transformResponse?: (data: any) => T | T[];
}

export function useUnifiedCRUD<T = any, TCreate = any, TUpdate = any>(
  options: UseUnifiedCRUDOptions<T, TCreate, TUpdate>
) {
  const {
    entityName,
    apiEndpoint,
    initialData = [],
    staleTime = 2 * 60 * 1000, // 2 minutes
    enabled = true,
    onSuccess,
    onError,
    transformResponse,
  } = options;

  const queryClient = useQueryClient();
  const queryKey = ['v2', entityName];

  // Transform response helper
  const transform = (data: any): T | T[] => {
    if (transformResponse) {
      return transformResponse(data);
    }
    // Default: handle paginated responses
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data as T[];
    }
    if (Array.isArray(data)) {
      return data as T[];
    }
    return data as T;
  };

  // List query
  const {
    data: queryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const token = v2Api.getToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2';
      const url = `${baseUrl}${apiEndpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return transform(data);
    },
    enabled,
    staleTime,
    initialData,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload: TCreate) => {
      const token = v2Api.getToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2';
      const url = `${baseUrl}${apiEndpoint}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return transform(data) as T;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      if (onSuccess) onSuccess(data as T);
    },
    onError: (error: Error) => {
      if (onError) onError(error);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data: payload }: { id: string; data: TUpdate }) => {
      const token = v2Api.getToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2';
      const url = `${baseUrl}${apiEndpoint}/${id}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return transform(data) as T;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      if (onSuccess) onSuccess(data as T);
    },
    onError: (error: Error) => {
      if (onError) onError(error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = v2Api.getToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2';
      const url = `${baseUrl}${apiEndpoint}/${id}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      if (onError) onError(error);
    },
  });

  // Get single item query
  const useGet = (id: string | null | undefined, enabled = true) => {
    return useQuery({
      queryKey: [...queryKey, id],
      queryFn: async () => {
        if (!id) return null;
        const token = v2Api.getToken();
        const baseUrl = process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2';
        const url = `${baseUrl}${apiEndpoint}/${id}`;
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return transform(data) as T;
      },
      enabled: enabled && !!id,
      staleTime,
    });
  };

  return {
    // Data
    data: (Array.isArray(queryData) ? queryData : queryData ? [queryData] : initialData) as T[],
    isLoading,
    isError,
    error,
    
    // Actions
    create: createMutation.mutateAsync,
    update: (id: string, data: TUpdate) => updateMutation.mutateAsync({ id, data }),
    remove: deleteMutation.mutateAsync,
    refresh: refetch,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Individual item query
    useGet,
  };
}

