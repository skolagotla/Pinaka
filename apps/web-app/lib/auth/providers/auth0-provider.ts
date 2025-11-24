/**
 * Auth0 Provider
 * 
 * Handles authentication via Auth0
 */

import { AuthProvider, Session } from './base';
import { auth0 as auth0Client } from '@/lib/auth0';

export class Auth0Provider implements AuthProvider {
  name: 'auth0' = 'auth0';

  isConfigured(): boolean {
    return !!(
      process.env.AUTH0_SECRET &&
      process.env.AUTH0_BASE_URL &&
      (process.env.AUTH0_ISSUER_BASE_URL || process.env.AUTH0_DOMAIN) &&
      process.env.AUTH0_CLIENT_ID &&
      process.env.AUTH0_CLIENT_SECRET
    );
  }

  async getSession(req?: any, res?: any): Promise<Session | null> {
    try {
      if (!this.isConfigured()) {
        return null;
      }

      const session = await auth0Client.getSession(req, res);
      return session || null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth0Provider] Error getting session:', error?.message);
      }
      return null;
    }
  }

  async login(email: string, password?: string): Promise<Session> {
    // Auth0 login is handled via OAuth flow, not email/password
    // This method is for interface compliance
    throw new Error('Auth0 login must be done via OAuth flow at /auth/login');
  }

  async logout(): Promise<void> {
    // Auth0 logout is handled via /auth/logout route
    // This method is for interface compliance
    throw new Error('Auth0 logout must be done via /auth/logout route');
  }
}

