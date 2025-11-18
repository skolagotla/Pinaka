import crypto from 'crypto';

/**
 * Generate a secure random token for invitations
 */
export function generateSecureToken(length: number = 64): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a URL-safe token (for use in URLs)
 */
export function generateUrlSafeToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

