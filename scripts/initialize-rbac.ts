/**
 * Initialize RBAC System
 * 
 * This script initializes the RBAC system by:
 * 1. Creating all system roles
 * 2. Seeding the permission matrix
 * 
 * Run with: npx tsx scripts/initialize-rbac.ts
 */

import { initializePermissionMatrix } from '@/lib/rbac/permissionMatrix';

async function main() {
  console.log('🚀 Initializing RBAC System...');
  console.log('');

  try {
    console.log('Step 1: Initializing roles...');
    await initializePermissionMatrix();
    
    console.log('');
    console.log('✅ RBAC System initialized successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Assign roles to existing users');
    console.log('2. Set up scopes for users');
    console.log('3. Integrate RBAC middleware into API routes');
  } catch (error) {
    console.error('❌ Error initializing RBAC system:', error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

