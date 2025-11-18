/**
 * Service Worker for Caching and Offline Support
 * 
 * Caches static assets and API responses for offline access
 * Improves load times and provides offline functionality
 */

const CACHE_NAME = 'pinaka-v1';
const STATIC_CACHE_NAME = 'pinaka-static-v1';
const API_CACHE_NAME = 'pinaka-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  // Add other critical static assets
];

// API endpoints to cache (GET requests only)
const CACHEABLE_API_ENDPOINTS = [
  '/api/v1/properties',
  '/api/v1/tenants',
  // Add other cacheable endpoints
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

/**
 * Handle API requests with caching
 */
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  // Check if endpoint should be cached
  const shouldCache = CACHEABLE_API_ENDPOINTS.some(endpoint => 
    url.pathname.startsWith(endpoint)
  );

  if (!shouldCache) {
    // Don't cache, fetch from network
    return fetch(request);
  }

  // Try cache first, then network
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Return cached response, but also update in background
    fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    });
    return cachedResponse;
  }

  // Fetch from network and cache
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Network error, return cached response if available
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

/**
 * Handle static asset requests
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline page if available
    const offlinePage = await cache.match('/offline');
    return offlinePage || new Response('Offline', { status: 503 });
  }
}
