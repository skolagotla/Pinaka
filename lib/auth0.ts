/**
 * Auth0 Session Helper
 * 
 * This provides a helper to get Auth0 sessions in server components.
 * For Auth0 SDK v4 with App Router, we need to use the server package.
 * Gracefully handles missing Auth0 configuration.
 */

import { cookies, headers } from 'next/headers';

let auth0Client: any = null;
let auth0ClientPromise: Promise<any> | null = null;

async function getAuth0Client() {
  if (auth0Client !== null) {
    return auth0Client;
  }

  if (auth0ClientPromise !== null) {
    return auth0ClientPromise;
  }

  // Check if Auth0 is configured
  const isConfigured = !!(
    process.env.AUTH0_SECRET &&
    process.env.AUTH0_BASE_URL &&
    (process.env.AUTH0_ISSUER_BASE_URL || process.env.AUTH0_DOMAIN) &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_CLIENT_SECRET
  );

  if (!isConfigured) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth0] Auth0 not configured - continuing without authentication');
    }
    return null;
  }

  auth0ClientPromise = (async () => {
    try {
      const { Auth0Client } = await import('@auth0/nextjs-auth0/server');
      
      // Extract domain
      const issuerUrl = process.env.AUTH0_ISSUER_BASE_URL || process.env.AUTH0_DOMAIN || '';
      const domain = issuerUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      // Map environment variables
      if (!process.env.AUTH0_DOMAIN && domain) {
        process.env.AUTH0_DOMAIN = domain;
      }
      if (!process.env.APP_BASE_URL && process.env.AUTH0_BASE_URL) {
        process.env.APP_BASE_URL = process.env.AUTH0_BASE_URL;
      }
      
      const client = new Auth0Client({
        domain: domain,
        clientId: process.env.AUTH0_CLIENT_ID || '',
        clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
        secret: process.env.AUTH0_SECRET || '',
        appBaseUrl: process.env.AUTH0_BASE_URL || 'http://localhost:3000',
        signInReturnToPath: '/',
      });
      
      auth0Client = client;
      return client;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Auth0] Error loading Auth0:', error);
      }
      return null;
    }
  })();

  return auth0ClientPromise;
}

// Create a wrapper that matches the expected API
// This wrapper ensures that getSession() NEVER throws - always returns null on error
export const auth0 = {
  getSession: async (req?: any, res?: any) => {
    // Wrap everything in try-catch to ensure we never throw
    try {
      try {
        const client = await getAuth0Client();
        if (!client) {
          return null;
        }
        
        // If req is provided (Pages Router API routes), use it
        if (req) {
          try {
            const session = await client.getSession(req);
            return session || null;
          } catch (reqError) {
            // Silently fail - return null
            return null;
          }
        }
        
        // For App Router, try to get session
        // Auth0 SDK v4 should handle Next.js context automatically
        try {
          const session = await client.getSession();
          return session || null;
        } catch (sessionError) {
          // Silently fail - return null
          return null;
        }
      } catch (clientError) {
        // If client initialization fails, return null
        return null;
      }
    } catch (error) {
      // Final safety net - always return null, never throw
      return null;
    }
  },
  
  middleware: async (request: any) => {
    try {
      const client = await getAuth0Client();
      if (!client) {
        const { NextResponse } = await import('next/server');
        return NextResponse.next();
      }
      
      return await client.middleware(request);
    } catch (error) {
      // If middleware fails, log and pass through
      if (process.env.NODE_ENV === 'development') {
        console.error('[Auth0] Error in middleware:', error?.message || error);
      }
      const { NextResponse } = await import('next/server');
      return NextResponse.next();
    }
  }
};

