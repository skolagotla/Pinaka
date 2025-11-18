#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════
 * CHECK ADMIN ENVIRONMENT VARIABLES
 * ═══════════════════════════════════════════════════════════════
 * 
 * This script checks if all required admin environment variables are set.
 * 
 * Usage:
 *   node scripts/check-admin-env.js
 * 
 * ═══════════════════════════════════════════════════════════════
 */

require('dotenv').config();

const requiredVars = [
  'ADMIN_GOOGLE_CLIENT_ID',
  'ADMIN_GOOGLE_CLIENT_SECRET',
  'ADMIN_GOOGLE_REDIRECT_URI',
  'ADMIN_SESSION_SECRET',
];

const optionalVars = [
  'ADMIN_SESSION_MAX_AGE',
];

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║        ADMIN ENVIRONMENT VARIABLES CHECK                    ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

let allSet = true;
const missing = [];
const set = [];

// Check required variables
console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`   ❌ ${varName}: NOT SET`);
    missing.push(varName);
    allSet = false;
  } else {
    // Mask sensitive values
    const masked = varName.includes('SECRET') || varName.includes('SECRET')
      ? value.substring(0, 8) + '...' + value.substring(value.length - 4)
      : value;
    console.log(`   ✅ ${varName}: ${masked}`);
    set.push(varName);
  }
});

// Check optional variables
console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`   ⚠️  ${varName}: NOT SET (using default)`);
  } else {
    console.log(`   ✅ ${varName}: ${value}`);
  }
});

// Summary
console.log('\n╔══════════════════════════════════════════════════════════════╗');
if (allSet) {
  console.log('║              ✅ ALL REQUIRED VARIABLES SET                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log('🎉 You can proceed with admin setup!');
  console.log('\nNext steps:');
  console.log('   1. Run: node scripts/setup-first-admin.js');
  console.log('   2. Visit: http://localhost:3000/admin/login');
  console.log('   3. Test login with your Google account\n');
  process.exit(0);
} else {
  console.log('║          ❌ MISSING REQUIRED VARIABLES                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log('❌ Missing variables:');
  missing.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 Add these to your .env file:');
  console.log('\n# Google OAuth for Admin');
  missing.forEach(varName => {
    if (varName.includes('CLIENT_ID')) {
      console.log(`${varName}=your-google-client-id.apps.googleusercontent.com`);
    } else if (varName.includes('CLIENT_SECRET')) {
      console.log(`${varName}=your-google-client-secret`);
    } else if (varName.includes('REDIRECT_URI')) {
      console.log(`${varName}=http://localhost:3000/admin/auth/callback`);
    } else if (varName.includes('SESSION_SECRET')) {
      console.log(`${varName}=your-random-secret-key`);
      console.log('# Generate with: openssl rand -base64 32');
    }
  });
  console.log('\nSee Documentation/ADMIN_GOOGLE_OAUTH_SETUP.md for details.\n');
  process.exit(1);
}

