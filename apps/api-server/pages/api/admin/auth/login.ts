/**
 * Admin Password-Based Login
 * POST /api/admin/auth/login
 * 
 * Authenticates admin using email and password
 */

import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
const { createSession } = require('@/lib/admin/session');

// Simple function to get client IP
function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : req.socket.remoteAddress;
  return ip || 'unknown';
}

// Wrapper to ensure JSON responses even on unhandled errors
async function jsonHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any>
) {
  // Set JSON content type immediately
  res.setHeader('Content-Type', 'application/json');
  
  try {
    return await handler(req, res);
  } catch (error: any) {
    // Catch any unhandled errors and return JSON
    console.error('[API Handler] Unhandled error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error?.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error?.stack,
      }),
    });
  }
}

async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

      // Normalize email/username
      // Allow "superadmin" as user ID that maps to "superadmin@admin.local"
      // Allow "pmcadmin1" through "pmcadmin5" as user IDs (old format)
      // Allow "pmc1-admin" and "pmc2-admin" as user IDs (new format for AB Homes)
      let searchEmail = email.toLowerCase();
      if (searchEmail === 'superadmin') {
        searchEmail = 'superadmin@admin.local';
      } else if (searchEmail.match(/^pmcadmin[1-5]$/)) {
        searchEmail = `${searchEmail}@pmc.local`;
      } else if (searchEmail.match(/^pmc[12]-admin$/)) {
        // Map pmc1-admin -> pmc1-admin@pmc.local, pmc2-admin -> pmc2-admin@pmc.local
        searchEmail = `${searchEmail}@pmc.local`;
      }

    // Find admin by email
    let admin;
    try {
      admin = await prisma.admin.findUnique({
        where: { email: searchEmail },
      });
    } catch (dbError: any) {
      console.error('[Admin Login] Database error:', dbError);
      // Check if it's a connection error
      if (dbError.code === 'P1001' || dbError.code === 'P1017') {
        return res.status(500).json({
          success: false,
          error: 'Database connection failed',
          message: 'Unable to connect to database. Please check your database configuration.',
        });
      }
      throw dbError; // Re-throw other database errors
    }

    if (!admin) {
      // Log failed login attempt
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          action: 'login_failed',
          resource: 'admin',
          details: {
            email: email.toLowerCase(),
            reason: 'Admin not found',
          },
          ipAddress,
          success: false,
          errorMessage: 'Invalid email or password',
        },
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check if admin is active
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
        },
      });

      return res.status(401).json({
        success: false,
        error: 'Account is inactive',
      });
    }

    // Check if account is locked
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
        },
      });

      return res.status(401).json({
        success: false,
        error: 'Account is locked',
      });
    }

    // Check password
    // TEMPORARY: For testing, we use simple password matching
    // Special case: superadmin@admin.local uses password "superadmin"
    // Special case: pmcadmin1-5@pmc.local use password "pmcadmin"
    // Other admins use default password from env or "admin123"
    let passwordMatch = false;
    
    if (admin.email === 'superadmin@admin.local') {
      // Superadmin uses specific password
      passwordMatch = password === 'superadmin';
    } else if (admin.email.startsWith('pmcadmin') && admin.email.endsWith('@pmc.local')) {
      // PMC admin users use specific password
      passwordMatch = password === 'pmcadmin';
    } else {
      // Other admins use default password
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
      passwordMatch = password === defaultPassword;
    }

    // TODO: Add passwordHash field to Admin model and use bcrypt.compare
    // const passwordMatch = admin.passwordHash ? await bcrypt.compare(password, admin.passwordHash) : false;

    if (!passwordMatch) {
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          adminId: admin.id,
          action: 'login_failed',
          resource: 'admin',
          resourceId: admin.id,
          details: {
            reason: 'Invalid password',
          },
          ipAddress,
          success: false,
          errorMessage: 'Invalid email or password',
        },
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Create session
    const session = await createSession(
      admin.id,
      ipAddress,
      userAgent,
      null // No Google tokens for password login
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
          loginMethod: 'password',
        },
        ipAddress,
        userAgent,
        success: true,
      },
    });

    // Set session cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 30 * 60, // 30 minutes
      path: '/',
    };

    res.setHeader('Set-Cookie', [
      `admin_session=${session.token}; HttpOnly; Secure=${cookieOptions.secure}; SameSite=${cookieOptions.sameSite}; Max-Age=${cookieOptions.maxAge}; Path=${cookieOptions.path}`,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error('[Admin Login] Error:', error);
    console.error('[Admin Login] Error stack:', error.stack);
    
    // More detailed error logging
    if (error.code) {
      console.error('[Admin Login] Error code:', error.code);
    }
    if (error.meta) {
      console.error('[Admin Login] Error meta:', error.meta);
    }
    
    return res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message || 'An unexpected error occurred',
      // Only include detailed error in development
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          code: error.code,
          meta: error.meta,
        },
      }),
    });
  }
}

export default (req: NextApiRequest, res: NextApiResponse) => 
  jsonHandler(req, res, loginHandler);
