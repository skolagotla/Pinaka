/**
 * Auth0 Session Helper - DISABLED
 * 
 * Auth0 is completely disabled. Using password-based authentication only.
 * All Auth0 functions return null/empty to prevent errors.
 * This file exists to prevent import errors in code that references auth0.
 */

// Auth0 is completely disabled - return null for all functions
async function getAuth0Client() {
  return null;
}

// Create a wrapper that matches the expected API
// This wrapper ensures that getSession() NEVER throws - always returns null on error
export const auth0 = {
  getSession: async (req?: any, res?: any) => {
    // Auth0 disabled - return null
    return null;
  },
  
  middleware: async (request: any) => {
    // Auth0 disabled - return null (NextResponse.next() will be called by proxy)
    const { NextResponse } = await import('next/server');
    return NextResponse.next();
  },
};
