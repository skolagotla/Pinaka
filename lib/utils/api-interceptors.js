/**
 * API Interceptors Configuration
 * 
 * Centralized interceptors for request/response handling
 * - Request interceptor: Adds auth tokens, logging
 * - Response interceptor: Error logging, monitoring
 */

import { addRequestInterceptor, addResponseInterceptor } from './api-client';

/**
 * Initialize API interceptors
 * Call this once in your app initialization (e.g., _app.jsx or layout.jsx)
 */
export function initializeApiInterceptors() {
  // Request Interceptor: Add auth tokens and logging
  addRequestInterceptor(async (url, options) => {
    // Add any default headers
    const headers = {
      ...options.headers,
    };
    
    // Add auth token if available (from session/cookie)
    // Note: Next.js handles auth via cookies automatically, but you can add custom headers here
    if (typeof window !== 'undefined') {
      // You can add custom auth headers here if needed
      // const token = getAuthToken();
      // if (token) {
      //   headers['Authorization'] = `Bearer ${token}`;
      // }
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${options.method || 'GET'} ${url}`, {
        headers: Object.keys(headers),
        hasBody: !!options.body,
      });
    }
    
    return {
      options: {
        ...options,
        headers,
      },
    };
  });
  
  // Response Interceptor: Error logging and monitoring
  addResponseInterceptor(async (response, url, options) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${options.method || 'GET'} ${url}`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });
    }
    
    // Log errors for monitoring
    // Skip logging 401 errors for auth endpoints (expected when not logged in)
    const isAuthEndpoint = url.includes('/api/admin/auth/') || url.includes('/api/auth/');
    const isUnauthorized = response.status === 401;
    
    if (!response.ok && !(isAuthEndpoint && isUnauthorized)) {
      try {
        const errorData = await response.clone().json().catch(() => ({}));
        console.error(`[API Error] ${options.method || 'GET'} ${url}`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || errorData.message || 'Unknown error',
          ...(process.env.NODE_ENV === 'development' && {
            details: errorData,
          }),
        });
        
        // Send to error monitoring service (Sentry, DataDog, etc.)
        // Skip monitoring for expected 401 errors on auth endpoints
        if (typeof window !== 'undefined' && !(isAuthEndpoint && isUnauthorized)) {
          // Sentry integration
          if (window.Sentry) {
            window.Sentry.captureException(new Error(errorData.error || errorData.message), {
              tags: { apiEndpoint: url, method: options.method },
              extra: errorData,
            });
          }
          
          // DataDog integration (if available)
          if (window.DD_RUM && window.DD_RUM.addError) {
            window.DD_RUM.addError(new Error(errorData.error || errorData.message), {
              source: 'api',
              apiEndpoint: url,
              method: options.method,
              ...errorData,
            });
          }
          
          // Custom error monitoring hook (if available)
          if (window.reportError && typeof window.reportError === 'function') {
            try {
              const errorMessage = errorData.error || errorData.message || 'Unknown API error';
              const error = new Error(errorMessage);
              error.name = 'APIError';
              error.details = {
                type: 'api_error',
                endpoint: url,
                method: options.method,
                status: response.status,
                statusText: response.statusText,
                ...errorData,
              };
              window.reportError(error);
            } catch (e) {
              // Fallback if reportError doesn't accept Error object
              console.error('[API Error]', {
                type: 'api_error',
                endpoint: url,
                method: options.method,
                error: errorData.error || errorData.message,
                details: errorData,
              });
            }
          }
        }
        
        // Server-side error logging (for Next.js API routes)
        if (typeof window === 'undefined' && process.env.ERROR_MONITORING_ENABLED === 'true') {
          // Log to console in development, could be extended to send to monitoring service
          console.error('[API Error Monitoring]', {
            endpoint: url,
            method: options.method,
            error: errorData.error || errorData.message,
            details: errorData,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (e) {
        // Ignore logging errors
      }
    }
    
    return response;
  });
}

/**
 * Get auth token from session (if needed)
 * This is a placeholder - implement based on your auth system
 */
function getAuthToken() {
  if (typeof window === 'undefined') return null;
  
  // Example: Get from localStorage, cookie, or session
  // return localStorage.getItem('authToken');
  // or
  // return getCookie('authToken');
  
  return null;
}

