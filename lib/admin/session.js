/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN SESSION MANAGEMENT
 * ═══════════════════════════════════════════════════════════════
 */

const crypto = require('crypto');
const { prisma } = require('../prisma');

const SESSION_MAX_AGE = parseInt(process.env.ADMIN_SESSION_MAX_AGE || '1800000', 10); // 30 minutes default
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate secure session token
 */
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate secure refresh token
 */
function generateRefreshToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create admin session
 */
async function createSession(adminId, ipAddress, userAgent, googleTokens = null) {
  try {
    const token = generateSessionToken();
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE);
    
    // Store Google tokens (encrypted if needed, or just store as-is for now)
    // In production, you might want to encrypt these
    let encryptedAccessToken = googleTokens?.access_token || null;
    let encryptedRefreshToken = googleTokens?.refresh_token || null;

    // Ensure Prisma client is available
    if (!prisma || !prisma.adminSession) {
      throw new Error('Prisma client not initialized or adminSession model not available');
    }

    const session = await prisma.adminSession.create({
      data: {
        id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId,
        token,
        refreshToken,
        googleAccessToken: encryptedAccessToken,
        googleRefreshToken: encryptedRefreshToken,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'Unknown',
        expiresAt,
        lastActivityAt: new Date(),
      },
    });

    return {
      token: session.token,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    };
  } catch (error) {
    console.error('[createSession] Error creating session:', error);
    console.error('[createSession] Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });
    throw error;
  }
}

/**
 * Validate session token
 */
async function validateSession(token) {
  const session = await prisma.adminSession.findUnique({
    where: { token },
    include: {
      admin: true,
    },
  });

  if (!session) {
    return null;
  }

  // Check if session is revoked
  if (session.isRevoked) {
    return null;
  }

  // Check if session is expired
  if (new Date() > session.expiresAt) {
    // Mark as revoked
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });
    return null;
  }

  // Check if admin is active
  if (!session.admin || !session.admin.isActive || session.admin.isLocked) {
    return null;
  }

  // Update last activity
  await prisma.adminSession.update({
    where: { id: session.id },
    data: { lastActivityAt: new Date() },
  });

  return {
    session,
    admin: session.admin,
  };
}

/**
 * Revoke session
 */
async function revokeSession(token) {
  await prisma.adminSession.updateMany({
    where: { token },
    data: { isRevoked: true },
  });
}

/**
 * Revoke all sessions for an admin
 */
async function revokeAllSessions(adminId) {
  await prisma.adminSession.updateMany({
    where: {
      adminId,
      isRevoked: false,
    },
    data: { isRevoked: true },
  });
}

/**
 * Clean up expired sessions
 */
async function cleanupExpiredSessions() {
  const deleted = await prisma.adminSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return deleted.count;
}

module.exports = {
  createSession,
  validateSession,
  revokeSession,
  revokeAllSessions,
  cleanupExpiredSessions,
  generateSessionToken,
  generateRefreshToken,
};

