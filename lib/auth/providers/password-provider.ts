/**
 * Password Provider
 * 
 * Handles authentication via email/password (for PT DB testing)
 */

import { AuthProvider, Session } from './base';

export class PasswordProvider implements AuthProvider {
  name: 'password' = 'password';

  isConfigured(): boolean {
    // Password provider is always available (no external dependencies)
    return true;
  }

  async getSession(req?: any, res?: any): Promise<Session | null> {
    try {
      // For Pages Router API routes, check cookies from request
      if (req && req.cookies) {
        const testEmail = req.cookies.auth0_test_email;
        if (testEmail) {
          return {
            user: {
              email: testEmail,
            },
          };
        }
        return null;
      }

      // For App Router, use Next.js cookies()
      // Only import cookies() if we're in App Router context (no req/res)
      // Wrap in try-catch to handle any errors gracefully
      try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const testEmail = cookieStore.get('auth0_test_email')?.value;
        
        if (testEmail) {
          return {
            user: {
              email: testEmail,
            },
          };
        }
      } catch (cookieError) {
        // cookies() may not be available in all contexts
        // This is expected in some cases (e.g., during build, static generation)
        // Always return null instead of throwing - this allows the app to continue
        // Don't log expected errors to avoid noise
        const errorMessage = cookieError?.message || String(cookieError || '');
        const isExpectedError = 
          errorMessage.includes('cookies()') || 
          errorMessage.includes('DYNAMIC_SERVER_USAGE') ||
          errorMessage.includes('Route') ||
          errorMessage.includes('dynamic');
        
        if (process.env.NODE_ENV === 'development' && !isExpectedError) {
          console.log('[PasswordProvider] Could not access cookies:', errorMessage);
        }
        // Return null - never throw
        return null;
      }

      return null;
    } catch (error: any) {
      // Catch-all: never throw, always return null
      // This ensures the app can continue even if there's an unexpected error
      if (process.env.NODE_ENV === 'development') {
        const errorMessage = error?.message || String(error || '');
        // Only log unexpected errors
        if (!errorMessage.includes('DYNAMIC_SERVER_USAGE') && !errorMessage.includes('cookies()')) {
          console.log('[PasswordProvider] Error getting session:', errorMessage);
        }
      }
      return null;
    }
  }

  async login(email: string, password?: string): Promise<Session> {
    // Password login is handled via /api/auth/login endpoint
    // This method is for interface compliance
    throw new Error('Password login must be done via /api/auth/login endpoint');
  }

  async logout(): Promise<void> {
    // Password logout is handled via /api/auth/logout endpoint
    // This method is for interface compliance
    throw new Error('Password logout must be done via /api/auth/logout endpoint');
  }
}

