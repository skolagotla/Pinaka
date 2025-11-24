/**
 * Auth Configuration
 * 
 * Determines which authentication provider to use based on AUTH_MODE environment variable
 */

import { AuthProvider } from './providers/base';
// Auth0 disabled - using password-based authentication
// import { Auth0Provider } from './providers/auth0-provider';
import { PasswordProvider } from './providers/password-provider';

export type AuthMode = 'auth0' | 'password' | 'auto';

/**
 * Get the configured AUTH_MODE from environment
 * Defaults to 'password' for testing (can be changed to 'auth0' later)
 */
export function getAuthMode(): AuthMode {
  const mode = process.env.AUTH_MODE?.toLowerCase();
  if (mode === 'auth0' || mode === 'password' || mode === 'auto') {
    return mode;
  }
  // Default to password for testing - change to 'auto' or 'auth0' when ready
  return 'password';
}

/**
 * Check if Auth0 is configured
 */
function isAuth0Configured(): boolean {
  return !!(
    process.env.AUTH0_SECRET &&
    process.env.AUTH0_BASE_URL &&
    (process.env.AUTH0_ISSUER_BASE_URL || process.env.AUTH0_DOMAIN) &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_CLIENT_SECRET
  );
}

/**
 * Get the active authentication provider based on AUTH_MODE
 */
export function getAuthProvider(): AuthProvider {
  const mode = getAuthMode();

  if (mode === 'auth0') {
    return new Auth0Provider();
  } else if (mode === 'password') {
    return new PasswordProvider();
  } else {
    // 'auto' mode: use Auth0 if configured, otherwise password
    return isAuth0Configured() ? new Auth0Provider() : new PasswordProvider();
  }
}

/**
 * Get the name of the active provider
 */
export function getActiveAuthProviderName(): 'auth0' | 'password' {
  const provider = getAuthProvider();
  return provider.name;
}

