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
import { getTokensFromCode, verifyIdToken } from '@/lib/admin/google-oauth';
import { createSession } from '@/lib/admin/session';
const { prisma } = require('@/lib/prisma');

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
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Get origin for consistent redirect URLs
    const origin = request.nextUrl.origin || new URL(request.url).origin;
    
    // Handle OAuth errors
    if (error) {
      console.error('[Admin Auth] OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/admin/login?error=${encodeURIComponent(error)}`, origin)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/login?error=missing_code', origin)
      );
    }

    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    // Exchange authorization code for tokens
    const tokens = await getTokensFromCode(code);

    if (!tokens.id_token) {
      throw new Error('No ID token received from Google');
    }

    // Verify ID token and get user info
    const googleUser = await verifyIdToken(tokens.id_token);

    // Validate admin login
    const admin = await validateAdminLogin(googleUser, ipAddress);

    // Create session
    const session = await createSession(
      admin.id,
      ipAddress,
      userAgent,
      tokens
    );

    // Log successful login
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adminId: admin.id,
        action: 'login_success',
        resource: 'admin',
        resourceId: admin.id,
        details: {
          googleId: googleUser.googleId,
        },
        ipAddress,
        userAgent,
        success: true,
        googleEmail: googleUser.email,
      },
    });

    // Create response with redirect
    // Use the origin from request to ensure correct protocol (http vs https)
    const redirectUrl = new URL('/admin/dashboard', origin);
    
    const response = NextResponse.redirect(redirectUrl);

    // Set session cookie
    response.cookies.set('admin_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[Admin Auth] Error in callback:', error);
    const origin = request.nextUrl.origin || new URL(request.url).origin;
    return NextResponse.redirect(
      new URL(
        `/admin/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`,
        origin
      )
    );
  }
}

