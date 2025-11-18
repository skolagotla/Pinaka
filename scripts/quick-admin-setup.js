#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════
 * QUICK ADMIN SETUP (Using existing Google credentials)
 * ═══════════════════════════════════════════════════════════════
 * This script uses existing Google credentials from .env
 * ═══════════════════════════════════════════════════════════════
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const readline = require('readline');
const { execSync } = require('child_process');

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
  console.log('║        QUICK ADMIN SETUP (Using Existing Credentials)       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const envPath = path.join(process.cwd(), '.env');
  
  // Check for existing Google credentials
  const existingClientId = process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
  const existingClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET;
  
  let clientId, clientSecret;
  
  if (existingClientId && existingClientSecret) {
    console.log('✅ Found existing Google credentials in .env\n');
    console.log(`   Client ID: ${existingClientId.substring(0, 30)}...`);
    
    const useExisting = await question('Use existing Google credentials for admin? (yes/no): ');
    
    if (useExisting.toLowerCase() === 'yes') {
      clientId = existingClientId;
      clientSecret = existingClientSecret;
      console.log('✅ Using existing Google credentials\n');
    } else {
      clientId = await question('Enter Google OAuth Client ID for admin: ');
      clientSecret = await question('Enter Google OAuth Client Secret for admin: ');
    }
  } else {
    console.log('⚠️  No existing Google credentials found.\n');
    clientId = await question('Enter Google OAuth Client ID: ');
    clientSecret = await question('Enter Google OAuth Client Secret: ');
  }

  if (!clientId || !clientSecret) {
    console.log('\n❌ Client ID and Secret are required. Exiting.');
    process.exit(1);
  }

  // Add admin environment variables
  console.log('\n📝 Adding admin environment variables to .env...\n');
  
  const sessionSecret = process.env.ADMIN_SESSION_SECRET || generateSessionSecret();
  const redirectUri = 'http://localhost:3000/admin/auth/callback';
  const sessionMaxAge = process.env.ADMIN_SESSION_MAX_AGE || '1800000';
  
  addToEnvFile(envPath, 'ADMIN_GOOGLE_CLIENT_ID', clientId);
  addToEnvFile(envPath, 'ADMIN_GOOGLE_CLIENT_SECRET', clientSecret);
  addToEnvFile(envPath, 'ADMIN_GOOGLE_REDIRECT_URI', redirectUri);
  
  if (!process.env.ADMIN_SESSION_SECRET) {
    addToEnvFile(envPath, 'ADMIN_SESSION_SECRET', sessionSecret);
  }
  
  if (!process.env.ADMIN_SESSION_MAX_AGE) {
    addToEnvFile(envPath, 'ADMIN_SESSION_MAX_AGE', sessionMaxAge);
  }
  
  console.log('✅ Environment variables added/updated in .env');
  console.log(`   Client ID: ${clientId.substring(0, 30)}...`);
  console.log(`   Redirect URI: ${redirectUri}`);
  if (!process.env.ADMIN_SESSION_SECRET) {
    console.log(`   Session Secret: Generated`);
  }

  // Reload .env
  delete require.cache[require.resolve('dotenv')];
  require('dotenv').config({ path: envPath, override: true });

  // Verify
  console.log('\n🔍 Verifying environment variables...\n');
  
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

  // Create first admin
  console.log('\n👤 Creating first admin...\n');
  
  const email = await question('Enter your Gmail address for admin: ');
  const firstName = await question('Enter your first name (or press Enter for "Admin"): ') || 'Admin';
  const lastName = await question('Enter your last name (or press Enter for "User"): ') || 'User';
  
  if (!email || !email.includes('@')) {
    console.log('\n❌ Valid email is required. Exiting.');
    process.exit(1);
  }

  try {
    const prisma = new PrismaClient();
    
    // Check if admin already exists
    const existing = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (existing) {
      console.log(`\n⚠️  Admin with email ${email} already exists.`);
      console.log(`   ID: ${existing.id}`);
      console.log(`   Role: ${existing.role}`);
      console.log(`   Status: ${existing.isActive ? 'Active' : 'Inactive'}`);
      
      const useExisting = await question('\nUse existing admin? (yes/no): ');
      if (useExisting.toLowerCase() !== 'yes') {
        console.log('Exiting. Please use a different email or update existing admin.');
        await prisma.$disconnect();
        rl.close();
        process.exit(0);
      }
      console.log(`\n✅ Using existing admin: ${existing.email}`);
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
    rl.close();
    process.exit(1);
  }

  // Final instructions
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║              ✅ SETUP COMPLETE!                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log('📋 Next Steps:\n');
  console.log('1. Make sure your Google OAuth redirect URI is configured:');
  console.log('   http://localhost:3000/admin/auth/callback\n');
  console.log('2. Add your Gmail as a test user in Google OAuth consent screen\n');
  console.log('3. Start your development server:');
  console.log('   npm run dev\n');
  console.log('4. Visit the admin login page:');
  console.log('   http://localhost:3000/admin/login\n');
  console.log('5. Click "Sign in with Google"');
  console.log('6. Sign in with your Gmail account:', email);
  console.log('7. You should be redirected to the admin dashboard\n');
  
  console.log('🎉 Admin system is ready to use!\n');
  
  rl.close();
}

main().catch(error => {
  console.error('\n❌ Setup failed:', error);
  rl.close();
  process.exit(1);
});

