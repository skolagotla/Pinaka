/**
 * TypeScript type definitions for useApiCall hook
 */

export interface ApiCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showAlertOnError?: boolean;
}

export interface ApiCallResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiCallReturn {
  loading: boolean;
  error: string | null;
  data: any;
  execute: (url: string, fetchOptions?: RequestInit) => Promise<ApiCallResult>;
  get: <T = any>(url: string) => Promise<ApiCallResult<T>>;
  post: <T = any>(url: string, body: any) => Promise<ApiCallResult<T>>;
  patch: <T = any>(url: string, body: any) => Promise<ApiCallResult<T>>;
  del: <T = any>(url: string) => Promise<ApiCallResult<T>>;
  reset: () => void;
}

export function useApiCall(options?: ApiCallOptions): ApiCallReturn;

