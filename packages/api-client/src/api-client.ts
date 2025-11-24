/**
 * Typed API Client for FastAPI v2
 * 
 * Generated from FastAPI OpenAPI spec using openapi-fetch
 */

import createClient from "openapi-fetch";
import type { paths } from "@pinaka/shared-types/v2-api";

const API_BASE_URL = 
  typeof window !== "undefined" 
    ? process.env.NEXT_PUBLIC_API_V2_BASE_URL || "http://localhost:8000/api/v2"
    : process.env.API_V2_BASE_URL || "http://localhost:8000/api/v2";

/**
 * Typed API client instance
 * 
 * Usage:
 *   const { data, error } = await api.GET("/api/v2/properties");
 *   const { data, error } = await api.POST("/api/v2/properties", { body: {...} });
 */
export const api = createClient<paths>({
  baseUrl: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Helper to get auth headers
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

/**
 * API client with authentication
 */
export const authenticatedApi = createClient<paths>({
  baseUrl: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  },
});

// Re-export types for convenience
export type { paths, components } from "@pinaka/shared-types/v2-api";

