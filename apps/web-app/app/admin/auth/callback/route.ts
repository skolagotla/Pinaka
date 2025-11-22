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

async function validateAdminLogin(googleUser: any, ipAddress: string) {
  // 1. Check email exists in Admin table
  const admin = await prisma.admin.findUnique({
    where: { email: googleUser.email.toLowerCase() },
  });

  if (!admin) {
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action: 'login_failed',
        resource: 'admin',
        details: {
          email: googleUser.email,
          reason: 'Admin not found',
        },
        ipAddress,
        success: false,
        errorMessage: 'Admin not found',
        googleEmail: googleUser.email,
      },
    });
    throw new Error('Access denied: Admin not found');
  }

  // 2. Check admin is active
  if (!admin.isActive) {
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adminId: admin.id,
        action: 'login_failed',
        resource: 'admin',
        resourceId: admin.id,
        details: {
          reason: 'Account inactive',
        },
        ipAddress,
        success: false,
        errorMessage: 'Account is inactive',
        googleEmail: googleUser.email,
      },
    });
    throw new Error('Account is inactive');
  }

  // 3. Check account is not locked
  if (admin.isLocked) {
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adminId: admin.id,
        action: 'login_failed',
        resource: 'admin',
        resourceId: admin.id,
        details: {
          reason: 'Account locked',
        },
        ipAddress,
        success: false,
        errorMessage: 'Account is locked',
        googleEmail: googleUser.email,
      },
    });
    throw new Error('Account is locked');
  }

  // 4. Check email domain (if required)
  if (admin.allowedGoogleDomains.length > 0) {
    const emailDomain = `@${googleUser.email.split('@')[1]}`;
    if (!admin.allowedGoogleDomains.includes(emailDomain)) {
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          adminId: admin.id,
          action: 'login_failed',
          resource: 'admin',
          resourceId: admin.id,
          details: {
            reason: 'Domain not allowed',
            emailDomain,
          },
          ipAddress,
          success: false,
          errorMessage: 'Email domain not allowed',
          googleEmail: googleUser.email,
        },
      });
      throw new Error('Email domain not allowed');
    }
  }

  // 5. Check IP whitelist (if required)
  if (admin.requireIpWhitelist && admin.ipWhitelist.length > 0) {
    if (!admin.ipWhitelist.includes(ipAddress)) {
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          adminId: admin.id,
          action: 'login_failed',
          resource: 'admin',
          resourceId: admin.id,
          details: {
            reason: 'IP not whitelisted',
            ipAddress,
          },
          ipAddress,
          success: false,
          errorMessage: 'IP address not authorized',
          googleEmail: googleUser.email,
        },
      });
      throw new Error('IP address not authorized');
    }
  }

  // 6. Update last login
  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
      googleId: googleUser.googleId,
    },
  });

  return admin;
}

export async function GET(request: NextRequest) {
  // Redirect to API route for Google OAuth callback handling
  // This avoids bundling server-only packages (google-auth-library) in the web app
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const origin = request.nextUrl.origin || new URL(request.url).origin;
  
  // Build API route URL
  const apiUrl = new URL('/api/admin/auth/callback', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
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

