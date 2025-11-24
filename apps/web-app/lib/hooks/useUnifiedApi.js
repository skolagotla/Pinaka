/**
 * useUnifiedApi Hook
 * 
 * Unified API hook that combines:
 * - Error handling from useApiErrorHandler
 * - Advanced features from api-client.js (caching, retry, deduplication)
 * - State management from useApiClient
 * - Simple API like fetchWithErrorHandling
 * 
 * This replaces the 133+ fetchWithErrorHandling calls across the codebase
 * 
 * Features:
 * - Automatic error handling with user-friendly messages
 * - Request caching (configurable)
 * - Request deduplication (prevents duplicate simultaneous requests)
 * - Automatic retry with exponential backoff
 * - Request cancellation on unmount
 * - Loading and error states
 * - Optimistic updates support
 * 
 * @example
 * // Simple usage (replaces fetchWithErrorHandling)
 * const { fetch } = useUnifiedApi();
 * const response = await fetch('/api/properties', { method: 'GET' });
 * const data = await response.json();
 * 
 * @example
 * // With caching
 * const { fetch } = useUnifiedApi({ cache: true, cacheTTL: 60000 });
 * const response = await fetch('/api/properties');
 * 
 * @example
 * // With state management
 * const { get, loading, error, data } = useUnifiedApi();
 * useEffect(() => {
 *   get('/api/properties');
 * }, []);
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { App } from 'antd';
import { apiClient } from '../utils/api-client';

export function useUnifiedApi(options = {}) {
  const { message } = App.useApp();
  
  const {
    // Error handling options
    showUserMessage = true,
    logErrors = true,
    defaultErrorMessage = 'An error occurred. Please try again.',
    
    // API client options
    cache = true, // Enable caching by default for better performance
    cacheTTL = 30000,
    timeout = 30000,
    retry = true,
    dedupe = true,
  } = options;
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // Store abort controllers for cleanup
  const abortControllersRef = useRef([]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllersRef.current.forEach(controller => {
        if (controller && !controller.signal.aborted) {
          controller.abort();
        }
      });
      abortControllersRef.current = [];
    };
  }, []);
  
  /**
   * Extract error message from API response
   */
  const extractErrorMessage = useCallback(async (response) => {
    const status = response.status;
    const statusText = response.statusText;
    let errorMessage = defaultErrorMessage;
    let errorDetails = null;
    
    try {
      const contentType = response.headers.get('content-type');
      let responseText = '';
      
      try {
        responseText = await response.text();
      } catch (textError) {
        errorMessage = `${defaultErrorMessage} (HTTP ${status}: ${statusText})`;
        return { errorMessage, errorDetails: { status, statusText } };
      }
      
      if (responseText && responseText.trim()) {
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData?.message || errorData?.error || errorData?.details || errorMessage;
            
            if (errorData && typeof errorData === 'object') {
              const cleanDetails = {};
              Object.keys(errorData).forEach(key => {
                const value = errorData[key];
                if (value !== undefined && value !== null && typeof value !== 'object') {
                  cleanDetails[key] = value;
                }
              });
              if (Object.keys(cleanDetails).length > 0) {
                errorDetails = cleanDetails;
              }
            }
            
            // Simplify common error patterns
            if (errorMessage && typeof errorMessage === 'string') {
              if (errorMessage.includes('Invalid `prisma.')) {
                errorMessage = 'Invalid data. Please check all fields and try again.';
              } else if (errorMessage.includes('P2002')) {
                errorMessage = 'A record with this information already exists.';
              } else if (errorMessage.includes('P2025')) {
                errorMessage = 'Record not found.';
              }
            }
          } catch (parseError) {
            errorMessage = responseText.substring(0, 200) || errorMessage;
            errorDetails = { rawResponse: responseText.substring(0, 500) };
          }
        } else {
          errorMessage = responseText.substring(0, 200) || errorMessage;
          errorDetails = { rawResponse: responseText.substring(0, 500) };
        }
      }
    } catch (e) {
      errorMessage = `${defaultErrorMessage} (HTTP ${status}: ${statusText})`;
      errorDetails = { 
        status, 
        statusText,
        readError: e?.message || 'Failed to read response'
      };
    }
    
    if (errorMessage === defaultErrorMessage && status !== 200) {
      errorMessage = `${errorMessage} (HTTP ${status}: ${statusText})`;
    }
    
    return { errorMessage, errorDetails };
  }, [defaultErrorMessage]);
  
  /**
   * Handle API error response
   */
  const handleApiError = useCallback(async (response, context = {}) => {
    if (!response || typeof response !== 'object') {
      const errorMsg = 'Invalid response object received';
      if (logErrors) {
        console.error(`[API Error] ${context.operation || 'Operation'} failed:`, errorMsg);
      }
      return new Error(errorMsg);
    }

    // Don't handle abort errors as API errors
    if (response.status === 0 || response.statusText === 'aborted') {
      return new Error('Request aborted');
    }

    let errorMessage = defaultErrorMessage;
    let errorDetails = null;
    
    try {
      const result = await extractErrorMessage(response);
      errorMessage = result?.errorMessage || defaultErrorMessage;
      errorDetails = result?.errorDetails || null;
    } catch (extractError) {
      // Don't log abort errors
      if (extractError?.message?.includes('aborted') || extractError?.message?.includes('signal is aborted')) {
        return new Error('Request aborted');
      }
      errorMessage = `Failed to extract error message (HTTP ${response?.status || 'unknown'}: ${response?.statusText || 'unknown'})`;
      errorDetails = { 
        extractError: extractError?.message || 'Unknown extraction error',
        status: response?.status,
        statusText: response?.statusText,
      };
    }
    
    // Don't log or show abort-related errors
    if (errorMessage?.includes('aborted') || errorMessage?.includes('signal is aborted')) {
      return new Error('Request aborted');
    }
    
    if (logErrors) {
      const errorInfo = {
        status: response?.status || 'unknown',
        statusText: response?.statusText || 'unknown',
        url: context?.url || 'unknown',
        error: errorMessage,
        operation: context?.operation || 'Unknown operation'
      };
      
      if (errorDetails && typeof errorDetails === 'object' && Object.keys(errorDetails).length > 0) {
        errorInfo.details = errorDetails;
      }
      
      console.error(`[API Error] ${errorInfo.operation} failed:`, JSON.stringify(errorInfo, null, 2));
    }
    
    if (showUserMessage && context.showUserMessage !== false) {
      try {
        if (message && typeof message.error === 'function') {
          message.error(errorMessage || 'An error occurred');
        }
      } catch (msgError) {
        console.warn('[useUnifiedApi] Failed to show user message:', msgError);
      }
    }
    
    const finalErrorMessage = (typeof errorMessage === 'string' && errorMessage.trim()) 
      ? errorMessage 
      : 'An error occurred';
    return new Error(finalErrorMessage);
  }, [extractErrorMessage, logErrors, showUserMessage, message, defaultErrorMessage]);
  
  /**
   * Handle fetch errors (network errors, etc.)
   */
  const handleFetchError = useCallback((error, context = {}) => {
    // Don't log or show abort errors - they're expected during cleanup
    if (error?.name === 'AbortError' || 
        error?.message?.includes('aborted') || 
        error?.message?.includes('signal is aborted')) {
      return error instanceof Error ? error : new Error('Request aborted');
    }
    
    const errorMessage = error?.message || String(error) || defaultErrorMessage;
    
    if (logErrors) {
      const errorInfo = {
        error: errorMessage,
        errorType: error?.name || 'FetchError',
        operation: context?.operation || 'Unknown operation',
        ...(error?.stack && { stack: error.stack.substring(0, 500) })
      };
      
      if (context?.url) {
        errorInfo.url = String(context.url);
      }
      
      console.error(`[Fetch Error] ${errorInfo.operation} failed:`, JSON.stringify(errorInfo, null, 2));
    }
    
    if (showUserMessage && context.showUserMessage !== false) {
      message.error(errorMessage || 'An error occurred');
    }
    
    return error instanceof Error ? error : new Error(errorMessage);
  }, [logErrors, showUserMessage, message, defaultErrorMessage]);
  
  /**
   * Main fetch function (replaces fetchWithErrorHandling)
   */
  const fetch = useCallback(async (url, options = {}, context = {}) => {
    setLoading(true);
    setError(null);
    
    // Create abort controller
    const controller = new AbortController();
    abortControllersRef.current.push(controller);
    
    try {
      const response = await apiClient(url, {
        ...options,
        cache,
        cacheTTL,
        timeout,
        retry,
        dedupe,
        signal: controller.signal,
      });
      
      if (!response.ok) {
        const apiError = await handleApiError(response, context);
        setError(apiError.message);
        throw apiError;
      }
      
      // Clone response before reading body (body can only be read once)
      const responseToReturn = response.clone ? response.clone() : response;
      
      // Parse response for internal state
      let responseData = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        setData(responseData);
      } else if (response.status === 204) {
        responseData = null;
      } else {
        responseData = await response.text();
      }
      
      // Return cloned response so caller can read body if needed
      return responseToReturn;
    } catch (err) {
      // Don't set error, log, or show message if request was aborted (expected during cleanup)
      if (err.name === 'AbortError' || 
          err.message?.includes('aborted') || 
          err.message?.includes('signal is aborted')) {
        // Silently ignore abort errors - they're expected during component cleanup
        return null;
      }
      
      // If error is already an Error object from handleApiError, use it
      if (err instanceof Error) {
        if (err.message && !err.message.includes('HTTP')) {
          // Network error - handle it
          const fetchError = handleFetchError(err, context);
          setError(fetchError.message);
          throw fetchError;
        }
        // API error - already handled
        setError(err.message);
        throw err;
      }
      
      // Unknown error type - wrap it
      const fetchError = handleFetchError(err instanceof Error ? err : new Error(String(err)), context);
      setError(fetchError.message);
      throw fetchError;
    } finally {
      setLoading(false);
      // Remove controller from ref
      abortControllersRef.current = abortControllersRef.current.filter(c => c !== controller);
    }
  }, [handleApiError, handleFetchError, cache, cacheTTL, timeout, retry, dedupe]);
  
  /**
   * Convenience methods (similar to useApiClient)
   */
  const get = useCallback(async (url, options = {}, context = {}) => {
    return fetch(url, { ...options, method: 'GET' }, context);
  }, [fetch]);
  
  const post = useCallback(async (url, data, options = {}, context = {}) => {
    return fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    }, context);
  }, [fetch]);
  
  const patch = useCallback(async (url, data, options = {}, context = {}) => {
    return fetch(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    }, context);
  }, [fetch]);
  
  const del = useCallback(async (url, options = {}, context = {}) => {
    return fetch(url, { ...options, method: 'DELETE' }, context);
  }, [fetch]);
  
  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);
  
  return {
    // State
    loading,
    error,
    data,
    
    // Main fetch function (replaces fetchWithErrorHandling)
    fetch,
    
    // Convenience methods
    get,
    post,
    patch,
    delete: del,
    
    // Utilities
    reset,
  };
}

export default useUnifiedApi;

