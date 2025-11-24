/**
 * FastAPI v2 Backend API Client
 * 
 * Uses openapi-fetch for type-safe API calls
 */

import { api, authenticatedApi, getAuthHeaders } from "@pinaka/api-client";
import type { components, paths } from "@pinaka/shared-types/v2-api";

export interface ApiError {
  detail: string;
  status?: number;
}

// Re-export types for convenience
export type { components, paths };

/**
 * Get current auth token
 */
function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("v2_access_token");
  }
  return null;
}

/**
 * Set auth token
 */
export function setAuthToken(token: string | null) {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("v2_access_token", token);
    } else {
      localStorage.removeItem("v2_access_token");
    }
  }
  
  // Update authenticated client headers
  const headers = getAuthHeaders();
  Object.assign(authenticatedApi.headers, headers);
}

/**
 * Login and get token
 */
export async function login(email: string, password: string): Promise<{ token: string; user: any }> {
  const { data, error, response } = await api.POST("/api/v2/auth/login", {
    body: { email, password },
  });

  if (error || !data) {
    throw new Error(error?.detail || "Login failed");
  }

  const token = (data as any).access_token;
  if (token) {
    setAuthToken(token);
  }

  return { token, user: data };
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<any> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await authenticatedApi.GET("/api/v2/auth/me");

  if (error || !data) {
    throw new Error(error?.detail || "Failed to get user");
  }

  return data;
}

/**
 * Logout
 */
export function logout() {
  setAuthToken(null);
}

// Domain-specific API methods using typed client
export const v2Api = {
  // Auth
  login,
  getCurrentUser,
  logout,
  setAuthToken,

  // Properties
  async listProperties(filters?: any) {
    const { data, error } = await authenticatedApi.GET("/api/v2/properties", {
      params: { query: filters },
    });
    if (error) throw new Error(error.detail || "Failed to list properties");
    return data;
  },

  async getProperty(id: string) {
    const { data, error } = await authenticatedApi.GET("/api/v2/properties/{id}", {
      params: { path: { id } },
    });
    if (error) throw new Error(error.detail || "Failed to get property");
    return data;
  },

  async createProperty(property: components["schemas"]["PropertyCreate"]) {
    const { data, error } = await authenticatedApi.POST("/api/v2/properties", {
      body: property,
    });
    if (error) throw new Error(error.detail || "Failed to create property");
    return data;
  },

  async updateProperty(id: string, property: components["schemas"]["PropertyUpdate"]) {
    const { data, error } = await authenticatedApi.PATCH("/api/v2/properties/{id}", {
      params: { path: { id } },
      body: property,
    });
    if (error) throw new Error(error.detail || "Failed to update property");
    return data;
  },

  async deleteProperty(id: string) {
    const { data, error } = await authenticatedApi.DELETE("/api/v2/properties/{id}", {
      params: { path: { id } },
    });
    if (error) throw new Error(error.detail || "Failed to delete property");
    return data;
  },

  // Work Orders
  async listWorkOrders(filters?: any) {
    const { data, error } = await authenticatedApi.GET("/api/v2/work-orders", {
      params: { query: filters },
    });
    if (error) throw new Error(error.detail || "Failed to list work orders");
    return data;
  },

  async getWorkOrder(id: string) {
    const { data, error } = await authenticatedApi.GET("/api/v2/work-orders/{id}", {
      params: { path: { id } },
    });
    if (error) throw new Error(error.detail || "Failed to get work order");
    return data;
  },

  async createWorkOrder(workOrder: components["schemas"]["WorkOrderCreate"]) {
    const { data, error } = await authenticatedApi.POST("/api/v2/work-orders", {
      body: workOrder,
    });
    if (error) throw new Error(error.detail || "Failed to create work order");
    return data;
  },

  // Add more domain methods as needed...
};

export default v2Api;

