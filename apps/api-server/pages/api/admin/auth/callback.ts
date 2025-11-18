/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN GOOGLE OAUTH - CALLBACK HANDLER
 * ═══════════════════════════════════════════════════════════════
 * GET /api/admin/auth/callback
 * 
 * Handles Google OAuth callback and creates admin session
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getTokensFromCode, verifyIdToken } from '@/lib/admin/google-oauth';
import { createSession } from '@/lib/admin/session';
import { prisma } from '@/lib/prisma';
const config = require('@/lib/config/app-config').default || require('@/lib/config/app-config');
import { strictRateLimit } from '@/lib/middleware/rate-limiter';
import { logger, getCorrelationId } from '@/lib/utils/logger';

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : req.socket.remoteAddress;
  return ip || 'unknown';
}

function getUserAgent(req: NextApiRequest): string {
  return req.headers['user-agent'] || 'Unknown';
}

async function validateAdminLogin(googleUser: any, ipAddress: string) {
  // 1. Check email exists in Admin table
  const admin = await prisma.admin.findUnique({
    where: { email: googleUser.email.toLowerCase() },
  });

  if (!admin) {
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set logger context
  const correlationId = getCorrelationId(req);
  const ipAddress = getClientIp(req);
  logger.setContext({ correlationId, ipAddress });

  try {
    const { code, error } = req.query;

    // Handle OAuth errors
    if (error) {
      logger.error('OAuth error in callback', null, { error: error as string, correlationId });
      return res.redirect(`/admin/login?error=${encodeURIComponent(error as string)}`);
    }

    if (!code) {
      logger.warn('Missing authorization code', { correlationId });
      return res.redirect('/admin/login?error=missing_code');
    }

    const userAgent = getUserAgent(req);

    // Exchange authorization code for tokens
    const tokens = await getTokensFromCode(code as string);

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
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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

    // Set session cookie
    const cookieOptions = {
      httpOnly: true,
      secure: config.app.isProd,
      sameSite: 'lax' as const,
      maxAge: 30 * 60, // 30 minutes
      path: '/',
    };

    res.setHeader('Set-Cookie', [
      `admin_session=${session.token}; ${Object.entries(cookieOptions).map(([k, v]) => `${k}=${v}`).join('; ')}`,
    ]);

    // Redirect to admin dashboard
    logger.info('Admin login successful', { adminId: admin.id, email: admin.email, correlationId });
    res.redirect('/admin/dashboard');
  } catch (error: any) {
    logger.error('Admin auth callback failed', error, { correlationId, ipAddress });
    return res.redirect(`/admin/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`);
  }
}

// Apply strict rate limiting (5 requests per 15 minutes)
export default (req: NextApiRequest, res: NextApiResponse) => {
  strictRateLimit(req, res, () => handler(req, res));
};

