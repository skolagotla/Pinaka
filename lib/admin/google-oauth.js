/**
 * ═══════════════════════════════════════════════════════════════
 * GOOGLE OAUTH UTILITIES FOR ADMIN AUTHENTICATION
 * DISABLED - google-auth-library removed
 * ═══════════════════════════════════════════════════════════════
 */

// const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client - DISABLED
let oauth2Client = null;

function getOAuth2Client() {
  // Google OAuth disabled - google-auth-library removed
  throw new Error('Google OAuth is disabled - google-auth-library has been removed');
}

/**
 * Get Google OAuth authorization URL
 * DISABLED
 */
function getAuthUrl(state = null) {
  throw new Error('Google OAuth is disabled - google-auth-library has been removed');
}

/**
 * Exchange authorization code for tokens
 * DISABLED
 */
async function getTokensFromCode(code) {
  throw new Error('Google OAuth is disabled - google-auth-library has been removed');
}

/**
 * Verify ID token and get user info
 * DISABLED
 */
async function verifyIdToken(idToken) {
  throw new Error('Google OAuth is disabled - google-auth-library has been removed');
}

/**
 * Refresh access token using refresh token
 * DISABLED
 */
async function refreshAccessToken(refreshToken) {
  throw new Error('Google OAuth is disabled - google-auth-library has been removed');
}

module.exports = {
  getOAuth2Client,
  getAuthUrl,
  getTokensFromCode,
  verifyIdToken,
  refreshAccessToken,
};
