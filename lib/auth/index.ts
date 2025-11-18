/**
 * Unified Authentication Interface
 * 
 * This is the main entry point for all authentication operations.
 * It automatically uses the correct provider based on AUTH_MODE configuration.
 */

import { getAuthProvider } from './config';
import { Session } from './providers/base';

/**
 * Get the current user session
 * Works in both App Router and Pages Router contexts
 */
export async function getSession(req?: any, res?: any): Promise<Session | null> {
  const provider = getAuthProvider();
  return provider.getSession(req, res);
}

/**
 * Check if authentication is configured
 */
export function isAuthConfigured(): boolean {
  const provider = getAuthProvider();
  return provider.isConfigured();
}

/**
 * Get the active authentication provider name
 */
export function getActiveAuthProvider(): 'auth0' | 'password' {
  const provider = getAuthProvider();
  return provider.name;
}

// Re-export types and config for convenience
export { getAuthMode, getAuthProvider } from './config';
export type { AuthMode } from './config';
export type { Session, AuthProvider } from './providers/base';

