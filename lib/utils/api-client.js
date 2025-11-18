/**
 * API Client - Centralized HTTP client with interceptors, retry, caching, and cancellation
 * 
 * Features:
 * - Request/Response interceptors
 * - Automatic retry with exponential backoff
 * - Request deduplication
 * - Request cancellation (AbortController)
 * - Response caching (GET requests)
 * - Request timeout
 * - Optimistic updates support
 */

// Import cache utilities (only on server-side)
let getCache, setCache, shouldCache, getCacheConfig;
if (typeof window === 'undefined') {
  const cacheUtils = require('./api-cache');
  getCache = cacheUtils.getCache;
  setCache = cacheUtils.setCache;
  shouldCache = cacheUtils.shouldCache;
  getCacheConfig = cacheUtils.getCacheConfig;
}

// Request cache (simple in-memory cache)
const requestCache = new Map();
const CACHE_TTL = 30000; // 30 seconds default

// Active requests map for deduplication
const activeRequests = new Map();

// Request interceptors
const requestInterceptors = [];
const responseInterceptors = [];

/**
 * Add request interceptor
 * @param {Function} interceptor - Function to modify request before sending
 */
export function addRequestInterceptor(interceptor) {
  requestInterceptors.push(interceptor);
}

/**
 * Add response interceptor
 * @param {Function} interceptor - Function to modify response before returning
 */
export function addResponseInterceptor(interceptor) {
  responseInterceptors.push(interceptor);
}

/**
 * Generate cache key from URL and options
 */
function getCacheKey(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET') return null; // Only cache GET requests
  return `${method}:${url}`;
}

/**
 * Check if cached response is still valid
 */
function isCacheValid(cacheEntry) {
  if (!cacheEntry) return false;
  const now = Date.now();
  return (now - cacheEntry.timestamp) < cacheEntry.ttl;
}

/**
 * Create AbortController with timeout
 */
function createAbortController(timeout = 30000) {
  const controller = new AbortController();
  
  if (timeout > 0) {
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);
    
    // Store timeout ID for cleanup
    controller._timeoutId = timeoutId;
  }
  
  return controller;
}

/**
 * Clean up AbortController
 */
function cleanupAbortController(controller) {
  if (controller._timeoutId) {
    clearTimeout(controller._timeoutId);
  }
}

/**
 * Execute request with retry logic
 */
async function executeWithRetry(fetchFn, options = {}) {
  const {
    maxRetries = 2,
    retryDelay = 1000,
    backoffMultiplier = 2,
    retryableStatuses = [408, 429, 500, 502, 503, 504],
  } = options;
  
  let lastError;
  let currentDelay = retryDelay;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchFn();
      
      // Don't retry on success or non-retryable errors
      if (response.ok || !retryableStatuses.includes(response.status)) {
        return response;
      }
      
      // Retryable error - throw to trigger retry
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error;
      
      // Don't retry on abort or last attempt
      if (error.name === 'AbortError' || attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay *= backoffMultiplier;
    }
  }
  
  throw lastError;
}

/**
 * Main API client function
 */
