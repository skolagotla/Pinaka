/**
 * Base Auth Provider Interface
 * 
 * All authentication providers must implement this interface
 */

export interface Session {
  user: {
    email: string;
    name?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface AuthProvider {
  name: 'auth0' | 'password';
  isConfigured(): boolean;
  getSession(req?: any, res?: any): Promise<Session | null>;
  login(email: string, password?: string): Promise<Session>;
  logout(): Promise<void>;
}

