/**
 * Centralized Application Configuration
 * 
 * This module provides a single source of truth for all environment variables
 * and API keys used throughout the application. It handles both client-side
 * (NEXT_PUBLIC_*) and server-side environment variables.
 * 
 * Usage:
 *   import config from '@/lib/config/app-config';
 *   const apiKey = config.radar.apiKey;
 *   const dbUrl = config.database.url;
 */

/**
 * Get environment variable with optional fallback
 * Handles both server-side and client-side access
 */
function getEnv(key, fallback = null) {
  // Server-side: direct access to process.env
  if (typeof window === 'undefined') {
    return process.env[key] || fallback;
  }
  
  // Client-side: only NEXT_PUBLIC_* vars are available
  if (key.startsWith('NEXT_PUBLIC_')) {
    return process.env[key] || fallback;
  }
  
  // For non-NEXT_PUBLIC vars on client, return null (they shouldn't be accessed)
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️  Attempting to access server-only env var "${key}" on client-side`);
  }
  
  return fallback;
}

/**
 * Application Configuration Object
 * All environment variables are accessed through this centralized config
 */
const config = {
  // ============================================
  // API Keys
  // ============================================
  apiKeys: {
    /**
     * TomTom API (Address Autocomplete) - Primary provider
     * Priority: env var > localStorage > default (dev only)
     */
    get tomtom() {
      // Priority 1: Environment variable
      const envKey = getEnv('NEXT_PUBLIC_TOMTOM_API_KEY');
      if (envKey) return envKey;
      
      // Priority 2: localStorage (client-side only)
      if (typeof window !== 'undefined') {
        const localKey = localStorage.getItem('tomtom_api_key');
        if (localKey) return localKey;
      }
      
      // Priority 3: Default key for development
      return '3YUuSV1wwvh36u5LanbjnqdP03IjhBf3';
    },

    /**
     * Geoapify API (Address Autocomplete) - Alternative provider
     * Priority: env var > localStorage > default (dev only)
     */
    get geoapify() {
      // Check environment variable first
      const envKey = getEnv('NEXT_PUBLIC_GEOAPIFY_API_KEY');
      if (envKey) return envKey;
      
      // Check localStorage (client-side only, for development)
      if (typeof window !== 'undefined') {
        const localKey = localStorage.getItem('geoapify_api_key');
        if (localKey) return localKey;
      }
      
      // Fallback to default key (development only)
      if (process.env.NODE_ENV === 'development') {
        const defaultKey = '75687a65a4434057b45c6e5e3419b46b';
        console.warn('⚠️  Using default Geoapify API key. Set NEXT_PUBLIC_GEOAPIFY_API_KEY in .env for production.');
        return defaultKey;
      }
      
      return null;
    },
    /**
     * @deprecated Use geoapify instead
     * Kept for backward compatibility
     */
    get radar() {
      return this.geoapify;
    },
  },

  // ============================================
  // Email Configuration
  // ============================================
  email: {
    /**
     * Gmail SMTP Configuration
     * Server-side only
     */
    get gmail() {
      return {
        user: getEnv('GMAIL_USER'),
        appPassword: getEnv('GMAIL_APP_PASSWORD'),
        isConfigured: !!(getEnv('GMAIL_USER') && getEnv('GMAIL_APP_PASSWORD')),
      };
    },
    
    /**
     * Check if email service is configured
     */
    get isConfigured() {
      return this.gmail.isConfigured;
    },
  },

  // ============================================
  // Authentication Configuration
  // ============================================
  auth: {
    /**
     * Google OAuth Configuration
     * Server-side only
     */
    get google() {
      return {
        clientId: getEnv('GOOGLE_CLIENT_ID'),
        clientSecret: getEnv('GOOGLE_CLIENT_SECRET'),
        isConfigured: !!(getEnv('GOOGLE_CLIENT_ID') && getEnv('GOOGLE_CLIENT_SECRET')),
      };
    },
    
    /**
     * NextAuth Configuration
     */
    get nextAuth() {
      return {
        url: getEnv('NEXTAUTH_URL', 'http://localhost:3000'),
        secret: getEnv('NEXTAUTH_SECRET'),
        isConfigured: !!getEnv('NEXTAUTH_SECRET'),
      };
    },
    
    /**
     * App Base URL (fallback for NEXTAUTH_URL)
     */
    get baseUrl() {
      return getEnv('NEXTAUTH_URL') || getEnv('APP_BASE_URL') || 'http://localhost:3000';
    },
  },

  // ============================================
  // Database Configuration
  // ============================================
  database: {
    /**
     * Database URL
     * Server-side only
     */
    get url() {
      return getEnv('DATABASE_URL', 'file:./dev.db');
    },
    
    /**
     * Database Provider (extracted from URL)
     */
    get provider() {
      const url = this.url;
      if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
        return 'postgresql';
      }
      if (url.startsWith('mysql://')) {
        return 'mysql';
      }
      if (url.startsWith('file:')) {
        return 'sqlite';
      }
      return 'unknown';
    },
  },

  // ============================================
  // Storage Configuration
  // ============================================
  storage: {
    /**
     * Storage Provider
     */
    get provider() {
      return getEnv('STORAGE_PROVIDER', 'local');
    },
    
    /**
     * AWS S3 Configuration (if using S3)
     * Server-side only
     */
    get s3() {
      return {
        accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
        region: getEnv('AWS_REGION', 'us-east-1'),
        bucket: getEnv('AWS_S3_BUCKET'),
        isConfigured: !!(getEnv('AWS_ACCESS_KEY_ID') && getEnv('AWS_SECRET_ACCESS_KEY')),
      };
    },
  },

  // ============================================
  // Application Settings
  // ============================================
  app: {
    /**
     * Application Name
     */
    get name() {
      return getEnv('APP_NAME', 'Pinaka');
    },
    
    /**
     * Environment (development, production, test)
     */
    get env() {
      return getEnv('NODE_ENV', 'development');
    },
    
    /**
     * Is Development Mode
     */
    get isDev() {
      return this.env === 'development';
    },
    
    /**
     * Is Production Mode
     */
    get isProd() {
      return this.env === 'production';
    },
    
    /**
     * Base URL for the application
     */
    get baseUrl() {
      return config.auth.baseUrl;
    },
  },

  // ============================================
  // Utility Methods
  // ============================================
  /**
   * Get all configuration (for debugging/admin purposes)
   * Returns sanitized config (hides sensitive values)
   */
  getAll() {
    return {
      apiKeys: {
        geoapify: config.apiKeys.geoapify ? '***configured***' : null,
        radar: config.apiKeys.radar ? '***configured***' : null, // Deprecated, kept for backward compat
      },
      email: {
        gmail: {
          user: config.email.gmail.user || null,
          isConfigured: config.email.gmail.isConfigured,
        },
        isConfigured: config.email.isConfigured,
      },
      auth: {
        google: {
          clientId: config.auth.google.clientId ? '***configured***' : null,
          isConfigured: config.auth.google.isConfigured,
        },
        nextAuth: {
          url: config.auth.nextAuth.url,
          isConfigured: config.auth.nextAuth.isConfigured,
        },
      },
      database: {
        provider: config.database.provider,
        url: config.database.url ? '***configured***' : null,
      },
      storage: {
        provider: config.storage.provider,
      },
      app: {
        name: config.app.name,
        env: config.app.env,
        baseUrl: config.app.baseUrl,
      },
    };
  },
  
  /**
   * Validate required configuration
   * Returns array of missing required configs
   */
  validate() {
    const missing = [];
    
    if (!config.auth.google.isConfigured) {
      missing.push('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
    }
    
    if (!config.auth.nextAuth.isConfigured) {
      missing.push('NEXTAUTH_SECRET');
    }
    
    if (!config.database.url) {
      missing.push('DATABASE_URL');
    }
    
    return missing;
  },
};

// Export default config object (ES6 modules)
export default config;

// Named exports for convenience (ES6 modules)
export const {
  apiKeys,
  email,
  auth,
  database,
  storage,
  app,
} = config;

// CommonJS export (for require() compatibility)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
  module.exports.default = config;
  module.exports.apiKeys = apiKeys;
  module.exports.email = email;
  module.exports.auth = auth;
  module.exports.database = database;
  module.exports.storage = storage;
  module.exports.app = app;
}

