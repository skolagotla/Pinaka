/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN GOOGLE OAUTH - INITIATE LOGIN (App Router)
 * ═══════════════════════════════════════════════════════════════
 * GET /admin/auth/google
 * 
 * Redirects to API route for Google OAuth URL generation
 * This avoids bundling server-only packages (google-auth-library) in the web app
 * ═══════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Redirect to API route for Google OAuth URL generation
  // This avoids bundling server-only packages (google-auth-library) in the web app
  const origin = request.nextUrl.origin || new URL(request.url).origin;
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  
  const apiUrl = new URL('/api/admin/auth/google', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
  if (state) apiUrl.searchParams.set('state', state);
  
  try {
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
      redirect: 'manual', // Don't follow redirects, we'll handle them
    });
    
    // If API returns a redirect, extract the location and redirect
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        return NextResponse.redirect(new URL(location, origin));
      }
    }
    
    // Fallback: redirect to login with error
    return NextResponse.redirect(new URL('/admin/login?error=oauth_unavailable', origin));
  } catch (error: any) {
    console.error('[Admin Auth] Error forwarding to API:', error);
    return NextResponse.redirect(new URL('/admin/login?error=oauth_failed', origin));
  }
}
