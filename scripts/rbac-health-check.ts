/**
 * RBAC System Health Check
 * 
 * Checks the health of the RBAC system
 */

import { PrismaClient } from '@prisma/client';
import { initializePermissionMatrix } from '@/lib/rbac/permissionMatrix';

const prisma = new PrismaClient();

async function healthCheck() {
  console.log('🏥 RBAC System Health Check');
  console.log('');

  const issues: string[] = [];
  const warnings: string[] = [];

  try {
    // Check 1: Roles exist
    console.log('1️⃣  Checking roles...');
    const roles = await prisma.role.findMany();
    const expectedRoles = [
      'SUPER_ADMIN',
      'PLATFORM_ADMIN',
      'SUPPORT_ADMIN',
      'BILLING_ADMIN',
      'AUDIT_ADMIN',
      'PMC_ADMIN',
      'PROPERTY_MANAGER',
      'LEASING_AGENT',
      'MAINTENANCE_TECH',
      'ACCOUNTANT',
      'OWNER_LANDLORD',
      'TENANT',
      'VENDOR_SERVICE_PROVIDER',
    ];

    const existingRoleNames = roles.map((r) => r.name);
    const missingRoles = expectedRoles.filter((r) => !existingRoleNames.includes(r as any));

    if (missingRoles.length > 0) {
      issues.push(`Missing roles: ${missingRoles.join(', ')}`);
      console.log(`  ❌ Missing ${missingRoles.length} roles`);
    } else {
      console.log(`  ✅ All ${expectedRoles.length} roles exist`);
    }

    // Check 2: Permissions exist
    console.log('');
    console.log('2️⃣  Checking permissions...');
    const permissions = await prisma.rolePermission.findMany();
    if (permissions.length === 0) {
      issues.push('No permissions found. Run initializePermissionMatrix().');
      console.log('  ❌ No permissions found');
    } else {
      console.log(`  ✅ ${permissions.length} permissions found`);
    }

    // Check 3: User roles assigned
    console.log('');
    console.log('3️⃣  Checking user role assignments...');
    const userRoles = await prisma.userRole.findMany({
      where: { isActive: true },
    });
    if (userRoles.length === 0) {
      warnings.push('No active user roles found. Run migrate-users-to-rbac.ts');
      console.log('  ⚠️  No active user roles found');
    } else {
      console.log(`  ✅ ${userRoles.length} active user roles found`);
    }

    // Check 4: Approval requests
    console.log('');
    console.log('4️⃣  Checking approval requests...');
    const pendingApprovals = await prisma.approvalRequest.findMany({
      where: { status: 'PENDING' },
    });
    const expiredApprovals = await prisma.approvalRequest.findMany({
      where: {
        status: 'PENDING',
        expiresAt: { lte: new Date() },
      },
    });

    if (expiredApprovals.length > 0) {
      warnings.push(`${expiredApprovals.length} expired approvals need processing`);
      console.log(`  ⚠️  ${expiredApprovals.length} expired approvals found`);
    } else {
      console.log(`  ✅ No expired approvals`);
    }
    console.log(`  📊 ${pendingApprovals.length} pending approvals`);

    // Check 5: Audit logs
    console.log('');
    console.log('5️⃣  Checking audit logs...');
    const recentLogs = await prisma.rBACAuditLog.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });
    console.log(`  ✅ ${recentLogs.length} audit logs in last 24 hours`);

    // Summary
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('📊 HEALTH CHECK SUMMARY');
    console.log('═══════════════════════════════════════');

    if (issues.length > 0) {
      console.log('❌ Issues Found:');
      issues.forEach((issue) => console.log(`   - ${issue}`));
    }

    if (warnings.length > 0) {
      console.log('⚠️  Warnings:');
      warnings.forEach((warning) => console.log(`   - ${warning}`));
    }

    if (issues.length === 0 && warnings.length === 0) {
      console.log('✅ System is healthy!');
    }

    console.log('═══════════════════════════════════════');

    if (issues.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error: any) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

healthCheck();

