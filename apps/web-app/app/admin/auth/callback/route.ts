/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN GOOGLE OAUTH - CALLBACK HANDLER (App Router)
 * ═══════════════════════════════════════════════════════════════
 * GET /admin/auth/callback
 * 
 * Handles Google OAuth callback and creates admin session
 * ═══════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server';
// Google OAuth moved to API route to avoid bundling server-only packages
// import { getTokensFromCode, verifyIdToken } from '@/lib/admin/google-oauth';
// import { createSession } from '@/lib/admin/session';
// const { prisma } = require('@/lib/prisma');

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : req.headers.get('x-real-ip') || 'unknown';
  return ip || 'unknown';
}

function getUserAgent(req: NextRequest): string {
  return req.headers.get('user-agent') || 'Unknown';
}

// NOTE: All Prisma operations have been moved to FastAPI backend
// This route forwards to /api/admin/auth/callback which handles all authentication

export async function GET(request: NextRequest) {
  // Redirect to API route for Google OAuth callback handling
  // This avoids bundling server-only packages (google-auth-library) in the web app
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const origin = request.nextUrl.origin || new URL(request.url).origin;
  
  // Build API route URL
  // In Next.js server routes, process.env is available
  // @ts-ignore - process.env is available in Next.js server routes
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const apiUrl = new URL('/api/admin/auth/callback', apiBaseUrl);
  if (code) apiUrl.searchParams.set('code', code);
  if (error) apiUrl.searchParams.set('error', error);
  
  // Forward the request to the API server
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
    
    // If API sets cookies, forward them
    const setCookieHeaders = response.headers.getSetCookie();
    const redirectResponse = NextResponse.redirect(new URL('/admin/dashboard', origin));
    setCookieHeaders.forEach(cookie => {
      redirectResponse.headers.append('Set-Cookie', cookie);
    });
    
    return redirectResponse;
  } catch (error: any) {
    console.error('[Admin Auth] Error forwarding to API:', error);
    return NextResponse.redirect(
      new URL(`/admin/login?error=${encodeURIComponent('Authentication failed')}`, origin)
    );
  }
}

