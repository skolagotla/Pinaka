/**
 * Auth0 Route Handler
 * 
 * This catch-all route handles all Auth0 authentication routes:
 * - /auth/login
 * - /auth/logout
 * - /auth/callback
 * - /auth/me
 * 
 * For Auth0 SDK v4 with App Router, we use the recommended pattern.
 */

import type { NextRequest } from 'next/server';

// Check if Auth0 is configured
const isAuth0Configured = () => {
  return !!(
    process.env.AUTH0_SECRET &&
    process.env.AUTH0_BASE_URL &&
    process.env.AUTH0_ISSUER_BASE_URL &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_CLIENT_SECRET
  );
};

// Initialize Auth0 client
let authClient: any = null;
let initError: any = null;

async function getAuthClient() {
  // Return cached client if available
  if (authClient !== null) {
    return authClient;
  }

  // Return null if we've already tried and failed
  if (initError !== null) {
    return null;
  }

  // If Auth0 is not configured, return null
  if (!isAuth0Configured()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth0 Route] Auth0 not configured - environment variables missing');
    }
    return null;
  }

  try {
    // Import Auth0 server module - use Auth0Client as per SDK v4 docs
    const auth0Server = await import('@auth0/nextjs-auth0/server');
    const { Auth0Client } = auth0Server;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth0 Route] Initializing Auth0Client');
      console.log('[Auth0 Route] App Base URL:', process.env.AUTH0_BASE_URL);
      console.log('[Auth0 Route] Issuer:', process.env.AUTH0_ISSUER_BASE_URL);
    }
    
    // Create Auth0Client instance - it uses environment variables automatically
    // The SDK reads from: AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET, APP_BASE_URL
    // But we're using: AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET, AUTH0_BASE_URL
    // So we need to map them or set them correctly
    
    // Check if we need to set AUTH0_DOMAIN from AUTH0_ISSUER_BASE_URL
    let domain = process.env.AUTH0_DOMAIN;
    if (!domain && process.env.AUTH0_ISSUER_BASE_URL) {
      domain = process.env.AUTH0_ISSUER_BASE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
      process.env.AUTH0_DOMAIN = domain;
    }
    
    if (!process.env.APP_BASE_URL && process.env.AUTH0_BASE_URL) {
      process.env.APP_BASE_URL = process.env.AUTH0_BASE_URL;
    }
    
    // Create Auth0Client with explicit configuration
    // Map our env vars to what SDK expects
    const client = new Auth0Client({
      domain: domain || '',
      clientId: process.env.AUTH0_CLIENT_ID || '',
      clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
      secret: process.env.AUTH0_SECRET || '',
      appBaseUrl: process.env.AUTH0_BASE_URL || 'http://localhost:3000',
      signInReturnToPath: '/', // Redirect to home after login
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth0 Route] Auth0Client initialized successfully');
    }
    
    authClient = client;
    return client;
  } catch (error: any) {
    initError = error;
    if (process.env.NODE_ENV === 'development') {
      console.error('[Auth0 Route] Failed to initialize AuthClient');
      console.error('[Auth0 Route] Error:', error?.message || error);
      console.error('[Auth0 Route] Stack:', error?.stack);
    }
    return null;
  }
}

// Fallback handler
function handleAuthFallback(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Auth0 Route] Using fallback handler for:', pathname);
  }
  
  // For login requests, show error message instead of redirecting
  if (pathname.includes('/login')) {
    return new Response(
      JSON.stringify({ 
        error: 'Authentication service not available',
        message: 'Auth0 is not properly configured. Please check your environment variables and server logs.'
      }), 
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
  
  // For callback, redirect to home with error
  if (pathname.includes('/callback')) {
    return Response.redirect(new URL('/?error=auth_failed', url.origin), 302);
  }
  
  // For logout, redirect to home
  if (pathname.includes('/logout')) {
    return Response.redirect(new URL('/', url.origin), 302);
  }
  
  // For /me or /profile, return empty user object
  if (pathname.includes('/me') || pathname.includes('/profile')) {
    return Response.json({ user: null }, { status: 200 });
  }
  
  // For other routes, return 404
  return new Response(
    JSON.stringify({ error: 'Authentication service not available' }), 
    { 
      status: 404, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth0 Route] GET request to:', pathname);
  }
  
  try {
    const client = await getAuthClient();
    if (client) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth0 Route] Calling AuthClient.handler()');
      }
      
      // Auth0Client uses middleware() method for route handling
      const response = await client.middleware(request);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth0 Route] Response status:', response.status);
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('location');
          console.log('[Auth0 Route] Redirect to:', location);
        }
      }
      
      return response;
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Auth0 Route] AuthClient is null - check initialization errors above');
      }
    }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Auth0 Route] Error in GET handler');
      console.error('[Auth0 Route] Error message:', error?.message || error);
      console.error('[Auth0 Route] Error stack:', error?.stack);
    }
  }
  
  return handleAuthFallback(request);
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth0 Route] POST request to:', pathname);
  }
  
  try {
    const client = await getAuthClient();
    if (client) {
      return await client.middleware(request);
    }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Auth0 Route] Error in POST handler:', error?.message || error);
      console.error('[Auth0 Route] Error stack:', error?.stack);
    }
  }
  
  return handleAuthFallback(request);
}