export async function apiClient(url, options = {}) {
  const {
    method = 'GET',
    timeout = 30000,
    cache = method === 'GET', // Enable caching by default for GET requests
    cacheTTL = CACHE_TTL,
    retry = true,
    retryOptions = {},
    signal: externalSignal,
    dedupe = true,
    ...fetchOptions
  } = options;
  
  // Check in-memory API cache first (server-side only)
  if (typeof window === 'undefined' && method === 'GET' && shouldCache && shouldCache(url, method)) {
    const cached = getCache(url, method, {});
    if (cached) {
      // Return cached response as fetch Response-like object
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {
          get: (name) => name === 'content-type' ? 'application/json' : null,
        },
        json: async () => cached,
        text: async () => JSON.stringify(cached),
        clone: function() { return this; },
      };
    }
  }
  
  // Check cache for GET requests (browser only) - Stale-while-revalidate pattern
  let staleCache = null;
  if (typeof window !== 'undefined' && cache && method === 'GET') {
    const cacheKey = getCacheKey(url, options);
    if (cacheKey) {
      const cached = requestCache.get(cacheKey);
      if (cached) {
        // Return stale cache immediately if it exists (even if expired)
        staleCache = cached;
        if (isCacheValid(cached)) {
          // Cache is still fresh, return it
          return {
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: {
              get: (name) => name === 'content-type' ? 'application/json' : null,
            },
            json: async () => cached.data,
            text: async () => JSON.stringify(cached.data),
            clone: function() { return this; },
          };
        }
        // Cache is stale but exists - will revalidate in background
      }
    }
  }
  
  // Check for duplicate requests
  const requestKey = `${method}:${url}`;
  if (dedupe && activeRequests.has(requestKey)) {
    const existingRequest = activeRequests.get(requestKey);
    // Only return if it's a promise that resolves to a Response
    if (existingRequest && typeof existingRequest.then === 'function') {
      return existingRequest;
    }
    // If it's not a promise, continue with new request
  }
  
  // If we have stale cache, return it immediately and revalidate in background
  if (staleCache && typeof window !== 'undefined' && method === 'GET') {
    // Return stale cache immediately
    const staleResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {
        get: (name) => name === 'content-type' ? 'application/json' : null,
      },
      json: async () => staleCache.data,
      text: async () => JSON.stringify(staleCache.data),
      clone: function() { return this; },
    };
    
    // Revalidate in background (don't await)
    const revalidatePromise = (async () => {
      try {
        // Create abort controller for revalidation
        const controller = createAbortController(timeout);
        const signal = controller.signal;
        
        // Apply request interceptors
        let finalUrl = url;
        let finalOptions = {
          ...fetchOptions,
          method,
          signal,
          credentials: 'include', // Always include cookies for authentication
        };
        
        for (const interceptor of requestInterceptors) {
          const result = await interceptor(finalUrl, finalOptions);
          if (result) {
            finalUrl = result.url || finalUrl;
            finalOptions = { ...finalOptions, ...result.options };
          }
        }
        
        // Fetch fresh data
        const response = retry
          ? await executeWithRetry(
              () => fetch(finalUrl, finalOptions),
              retryOptions
            )
          : await fetch(finalUrl, finalOptions);
        
        if (response.ok) {
          // Update cache with fresh data
          const cacheKey = getCacheKey(url, options);
          if (cacheKey) {
            try {
              const responseForCache = response.clone ? response.clone() : response;
              const data = await responseForCache.json();
              requestCache.set(cacheKey, {
                data,
                timestamp: Date.now(),
                ttl: cacheTTL,
              });
            } catch (e) {
              // Ignore cache errors
            }
          }
        }
        
        cleanupAbortController(controller);
      } catch (e) {
        // Ignore revalidation errors - stale cache is still valid
      }
    })();
    
    // Don't store revalidation promise in activeRequests - it doesn't return a Response
    // The staleResponse is already returned, revalidation happens in background
    
    return staleResponse;
  }
  
  // Create abort controller
  const controller = createAbortController(timeout);
  const signal = externalSignal || controller.signal;
  
  // Apply request interceptors
  let finalUrl = url;
  let finalOptions = {
    ...fetchOptions,
    method,
    signal,
    credentials: 'include', // Always include cookies for authentication
  };
  
  for (const interceptor of requestInterceptors) {
    const result = await interceptor(finalUrl, finalOptions);
    if (result) {
      finalUrl = result.url || finalUrl;
      finalOptions = { ...finalOptions, ...result.options };
    }
  }
  
  // Create request promise
  const requestPromise = (async () => {
    try {
      // Execute with retry if enabled
      const response = retry
        ? await executeWithRetry(
            () => fetch(finalUrl, finalOptions),
            retryOptions
          )
        : await fetch(finalUrl, finalOptions);
      
      // Ensure we have a valid response
      if (!response) {
        throw new Error('Failed to get response from fetch');
      }
      
      // Clone response for interceptors (response can only be read once)
      const clonedResponse = response.clone ? response.clone() : response;
      
      // Apply response interceptors
      let finalResponse = clonedResponse;
      for (const interceptor of responseInterceptors) {
        const result = await interceptor(finalResponse, finalUrl, finalOptions);
        if (result) {
          finalResponse = result;
        }
      }
      
      // Ensure finalResponse is valid
      if (!finalResponse) {
        throw new Error('Response interceptor returned invalid response');
      }
      
      // Cache GET responses in in-memory cache (server-side only)
      if (typeof window === 'undefined' && method === 'GET' && finalResponse.ok && shouldCache && shouldCache(url, method)) {
        try {
          const responseForCache = finalResponse.clone ? finalResponse.clone() : finalResponse;
          const data = await responseForCache.json();
          const config = getCacheConfig(url);
          setCache(url, data, method, {}, config.ttl);
        } catch (e) {
          // Ignore cache errors
        }
      }
      
      // Cache GET responses if enabled (browser only)
      if (typeof window !== 'undefined' && cache && method === 'GET' && finalResponse.ok) {
        const cacheKey = getCacheKey(url, options);
        if (cacheKey) {
          try {
            // Clone response to read it without consuming the original
            const responseForCache = finalResponse.clone ? finalResponse.clone() : finalResponse;
            const data = await responseForCache.json();
            requestCache.set(cacheKey, {
              data,
              timestamp: Date.now(),
              ttl: cacheTTL,
            });
          } catch (e) {
            // Ignore cache errors
          }
        }
      }
      
      // If we had stale cache, return fresh response (stale-while-revalidate pattern)
      // The stale cache was already returned to the caller, and now we're updating it
      return finalResponse;
    } catch (error) {
      // If request was aborted, re-throw the abort error so calling code can handle it
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        throw error; // Re-throw abort errors - they're expected during cleanup
      }
      
      // For other errors, create a mock error response
      console.error('[apiClient] Error:', error);
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          get: () => 'application/json',
        },
        json: async () => ({ error: error.message || 'Failed to fetch', success: false }),
        text: async () => JSON.stringify({ error: error.message || 'Failed to fetch', success: false }),
        clone: function() { return this; },
      };
    } finally {
      // Cleanup
      cleanupAbortController(controller);
      if (dedupe) {
        activeRequests.delete(requestKey);
      }
    }
  })();
  
  // Store active request for deduplication
  if (dedupe) {
    activeRequests.set(requestKey, requestPromise);
  }
  
  return requestPromise;
}

/**
 * Clear request cache
 */
export function clearCache(pattern = null) {
  if (pattern) {
    // Clear specific pattern
    for (const [key] of requestCache) {
      if (key.includes(pattern)) {
        requestCache.delete(key);
      }
    }
  } else {
    // Clear all
    requestCache.clear();
  }
}

/**
 * Cancel active request
 */
export function cancelRequest(url, method = 'GET') {
  const requestKey = `${method}:${url}`;
  const request = activeRequests.get(requestKey);
  if (request && request.controller) {
    request.controller.abort();
    activeRequests.delete(requestKey);
  }
}

/**
 * GET request helper
 */
export async function apiGet(url, options = {}) {
  return apiClient(url, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost(url, data, options = {}) {
  return apiClient(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request helper
 */
export async function apiPatch(url, data, options = {}) {
  return apiClient(url, {
    ...options,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete(url, options = {}) {
  return apiClient(url, { ...options, method: 'DELETE' });
}

// Default request interceptor - add auth headers if available
if (typeof window !== 'undefined') {
  addRequestInterceptor(async (url, options) => {
    // Add any default headers here
    return {
      options: {
        ...options,
        headers: {
          ...options.headers,
        },
      },
    };
  });
}

