#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════
 * AUTO-COMPLETE ADMIN SETUP (Non-Interactive)
 * ═══════════════════════════════════════════════════════════════
 * Uses existing Google credentials and completes setup automatically
 * ═══════════════════════════════════════════════════════════════
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

function generateSessionSecret() {
  try {
    return execSync('openssl rand -base64 32', { encoding: 'utf8' }).trim();
  } catch (error) {
    return require('crypto').randomBytes(32).toString('base64');
  }
}

function addToEnvFile(envPath, key, value) {
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Check if key already exists
  if (envContent.includes(`${key}=`)) {
    // Update existing value
    const lines = envContent.split('\n');
    const updated = lines.map(line => {
      if (line.startsWith(`${key}=`)) {
        return `${key}=${value}`;
      }
      return line;
    });
    envContent = updated.join('\n');
  } else {
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
  }
  
  fs.writeFileSync(envPath, envContent, 'utf8');
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║        AUTO-COMPLETE ADMIN SETUP                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const envPath = path.join(process.cwd(), '.env');
  
  // Step 1: Find existing Google credentials
  console.log('📋 Step 1: Finding Google credentials...\n');
  
  const existingClientId = process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
  const existingClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET;
  
  if (!existingClientId || !existingClientSecret) {
    console.log('❌ No Google credentials found in .env');
    console.log('   Looking for: GOOGLE_CLIENT_ID, GMAIL_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GMAIL_CLIENT_SECRET');
    process.exit(1);
  }
  
  console.log('✅ Found existing Google credentials');
  console.log(`   Client ID: ${existingClientId.substring(0, 30)}...\n`);

  // Step 2: Add admin environment variables
  console.log('📝 Step 2: Adding admin environment variables...\n');
  
  const sessionSecret = process.env.ADMIN_SESSION_SECRET || generateSessionSecret();
  const redirectUri = 'http://localhost:3000/admin/auth/callback';
  const sessionMaxAge = process.env.ADMIN_SESSION_MAX_AGE || '1800000';
  
  addToEnvFile(envPath, 'ADMIN_GOOGLE_CLIENT_ID', existingClientId);
  addToEnvFile(envPath, 'ADMIN_GOOGLE_CLIENT_SECRET', existingClientSecret);
  addToEnvFile(envPath, 'ADMIN_GOOGLE_REDIRECT_URI', redirectUri);
  
  if (!process.env.ADMIN_SESSION_SECRET) {
    addToEnvFile(envPath, 'ADMIN_SESSION_SECRET', sessionSecret);
    console.log('   ✅ Session secret generated and added');
  } else {
    console.log('   ✅ Session secret already exists');
  }
  
  if (!process.env.ADMIN_SESSION_MAX_AGE) {
    addToEnvFile(envPath, 'ADMIN_SESSION_MAX_AGE', sessionMaxAge);
  }
  
  console.log('   ✅ Admin environment variables added/updated\n');

  // Reload .env
  delete require.cache[require.resolve('dotenv')];
  require('dotenv').config({ path: envPath, override: true });

  // Step 3: Verify
  console.log('🔍 Step 3: Verifying environment variables...\n');
  
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
    console.log('\n❌ Some environment variables are missing.');
    process.exit(1);
  }
  
  console.log('   ✅ All required variables are set\n');

  // Step 4: Check for existing admin or get email from environment
  console.log('👤 Step 4: Setting up admin account...\n');
  
  // Try to get email from environment or use a default
  const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || null;
  
  if (!adminEmail) {
    console.log('⚠️  No admin email found in environment variables.');
    console.log('   Set ADMIN_EMAIL or GMAIL_USER in .env, or run:');
    console.log('   node scripts/setup-first-admin.js\n');
    console.log('✅ Environment setup complete!');
    console.log('   You can now create an admin account manually.\n');
    process.exit(0);
  }

  try {
    const prisma = new PrismaClient();
    
    // Check if admin already exists
    const existing = await prisma.admin.findUnique({
      where: { email: adminEmail.toLowerCase() }
    });
    
    if (existing) {
      console.log(`✅ Admin already exists: ${existing.email}`);
      console.log(`   ID: ${existing.id}`);
      console.log(`   Role: ${existing.role}`);
      console.log(`   Status: ${existing.isActive ? 'Active' : 'Inactive'}\n`);
    } else {
      // Create new admin
      const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
      const lastName = process.env.ADMIN_LAST_NAME || 'User';
      
      const admin = await prisma.admin.create({
        data: {
          id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: adminEmail.toLowerCase(),
          firstName: firstName,
          lastName: lastName,
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
            createdBy: 'auto_setup_script',
            email: admin.email,
            role: admin.role,
          },
          ipAddress: '127.0.0.1',
          userAgent: 'auto-setup-script',
          success: true,
        }
      });
      
      console.log(`✅ Admin created successfully!`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Role: ${admin.role}\n`);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error with admin account:', error.message);
    if (error.code === 'P2002') {
      console.error('   Email already exists in database.');
    }
    process.exit(1);
  }

  // Step 5: Final summary
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║              ✅ SETUP COMPLETE!                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log('📋 Summary:');
  console.log('   ✅ Admin environment variables configured');
  console.log('   ✅ Admin account ready');
  console.log(`   ✅ Using Google OAuth Client ID: ${existingClientId.substring(0, 30)}...\n`);
  
  console.log('🚀 Next Steps:\n');
  console.log('1. Make sure redirect URI is configured in Google Console:');
  console.log('   http://localhost:3000/admin/auth/callback\n');
  console.log('2. Add your Gmail as a test user in Google OAuth consent screen\n');
  console.log('3. Start your server:');
  console.log('   npm run dev\n');
  console.log('4. Visit: http://localhost:3000/admin/login\n');
  console.log('5. Click "Sign in with Google" and login\n');
  
  console.log('🎉 Admin system is ready!\n');
}

main().catch(error => {
  console.error('\n❌ Setup failed:', error);
  process.exit(1);
});

