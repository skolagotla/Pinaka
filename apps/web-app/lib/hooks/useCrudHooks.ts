/**
 * Generic CRUD hooks factory
 * 
 * Creates standardized React Query hooks for CRUD operations.
 * Eliminates duplication across entity hooks (properties, tenants, landlords, etc.)
 */
"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v2Api } from '@/lib/api/v2-client';

/**
 * Creates CRUD hooks for an entity type
 * 
 * Replaces the repeated pattern of:
 * - useListEntity
 * - useEntity
 * - useCreateEntity
 * - useUpdateEntity
 * - useDeleteEntity
 * 
 * @param entityName - Entity name (e.g., 'properties', 'tenants')
 * @param staleTime - Cache stale time in milliseconds
 * @param apiMethods - Object with API methods: { list, get, create, update, delete }
 */
export function createCrudHooks<TListParams = any, TGetParams = string, TCreate = any, TUpdate = any>(
  entityName: string,
  staleTime: number,
  apiMethods: {
    list: (params?: TListParams) => Promise<any[]>;
    get: (id: TGetParams) => Promise<any>;
    create: (data: TCreate) => Promise<any>;
    update: (id: string, data: TUpdate) => Promise<any>;
    delete?: (id: string) => Promise<void>;
  }
) {
  const queryKey = (id?: string) => ['v2', entityName, id].filter(Boolean);

  const useList = (params?: TListParams) => {
    return useQuery({
      queryKey: queryKey(JSON.stringify(params)),
      queryFn: () => apiMethods.list(params),
      staleTime,
    });
  };

  const useGet = (id: TGetParams, enabled = true) => {
    return useQuery({
      queryKey: queryKey(String(id)),
      queryFn: () => apiMethods.get(id),
      enabled: enabled && !!id,
      staleTime,
    });
  };

  const useCreate = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: TCreate) => apiMethods.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKey() });
      },
    });
  };

  const useUpdate = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: TUpdate }) =>
        apiMethods.update(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: queryKey() });
        queryClient.invalidateQueries({ queryKey: queryKey(variables.id) });
      },
    });
  };

  const useDelete = apiMethods.delete
    ? () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: (id: string) => apiMethods.delete!(id),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKey() });
          },
        });
      }
    : undefined;

  return {
    [`use${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`]: useList,
    [`use${entityName.charAt(0).toUpperCase() + entityName.slice(1).slice(0, -1)}`]: useGet,
    [`useCreate${entityName.charAt(0).toUpperCase() + entityName.slice(1).slice(0, -1)}`]: useCreate,
    [`useUpdate${entityName.charAt(0).toUpperCase() + entityName.slice(1).slice(0, -1)}`]: useUpdate,
    ...(useDelete && {
      [`useDelete${entityName.charAt(0).toUpperCase() + entityName.slice(1).slice(0, -1)}`]: useDelete,
    }),
  };
}

