#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════
 * COMPLETE ADMIN SETUP AUTOMATION
 * ═══════════════════════════════════════════════════════════════
 * This script automates the admin setup process as much as possible
 * ═══════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateSessionSecret() {
  try {
    return execSync('openssl rand -base64 32', { encoding: 'utf8' }).trim();
  } catch (error) {
    // Fallback if openssl not available
    return require('crypto').randomBytes(32).toString('base64');
  }
}

function addToEnvFile(envPath, key, value) {
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Remove existing entry if present
  const lines = envContent.split('\n');
  const filtered = lines.filter(line => !line.startsWith(`${key}=`));
  envContent = filtered.join('\n');

  // Add new entry
  if (!envContent.endsWith('\n') && envContent.length > 0) {
    envContent += '\n';
  }
  
  // Check if admin section exists
  if (!envContent.includes('# ADMIN GOOGLE OAUTH')) {
    envContent += '\n# ═══════════════════════════════════════════════════════════════\n';
    envContent += '# ADMIN GOOGLE OAUTH CONFIGURATION\n';
    envContent += '# ═══════════════════════════════════════════════════════════════\n';
  }
  
  envContent += `${key}=${value}\n`;
  
  fs.writeFileSync(envPath, envContent, 'utf8');
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║        COMPLETE ADMIN SETUP AUTOMATION                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const envPath = path.join(process.cwd(), '.env');
  
  // Step 1: Google OAuth Setup Instructions
  console.log('📋 STEP 1: Google OAuth Credentials\n');
  console.log('You need to get Google OAuth credentials from Google Cloud Console.');
  console.log('\nQuick steps:');
  console.log('1. Go to: https://console.cloud.google.com/');
  console.log('2. Create/Select a project');
  console.log('3. Go to: APIs & Services → Credentials');
  console.log('4. Create OAuth 2.0 Client ID (Web application)');
  console.log('5. Add redirect URI: http://localhost:3000/admin/auth/callback');
  console.log('6. Copy Client ID and Client Secret\n');
  
  const clientId = await question('Enter Google OAuth Client ID: ');
  const clientSecret = await question('Enter Google OAuth Client Secret: ');
  
  if (!clientId || !clientSecret) {
    console.log('\n❌ Client ID and Secret are required. Exiting.');
    process.exit(1);
  }

  // Step 2: Add to .env
  console.log('\n📝 STEP 2: Adding to .env file...\n');
  
  const sessionSecret = generateSessionSecret();
  const redirectUri = 'http://localhost:3000/admin/auth/callback';
  const sessionMaxAge = '1800000';
  
  addToEnvFile(envPath, 'ADMIN_GOOGLE_CLIENT_ID', clientId);
  addToEnvFile(envPath, 'ADMIN_GOOGLE_CLIENT_SECRET', clientSecret);
  addToEnvFile(envPath, 'ADMIN_GOOGLE_REDIRECT_URI', redirectUri);
  addToEnvFile(envPath, 'ADMIN_SESSION_SECRET', sessionSecret);
  addToEnvFile(envPath, 'ADMIN_SESSION_MAX_AGE', sessionMaxAge);
  
  console.log('✅ Environment variables added to .env');
  console.log(`   Client ID: ${clientId.substring(0, 20)}...`);
  console.log(`   Redirect URI: ${redirectUri}`);
  console.log(`   Session Secret: Generated`);

  // Step 3: Verify
  console.log('\n🔍 STEP 3: Verifying environment variables...\n');
  
  // Reload .env
  require('dotenv').config({ path: envPath });
  
  const required = [
    'ADMIN_GOOGLE_CLIENT_ID',
    'ADMIN_GOOGLE_CLIENT_SECRET',
    'ADMIN_GOOGLE_REDIRECT_URI',
    'ADMIN_SESSION_SECRET',
  ];
  
  let allSet = true;
  for (const key of required) {
    if (!process.env[key]) {
      console.log(`   ❌ ${key}: NOT SET`);
      allSet = false;
    } else {
      console.log(`   ✅ ${key}: SET`);
    }
  }
  
  if (!allSet) {
    console.log('\n❌ Some environment variables are missing. Please check .env file.');
    process.exit(1);
  }

  // Step 4: Create first admin
  console.log('\n👤 STEP 4: Creating first admin...\n');
  
  const email = await question('Enter your Gmail address for admin: ');
  const firstName = await question('Enter your first name: ') || 'Admin';
  const lastName = await question('Enter your last name: ') || 'User';
  
  if (!email || !email.includes('@')) {
    console.log('\n❌ Valid email is required. Exiting.');
    process.exit(1);
  }

  // Create admin using Prisma
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Check if admin already exists
    const existing = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (existing) {
      console.log(`\n⚠️  Admin with email ${email} already exists.`);
      const useExisting = await question('Use existing admin? (yes/no): ');
      if (useExisting.toLowerCase() !== 'yes') {
        console.log('Exiting. Please use a different email or update existing admin.');
        await prisma.$disconnect();
        process.exit(0);
      }
      console.log(`\n✅ Using existing admin: ${existing.email}`);
      console.log(`   Role: ${existing.role}`);
    } else {
      // Create new admin
      const admin = await prisma.admin.create({
        data: {
          id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: email.toLowerCase(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: 'SUPER_ADMIN',
          isActive: true,
          isLocked: false,
          allowedGoogleDomains: [],
          ipWhitelist: [],
          requireIpWhitelist: false,
        }
      });
      
      // Create audit log
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          adminId: admin.id,
          action: 'admin_created',
          resource: 'admin',
          resourceId: admin.id,
          details: {
            createdBy: 'setup_script',
            email: admin.email,
            role: admin.role,
          },
          ipAddress: '127.0.0.1',
          userAgent: 'setup-script',
          success: true,
        }
      });
      
      console.log(`\n✅ Admin created successfully!`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Role: ${admin.role}`);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    if (error.code === 'P2002') {
      console.error('   Email already exists in database.');
    }
    process.exit(1);
  }

  // Step 5: Final instructions
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║              ✅ SETUP COMPLETE!                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log('📋 Next Steps:\n');
  console.log('1. Start your development server:');
  console.log('   npm run dev\n');
  console.log('2. Visit the admin login page:');
  console.log('   http://localhost:3000/admin/login\n');
  console.log('3. Click "Sign in with Google"');
  console.log('4. Sign in with your Gmail account:', email);
  console.log('5. You should be redirected to the admin dashboard\n');
  
  console.log('⚠️  Important Notes:');
  console.log('   - Make sure your Gmail is added as a test user in Google OAuth consent screen');
  console.log('   - The redirect URI in Google Console must match exactly:');
  console.log('     http://localhost:3000/admin/auth/callback');
  console.log('   - Restart your server if it\'s already running\n');
  
  console.log('🎉 Admin system is ready to use!\n');
  
  rl.close();
}

main().catch(error => {
  console.error('\n❌ Setup failed:', error);
  rl.close();
  process.exit(1);
});

