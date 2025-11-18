/**
 * ═══════════════════════════════════════════════════════════════
 * GOOGLE OAUTH UTILITIES FOR ADMIN AUTHENTICATION
 * ═══════════════════════════════════════════════════════════════
 */

const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
let oauth2Client = null;

function getOAuth2Client() {
  if (!oauth2Client) {
    const clientId = process.env.ADMIN_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.ADMIN_GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.ADMIN_GOOGLE_REDIRECT_URI || 'http://localhost:3000/admin/auth/callback';

    if (!clientId || !clientSecret) {
      throw new Error('ADMIN_GOOGLE_CLIENT_ID and ADMIN_GOOGLE_CLIENT_SECRET must be set in environment variables');
    }

    oauth2Client = new OAuth2Client(
      clientId,
      clientSecret,
      redirectUri
    );
  }

  return oauth2Client;
}

/**
 * Get Google OAuth authorization URL
 */
function getAuthUrl(state = null) {
  const oauth2Client = getOAuth2Client();
  
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent screen to get refresh token
    state: state, // Optional state parameter for CSRF protection
  });

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 */
async function getTokensFromCode(code) {
  const oauth2Client = getOAuth2Client();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('[Google OAuth] Error exchanging code for tokens:', error);
    throw new Error('Failed to exchange authorization code for tokens');
  }
}

/**
 * Verify ID token and get user info
 */
async function verifyIdToken(idToken) {
  const oauth2Client = getOAuth2Client();
  
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: idToken,
      audience: process.env.ADMIN_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified,
      firstName: payload.given_name,
      lastName: payload.family_name,
      picture: payload.picture,
      name: payload.name,
    };
  } catch (error) {
    console.error('[Google OAuth] Error verifying ID token:', error);
    throw new Error('Failed to verify ID token');
  }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(refreshToken) {
  const oauth2Client = getOAuth2Client();
  
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error('[Google OAuth] Error refreshing access token:', error);
    throw new Error('Failed to refresh access token');
  }
}

module.exports = {
  getOAuth2Client,
  getAuthUrl,
  getTokensFromCode,
  verifyIdToken,
  refreshAccessToken,
};

