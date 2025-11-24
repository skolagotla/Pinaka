/**
 * @deprecated Ant Design has been migrated to Flowbite.
 * This file is no longer needed and can be removed.
 * 
 * Legacy: Ant Design Compatibility Patch
 * This was used to patch Ant Design's internal React version check.
 * Since we've migrated to Flowbite, this patch is no longer necessary.
 */

// This file is kept for backward compatibility but does nothing
// Ant Design has been fully migrated to Flowbite
if (typeof window !== 'undefined') {
  // No-op - Ant Design is no longer used
  if (process.env.NODE_ENV === 'development') {
    console.log('ℹ️  antd-compat-patch.js is deprecated - Ant Design has been migrated to Flowbite');
  }
}

