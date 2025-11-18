#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════
 * FIRST ADMIN SETUP SCRIPT
 * ═══════════════════════════════════════════════════════════════
 * 
 * This script creates the first admin user for the platform.
 * 
 * Usage:
 *   node scripts/setup-first-admin.js
 * 
 * Security Notes:
 * - Only run this script during initial setup
 * - Use a secure Google Workspace account
 * - Keep admin credentials secure
 * - Create a backup admin immediately after
 * 
 * ═══════════════════════════════════════════════════════════════
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

// Simple ID generator (if cuid is not available)
function generateId() {
  return 'admin_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateIP(ip) {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

async function setupFirstAdmin() {
  try {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║           🔐 FIRST ADMIN SETUP                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log('This script will create the first admin user for the platform.');
    console.log('⚠️  This should only be run once during initial setup.\n');

    // Check if any admins exist
    const existingAdmins = await prisma.admin.count();
    if (existingAdmins > 0) {
      console.log('⚠️  WARNING: Admins already exist in the database!');
      const confirm = await question('Are you sure you want to continue? (yes/no): ');
      if (confirm.toLowerCase() !== 'yes') {
        console.log('❌ Setup cancelled.');
        process.exit(0);
      }
    }

    // Collect admin information
    console.log('\n📝 Please provide the following information:\n');
    
    let email;
    while (true) {
      email = await question('Admin Email (Google account): ');
      email = email.trim().toLowerCase();
      
      if (!email) {
        console.error('❌ Email is required.');
        continue;
      }
      
      if (!validateEmail(email)) {
        console.error('❌ Invalid email format. Please try again.');
        continue;
      }
      
      // Check if email already exists
      const existing = await prisma.admin.findUnique({
        where: { email }
      });
      
      if (existing) {
        console.error(`❌ Admin with email ${email} already exists.`);
        const useExisting = await question('Use existing admin? (yes/no): ');
        if (useExisting.toLowerCase() === 'yes') {
          console.log(`✅ Using existing admin: ${email}`);
          console.log(`   ID: ${existing.id}`);
          console.log(`   Role: ${existing.role}`);
          console.log(`\n🔗 Next steps:`);
          console.log(`   1. Visit: http://localhost:3000/admin/login`);
          console.log(`   2. Click "Sign in with Google"`);
          console.log(`   3. Use the email: ${existing.email}`);
          process.exit(0);
        }
        continue;
      }
      
      break;
    }

    // Validate email domain
    const emailDomain = email.split('@')[1];
    console.log(`\n📧 Email domain: ${emailDomain}`);
    const confirmDomain = await question('Is this the correct domain? (yes/no): ');
    if (confirmDomain.toLowerCase() !== 'yes') {
      console.log('❌ Setup cancelled.');
      process.exit(0);
    }

    const firstName = await question('First Name: ') || 'Admin';
    const lastName = await question('Last Name: ') || 'User';

    console.log('\n👤 Admin Roles:');
    console.log('1. SUPER_ADMIN - Full system access (recommended for first admin)');
    console.log('2. PLATFORM_ADMIN - Platform management');
    console.log('3. SUPPORT_ADMIN - Support access');
    console.log('4. BILLING_ADMIN - Financial access');
    console.log('5. AUDIT_ADMIN - Audit logs only');
    
    const roleChoice = await question('\nSelect role (1-5, default: 1): ') || '1';
    const roles = {
      '1': 'SUPER_ADMIN',
      '2': 'PLATFORM_ADMIN',
      '3': 'SUPPORT_ADMIN',
      '4': 'BILLING_ADMIN',
      '5': 'AUDIT_ADMIN'
    };
    const role = roles[roleChoice] || 'SUPER_ADMIN';

    // IP whitelist (optional)
    console.log('\n🌐 IP Whitelist (optional):');
    console.log('Enter IP addresses, one per line. Press Enter twice when done.');
    console.log('Leave empty to allow all IPs.');
    const ipWhitelist = [];
    let ip;
    do {
      ip = await question('IP address (or press Enter to finish): ');
      if (ip && ip.trim()) {
        if (validateIP(ip.trim())) {
          ipWhitelist.push(ip.trim());
          console.log(`   ✅ Added: ${ip.trim()}`);
        } else {
          console.log(`   ❌ Invalid IP format: ${ip.trim()}`);
        }
      }
    } while (ip && ip.trim());

    // Allowed Google domains (optional)
    console.log('\n📧 Allowed Google Domains (optional):');
    console.log('Enter allowed email domains (e.g., @yourcompany.com), one per line.');
    console.log('Press Enter twice when done. Leave empty to allow all domains.');
    const allowedDomains = [];
    let domain;
    do {
      domain = await question('Domain (or press Enter to finish): ');
      if (domain && domain.trim()) {
        if (domain.startsWith('@')) {
          allowedDomains.push(domain.trim());
          console.log(`   ✅ Added: ${domain.trim()}`);
        } else {
          console.log(`   ⚠️  Adding @ prefix: @${domain.trim()}`);
          allowedDomains.push(`@${domain.trim()}`);
        }
      }
    } while (domain && domain.trim());

    // Summary
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    📋 SUMMARY                                 ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${firstName} ${lastName}`);
    console.log(`   Role: ${role}`);
    console.log(`   IP Whitelist: ${ipWhitelist.length > 0 ? ipWhitelist.join(', ') : 'None (all IPs allowed)'}`);
    console.log(`   Allowed Domains: ${allowedDomains.length > 0 ? allowedDomains.join(', ') : 'All domains'}`);

    const confirm = await question('\n✅ Create this admin? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Setup cancelled.');
      process.exit(0);
    }

    // Create admin
    console.log('\n⏳ Creating admin...');
    const admin = await prisma.admin.create({
      data: {
        id: generateId(),
        email: email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: role,
        isActive: true,
        isLocked: false,
        ipWhitelist: ipWhitelist,
        allowedGoogleDomains: allowedDomains,
        requireIpWhitelist: ipWhitelist.length > 0,
      }
    });

    // Log creation
    await prisma.adminAuditLog.create({
      data: {
        id: generateId(),
        adminId: admin.id,
        action: 'admin_created',
        resource: 'admin',
        resourceId: admin.id,
        details: {
          createdBy: 'setup_script',
          email: admin.email,
          role: admin.role,
          ipWhitelist: admin.ipWhitelist,
          allowedDomains: admin.allowedGoogleDomains,
        },
        ipAddress: '127.0.0.1',
        userAgent: 'setup-script',
        success: true,
      }
    });

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║              ✅ ADMIN CREATED SUCCESSFULLY                  ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log(`📝 Admin Details:`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
    console.log(`\n🔗 Next Steps:`);
    console.log(`   1. Visit: http://localhost:3000/admin/login`);
    console.log(`   2. Click "Sign in with Google"`);
    console.log(`   3. Use the email: ${admin.email}`);
    console.log(`   4. After first login, create a backup admin account`);
    console.log(`\n⚠️  IMPORTANT:`);
    console.log(`   - Keep this information secure`);
    console.log(`   - Enable MFA on your Google account`);
    console.log(`   - Create a backup admin immediately`);
    console.log(`   - Document this setup in a secure location\n`);

  } catch (error) {
    console.error('\n❌ Error creating admin:', error);
    if (error.code === 'P2002') {
      console.error('   Email already exists in database.');
    }
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run setup
setupFirstAdmin();

