/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN GOOGLE OAUTH - INITIATE LOGIN (App Router)
 * ═══════════════════════════════════════════════════════════════
 * GET /admin/auth/google
 * 
 * Initiates Google OAuth flow for admin login
 * ═══════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/admin/google-oauth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');

    // Get Google OAuth authorization URL
    const authUrl = getAuthUrl(state || (null as any));

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('[Admin Auth] Error initiating Google OAuth:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate authentication',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

