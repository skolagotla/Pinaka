/**
 * User Password-Based Login
 * POST /api/auth/login
 * 
 * Authenticates users (landlords, tenants, PMCs) using email and password
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { serialize } from 'cookie';

// Simple function to get client IP
function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : req.socket.remoteAddress;
  return ip || 'unknown';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    // Trim password to handle any accidental whitespace
    const trimmedPassword = password.trim();

    // Normalize email/username
    // Allow "pmcadmin1" through "pmcadmin5" as user IDs (old format)
    // Allow "pmc1-admin" and "pmc2-admin" as user IDs (new format for AB Homes)
    // Allow "pmc1-lld1" through "pmc1-lld10" as user IDs (landlords for AB Homes)
    // Also handle full email format: "pmc1-admin@pmc.local" or "pmc1-lld1@pmc.local"
    let searchEmail = email.toLowerCase().trim();
    if (searchEmail.match(/^pmcadmin[1-5]$/)) {
      searchEmail = `${searchEmail}@pmc.local`;
    } else if (searchEmail.match(/^pmc[12]-admin$/)) {
      // Map pmc1-admin -> pmc1-admin@pmc.local, pmc2-admin -> pmc2-admin@pmc.local
      searchEmail = `${searchEmail}@pmc.local`;
    } else if (searchEmail.match(/^pmc1-lld([1-9]|10)$/)) {
      // Map pmc1-lld1 -> pmc1-lld1@pmc.local, pmc1-lld2 -> pmc1-lld2@pmc.local, etc.
      searchEmail = `${searchEmail}@pmc.local`;
    } else if (searchEmail.match(/^pmc[12]-admin@pmc\.local$/) || searchEmail.match(/^pmc1-lld([1-9]|10)@pmc\.local$/)) {
      // Already in correct format, just use as-is
      // No change needed
    }
    
    console.log('[User Login] Email normalization:', {
      original: email,
      normalized: searchEmail,
    });

    // Check all user types: PMC Admin (via Admin), Landlord, Tenant, PMC
    let user: any = null;
    let userType: string | null = null;
    let userData: any = null;

    // First check if it's a PMC Admin (Admin user with PMC_ADMIN RBAC role)
    const admin = await prisma.admin.findUnique({
      where: { email: searchEmail },
    });

    console.log('[User Login] Checking admin:', {
      searchEmail,
      found: !!admin,
      adminId: admin?.id,
      isActive: admin?.isActive,
      isLocked: admin?.isLocked,
    });

    if (admin && admin.isActive && !admin.isLocked) {
      // Check if admin has PMC_ADMIN role
      const pmcAdminRole = await prisma.userRole.findFirst({
        where: {
          userId: admin.id,
          userType: 'admin',
          isActive: true,
          role: {
            name: 'PMC_ADMIN',
          },
        },
        include: {
          role: true,
          // Include PMC info if available
        },
      });

      console.log('[User Login] PMC Admin role check:', {
        adminId: admin.id,
        foundRole: !!pmcAdminRole,
        roleId: pmcAdminRole?.roleId,
        pmcId: pmcAdminRole?.pmcId,
      });

      if (pmcAdminRole) {
        // Check password for PMC admin
        let passwordMatch = false;
        // Check for old format (pmcadmin1-5) or new format (pmc1-admin, pmc2-admin)
        if ((admin.email.startsWith('pmcadmin') || admin.email.startsWith('pmc1-admin') || admin.email.startsWith('pmc2-admin')) && admin.email.endsWith('@pmc.local')) {
          passwordMatch = trimmedPassword === 'pmcadmin';
          console.log('[User Login] Password check (PMC admin):', {
            email: admin.email,
            providedPassword: trimmedPassword,
            providedPasswordLength: trimmedPassword.length,
            expectedPassword: 'pmcadmin',
            expectedPasswordLength: 'pmcadmin'.length,
            match: passwordMatch,
          });
        } else {
          const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
          passwordMatch = trimmedPassword === defaultPassword;
          console.log('[User Login] Password check (default):', {
            email: admin.email,
            providedPassword: trimmedPassword,
            expectedPassword: defaultPassword,
            match: passwordMatch,
          });
        }

        if (passwordMatch) {
          user = admin;
          userType = 'pmc';
          userData = {
            id: admin.id,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: 'pmc',
            pmcId: pmcAdminRole.pmcId,
          };
          console.log('[User Login] PMC Admin login successful:', {
            email: admin.email,
            pmcId: pmcAdminRole.pmcId,
          });
        } else {
          console.log('[User Login] Password mismatch for PMC Admin:', {
            email: admin.email,
            providedPassword: password,
          });
        }
      } else {
        console.log('[User Login] Admin found but no PMC_ADMIN role:', {
          email: admin.email,
          adminId: admin.id,
        });
      }
    } else if (admin) {
      console.log('[User Login] Admin found but inactive or locked:', {
        email: admin.email,
        isActive: admin.isActive,
        isLocked: admin.isLocked,
      });
    }

    // If not PMC Admin, check Landlord
    if (!user) {
      const landlord = await prisma.landlord.findUnique({
        where: { email: searchEmail },
      });

      if (landlord) {
        // Check password (temporary - using default password for PT DB)
        // TODO: Add passwordHash field to Landlord model
        // Special case: pmc1-lld1 through pmc1-lld10 use password "testlld"
        let passwordMatch = false;
        if (landlord.email.match(/^pmc1-lld([1-9]|10)@pmc\.local$/)) {
          passwordMatch = trimmedPassword === 'testlld';
          console.log('[User Login] Password check (PMC1 landlord):', {
            email: landlord.email,
            providedPassword: trimmedPassword,
            expectedPassword: 'testlld',
            match: passwordMatch,
          });
        } else {
          const defaultPassword = process.env.USER_DEFAULT_PASSWORD || 'password123';
          passwordMatch = trimmedPassword === defaultPassword;
          console.log('[User Login] Password check (default landlord):', {
            email: landlord.email,
            providedPassword: trimmedPassword,
            expectedPassword: defaultPassword,
            match: passwordMatch,
          });
        }

        if (passwordMatch) {
          user = landlord;
          userType = 'landlord';
          userData = {
            id: landlord.id,
            email: landlord.email,
            firstName: landlord.firstName,
            lastName: landlord.lastName,
            role: 'landlord',
            approvalStatus: landlord.approvalStatus,
          };
        }
      }
    }

    // If not found, check Tenant
    if (!user) {
      const tenant = await prisma.tenant.findUnique({
        where: { email: searchEmail },
      });

      if (tenant) {
        // Check password (temporary - using default password for PT DB)
        // TODO: Add passwordHash field to Tenant model
        const defaultPassword = process.env.USER_DEFAULT_PASSWORD || 'password123';
        const passwordMatch = password === defaultPassword;

        if (passwordMatch) {
          user = tenant;
          userType = 'tenant';
          userData = {
            id: tenant.id,
            email: tenant.email,
            firstName: tenant.firstName,
            lastName: tenant.lastName,
            role: 'tenant',
            hasAccess: tenant.hasAccess,
          };
        }
      }
    }

    // If not found, check PMC (PropertyManagementCompany)
    if (!user) {
      const pmc = await prisma.propertyManagementCompany.findUnique({
        where: { email: searchEmail },
      });

      if (pmc) {
        // Check password (temporary - using default password for PT DB)
        // TODO: Add passwordHash field to PropertyManagementCompany model
        const defaultPassword = process.env.USER_DEFAULT_PASSWORD || 'password123';
        const passwordMatch = password === defaultPassword;

        if (passwordMatch) {
          user = pmc;
          userType = 'pmc';
          userData = {
            id: pmc.id,
            email: pmc.email,
            companyName: pmc.companyName,
            role: 'pmc',
            approvalStatus: pmc.approvalStatus,
          };
        }
      }
    }

    if (!user || !userData) {
      // Log failed login attempt (we don't know the user type, so log generically)
      try {
        await prisma.adminAuditLog.create({
          data: {
            id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            adminId: null,
            action: 'login_failed',
            resource: 'unknown',
            details: {
              attemptedEmail: searchEmail,
              loginMethod: 'password',
            },
            ipAddress,
            userAgent,
            success: false,
            errorMessage: 'Invalid email or password',
          },
        });
      } catch (auditError) {
        // Don't fail if audit logging fails
        console.error('[User Login] Failed to log failed login to audit log:', auditError);
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Log successful login to AdminAuditLog (tracks all user logins, not just admin)
    try {
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          adminId: null, // Not an admin login
          action: 'login_success',
          resource: userType, // 'landlord', 'tenant', 'pmc'
          resourceId: userData.id,
          targetUserId: userData.id,
          targetUserRole: userType,
          targetEntityType: userType,
          targetEntityId: userData.id,
          details: {
            loginMethod: 'password',
            userEmail: userData.email,
            userName: userData.firstName && userData.lastName 
              ? `${userData.firstName} ${userData.lastName}` 
              : userData.email,
          },
          ipAddress,
          userAgent,
          success: true,
        },
      });
    } catch (auditError) {
      // Don't fail login if audit logging fails
      console.error('[User Login] Failed to log to audit log:', auditError);
    }

    // For PT DB testing: Store user email in a cookie that mimics Auth0 session
    // The app layout will read this and look up the user in the database
    // This is a simple approach for testing - in production, use proper session management
    const cookie = serialize('auth0_test_email', userData.email, {
      httpOnly: false, // Needs to be readable by client-side code
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
      redirect: '/dashboard', // All users go to /dashboard, which routes based on role
    });
  } catch (error: any) {
    console.error('[User Login] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message || 'An unexpected error occurred',
    });
  }
}

