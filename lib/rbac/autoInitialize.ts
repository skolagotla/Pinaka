/**
 * RBAC Auto-Initialization
 * 
 * Automatically initializes RBAC system on application startup if not already initialized.
 * This ensures RBAC is always ready without manual intervention.
 */

import { initializePermissionMatrix } from './permissionMatrix';

// Use the shared Prisma instance to avoid connection issues
const { prisma } = require('@/lib/prisma');

let initializationPromise: Promise<boolean> | null = null;
let isInitialized: boolean | null = null;

/**
 * Check if RBAC system is initialized
 * Returns true if at least one role exists in the database
 */
export async function isRBACInitialized(): Promise<boolean> {
  try {
    const roleCount = await prisma.role.count();
    return roleCount > 0;
  } catch (error: any) {
    // If there's an error (e.g., table doesn't exist), assume not initialized
    console.warn('[RBAC Auto-Init] Error checking initialization status:', error.message);
    return false;
  }
}

/**
 * Auto-initialize RBAC system if not already initialized
 * This function is idempotent and safe to call multiple times
 * 
 * @param force - Force re-initialization even if already initialized (default: false)
 * @returns true if initialization was successful or already initialized
 */
export async function autoInitializeRBAC(force: boolean = false): Promise<boolean> {
  // If we've already checked and it's initialized, return early
  if (!force && isInitialized === true) {
    return true;
  }

  // If initialization is already in progress, wait for it
  if (initializationPromise) {
    return await initializationPromise;
  }

  // Start initialization process
  initializationPromise = (async () => {
    try {
      // Check if already initialized
      const alreadyInitialized = await isRBACInitialized();
      
      if (alreadyInitialized && !force) {
        isInitialized = true;
        if (process.env.NODE_ENV === 'development') {
          console.log('[RBAC Auto-Init] ✅ RBAC system already initialized');
        }
        return true;
      }

      // Initialize RBAC system
      if (process.env.NODE_ENV === 'development') {
        console.log('[RBAC Auto-Init] 🔄 Initializing RBAC system...');
      }

      await initializePermissionMatrix();

      isInitialized = true;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[RBAC Auto-Init] ✅ RBAC system initialized successfully');
      }

      return true;
    } catch (error: any) {
      console.error('[RBAC Auto-Init] ❌ Error auto-initializing RBAC system:', error);
      isInitialized = false;
      // Don't throw - allow application to continue even if RBAC init fails
      // The system can still work, just without RBAC permissions
      return false;
    } finally {
      // Clear the promise so we can retry if needed
      initializationPromise = null;
    }
  })();

  return await initializationPromise;
}

/**
 * Initialize RBAC on module load (runs once when this module is first imported)
 * This ensures RBAC is initialized as soon as the application starts
 */
let startupInitialized = false;

export async function initializeOnStartup(): Promise<void> {
  // Only run once
  if (startupInitialized) {
    return;
  }

  startupInitialized = true;

  // Run initialization in background (don't block startup)
  autoInitializeRBAC().catch((error) => {
    console.error('[RBAC Auto-Init] Startup initialization failed:', error);
  });
}

// Auto-initialize when module is imported (runs on application startup)
if (typeof window === 'undefined') {
  // Only run on server-side
  initializeOnStartup();
}

